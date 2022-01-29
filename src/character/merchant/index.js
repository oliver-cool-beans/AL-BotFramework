/*
    This is class unique code that is added on to the Character class on load.  
    load: Character class function added onto the Character class when starter
    loop: Functions that will be executed only for this class, every time during their while loop;
*/

export default {
    load: loadFunctions
}

async function loadFunctions () {
    this.queue = []
    this.scriptName = "merchant"
    this.getQueue = getQueue
    this.queueTask = queueTask
    this.runQueue = runQueue
    this.purchaseBuyOrder = purchaseBuyOrder
    this.deliverBuyOrder = deliverBuyOrder
    this.processStoreOrder = processStoreOrder
    this.runTasks = runTasks
    return
}

async function runTasks(force) {
    if(!this.isRunning) await this.start()
    await scheduler.apply(this)
    return Promise.resolve("Finished")
}

function getQueue() {
    return this.queue
}

function queueTask(task = {}, pushToFront) {
    console.log("Someone has queued task", task)
    if(!task.character || !task.buy) return false;
    task.id = Math.random().toString(16).substring(2, 8);
    task.status = 'queued';
    task.createdAt = new Date().toISOString();
    this.queue[pushToFront ? 'unshift' : 'push'](task);
    return task;
}

async function runQueue() {
    var tasks;
    console.log("Merchant processing tasks:", this.queue.length )
    console.log("Purchasing Buy Orders")
    tasks = await Promise.all(this.queue.map(async (task) => {
        if(task.buy) await this.purchaseBuyOrder(task).catch((error) =>{
            task.status = 'failed'
            console.log("BUY ORDER FAILED?", error)
        } );
        return Promise.resolve(task);
    }));

  console.log("Delivering Buy Orders")
    tasks = await Promise.all(tasks.map(async (task) => {
        if(task.buy) {
            await this.deliverBuyOrder(task).catch((error) => {
            console.log("THIS TASK FAILED?", error)
            task.status = 'failed'});
        }
        return task;
    }));
    this.queue = [];
}

async function purchaseBuyOrder(task){
    if(!task?.buy) return Promise.reject("Invalid Task");
    await Promise.all(Object.entries(task.buy).map(async ([key, value]) => {
        await this.character.smartMove("main").catch(() => {});
        if(this.character.canBuy(key)){
            await this.character.buy(key, value).catch(() => {});
            console.log("Merchant just processed buy order:", "purchased", key, "QTY:", value);
            return Promise.resolve("Complete");
        }
        return Promise.reject("Failed to buy");
    }));
}

async function deliverBuyOrder(task){
    console.log("MOVING")
    await this.character.smartMove(task.character).catch(() => {});a
    while(this.character.moving){
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for anyone elses jobs to come in
    }
    await Promise.all(Object.entries(task.buy).map(async ([key, value]) => {
        const itemPosition = this.character.locateItem(key);
        await this.character.sendItem(task.character.id, itemPosition?.length ? itemPosition[0] : itemPosition, value).catch(async () => {
            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds for anyone elses jobs to come in
            return await this.character.sendItem(task.character.id, itemPosition?.length ? itemPosition[0] : itemPosition, value)
        })

    }));
}

async function processStoreOrder(task){
    await Promise.all(Object.entries(task).map(([key, value]) => {
        // Navigate to character
        // Trade items from character
        // Store items in bank
    }));
}