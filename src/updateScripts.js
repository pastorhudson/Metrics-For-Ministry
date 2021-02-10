function updateScripts(version = null){

    version = getUserProperty('currentVersion')
    var scriptProperties = PropertiesService.getScriptProperties();
    const mostRecentVersion = scriptProperties.getProperty('mostRecentVersion');

    console.log(version)

    if(version == mostRecentVersion){
        setUserProperty('currentVersion', mostRecentVersion);
        console.log("updated to current")
        return "complete"
        
    } else if (version == "v1.0.9"){
        version = "v1.1.0"
        setUserProperty('currentVersion', version);
        updateSheetNames();
        return updateScripts(version);
    } else {
        version = "v1.0.9"
        setUserProperty('currentVersion', version);
        //
        return updateScripts(version);
    }
}

// function updates(){
//     //updateScripts();
//     setUserProperty('currentVersion', 'null');
// }

function updatedThings(){
    var files = DriveApp.getFilesByName('Planning Center Data');
    let stuff = files.getAccess('hello@savvytoolbelt.com') 
    console.log(stuff);
}

function updateSheetNames(){
    const tabs = tabList();
    const spreadsheet = getDefaultSpreadsheetId();

    if(tabs.includes('people_personTab')) {spreadsheet.getSheetByName("people_personTab").setName("People")}; 
    if(tabs.includes('people_listTab')) {spreadsheet.getSheetByName("people_listTab").setName("Lists")}; 
    if(tabs.includes('people_listPersonTab')) {spreadsheet.getSheetByName("people_listPersonTab").setName("List Data")}; 
    if(tabs.includes('checkIns_headcounts')) {spreadsheet.getSheetByName("checkIns_headcounts").setName("Headcounts")}; 
    if(tabs.includes('giving_donationsTab')) {spreadsheet.getSheetByName("giving_donationsTab").setName("Donations")}; 
}


