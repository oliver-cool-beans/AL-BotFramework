/*
    A class responsible for pulling common data for use of the entire party
    Usually from external API's.
*/
import moment from "moment";
import fetch from "node-fetch"

class DataPool {
    constructor(allCharacters){
        const {ALDATA_KEY} = process.env

        this.aldata = null
        this.isRunning = true;
        this.initialised = false;
        this.monsters = ['franky']
        this.refreshLoop();
        this.bankDataLoop();
        this.lastSent = {
            bankData: null
        }
        this.allCharacters = allCharacters;
        this.ALDataKey = ALDATA_KEY; // Key required to authenticate with ALData
    }

    async refreshALData(){
        const url = "https://aldata.earthiverse.ca/monsters/" + this.monsters.join(",")
        const response = await fetch(url)
        if(response.status == 200) {
          this.aldata = await response.json()
        }else{
            this.aldata = null
        }
        return
    }

    stopDataPool(){
        this.isRunning = false;
    }
    
    async bankDataLoop(){
        while(this.isRunning){
            await new Promise(resolve => setTimeout(resolve, 1000));
            if(!this.isRunning) continue;
            const memberWithBank = this.allCharacters.find((char) => char.character && char.character.bank)
            if(!memberWithBank) continue;
            await this.sendALBankData(memberWithBank.character.bank, memberWithBank.character.owner).catch((error) => {
                console.log("Failed to send AL data", error)
            })
        }
    }

    async refreshLoop(){
        while(this.isRunning){
            await new Promise(resolve => setTimeout(resolve, this.initialised ? 60000 : 1000));
            console.log("Refreshing AL Data")
            if(!this.initialised) this.initialised = true;
            try{
                this.isRunning && await this.refreshALData();
            }catch(error){
                console.log("ERROR REFRESHING DATA", error)
            }
        }
    }

    async sendALBankData(bankData, owner){
        if(!this.ALDataKey) return Promise.reject("No ALData Key configured");
        if(!this.minutesPassed(this.lastSent.bankData, 25)) {
            return false;
        }

        const url = `https://aldata.earthiverse.ca/bank/${owner}/${this.ALDataKey}`

        const settings = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bankData)
        };

        this.lastSent.bankData = moment();

        return await fetch(url, settings).then((response) => {
            if(response.status == 200) {
            }else{
                  this.aldata = null
              }
        }).catch((error) => {
            console.log("Error uploading bank data", error)
            return Promise.reject();
        })

    }

    minutesPassed(lastTime, minutes){
        if(!lastTime) return true;
        const duration = moment.duration(moment().diff(lastTime));
        const minsPassed = parseInt(duration.asMinutes());
        if(minsPassed < minutes) return false;
        return true;
    }
}

export default DataPool;