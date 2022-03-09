/*
    A class responsible for pulling common data for use of the entire party
    Usually from external API's.
*/
import fetch from "node-fetch"

class DataPool {
    constructor(){
        this.aldata = null
        this.isRunning = true;
        this.initialised = false;
        this.monsters = ['franky']
        this.refreshLoop();
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
    
    async refreshLoop(){
        while(this.isRunning){
            await new Promise(resolve => setTimeout(resolve, this.initialised ? 60000 : 1000));
            console.log("Refreshing AL Data")
            if(!this.initialised) this.initialised = true;
            this.isRunning && await this.refreshALData();
            console.log("DATA IS NOW", this.aldata)
        }
    }
}

export default DataPool;