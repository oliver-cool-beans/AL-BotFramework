/*
    This is class unique code that is added on to the Character class on load.  
    load: Character class function added onto the Character class when starter
    loop: Functions that will be executed only for this class, every time during their while loop;
*/
export default {
    load: loadFunctions,
    //loop: loopFunctions() 
}

async function loadFunctions () {
    return Promise.resolve('OK');
}
