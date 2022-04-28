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
        this.monsters = ['franky', 'snowman']
        this.refreshLoop();
        this.bankDataLoop();
        this.achievementLoop();
        this.bankData = {}
        this.lastSent = {
            bankData: null,
            achievementData: null
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
            const memberWithBank = this.allCharacters.find((char) => char.character && char.character.bank && Object.keys(char.character.bank).length > 1)
            if(!memberWithBank) continue;
            this.bankData = memberWithBank.character.bank
            await this.sendALData(memberWithBank.character.bank, 'bank', memberWithBank.character.owner, 25, 'bankData').catch((error) => {
                console.log("Failed to send AL data", error)
            })
        }
    }

    async achievementLoop(){
        while(this.isRunning){
            await new Promise(resolve => setTimeout(resolve, 10000));
            if(!this.isRunning) continue;
            if(!this.minutesPassed(this.lastSent['achievementData'], 15)) continue;

            const memberWithSocket = this.allCharacters.find((char) => char?.character?.ready);
            if(!memberWithSocket) continue

            // Subscribe to tracker event
            memberWithSocket.character.socket.once("tracker", (data) => {
                const payload = { max: data.max, monsters: data.monsters }
                this.sendALData(payload, 'achievements', memberWithSocket.character.id, 15, 'achievementData').catch((error) => {
                    console.log("Error sending achievement data", error)
                });
            });

            // Emit tracker event for the above subscribe to action
            memberWithSocket.character.socket.emit("tracker")
        }
    }

    async refreshLoop(){
        while(this.isRunning){
            await new Promise(resolve => setTimeout(resolve, this.initialised ? 15000 : 1000));
            console.log("Refreshing AL Data")
            if(!this.initialised) this.initialised = true;
            try{
                this.isRunning && await this.refreshALData();
            }catch(error){
                console.log("ERROR REFRESHING DATA", error)
            }
        }
    }

    async sendALData(payload, endpoint, owner, minutes, dataKey){
        if(!this.ALDataKey) return Promise.reject("No ALData Key configured");
        console.log("last sent", endpoint, this.lastSent[dataKey], dataKey, minutes)
        if(!this.minutesPassed(this.lastSent[dataKey], minutes)) {
            return false;
        }

        console.log("Sending AL data for", endpoint);

        const url = `https://aldata.earthiverse.ca/${endpoint}/${owner}/${this.ALDataKey}`

        const settings = {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        };

        this.lastSent[dataKey] = moment();

        return await fetch(url, settings).then((response) => {
            console.log("RESPONSE FROM", endpoint, response)
            return response
        }).catch((error) => {
            console.log("Error uploading AL data", error)
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