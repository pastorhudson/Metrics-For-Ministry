function updateScripts(version = null, oldVersion, updating = false){
    var scriptProperties = PropertiesService.getScriptProperties();
    const mostRecentVersion = scriptProperties.getProperty('mostRecentVersion');
    let currentVersion = getUserProperty('currentVersion');

    console.log(currentVersion);

    while (currentVersion != mostRecentVersion) {
        version = currentVersion;
        if(!updating){oldVersion = currentVersion;}
        

        if (version == "v1.0.9"){
            // changes made in the sheet names require these to be automatically updated.
            updateSheetNames();

            //syncing Giving to include the  new Date Column.
            syncGiving();

            version = "v1.1.0"
            setUserProperty('currentVersion', version);

            return updateScripts(version, oldVersion, true);
        } else if(version == "v1.1.0"){
            // most recent version.
            try{

                // implemeted for the 5 day sync reset counter. Issue #52
                // https://github.com/coltoneshaw/Metrics-For-Ministry/issues/52
                addTriggers();
                setUserProperty('syncCount', '0')

                version = "v1.2.0";

                setUserProperty('currentVersion', mostRecentVersion);
                console.log("Updated to the current version")
                return {
                    'oldVersion': oldVersion,
                    "newVersion": mostRecentVersion
                }
            } catch(err){
                console.log('Failed to update current version.')
            }
            return updateScripts(version, oldVersion, true);
        }else {
            version = "v1.0.9"
            setUserProperty('currentVersion', version);
            oldVersion = "v1.0.9";
            
            return updateScripts(version, oldVersion, true);
        }
    } 

    console.log(`On most recent version - ${mostRecentVersion}`)
    return false;

 
}

function update(){
  setUserProperty('currentVersion', 'null');
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



