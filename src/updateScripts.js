function updateScripts(currentVersion = null, oldVersion, updating = false) {
    var scriptProperties = PropertiesService.getScriptProperties();
    const mostRecentVersion = scriptProperties.getProperty('mostRecentVersion');
    currentVersion = getUserProperty('currentVersion');

    //console.log(currentVersion);

    //version = currentVersion;

    if (!updating) { oldVersion = currentVersion; }

    if (currentVersion == mostRecentVersion) {
        console.log(`On most recent version - ${mostRecentVersion}`)
        return false;
    } else if (currentVersion == "v1.0.9") {
        // changes made in the sheet names require these to be automatically updated.
        updateSheetNames();

        //syncing Giving to include the  new Date Column.
        syncGiving();

        currentVersion = "v1.1.0"
        setUserProperty('currentVersion', currentVersion);

        return updateScripts(currentVersion, oldVersion, true);
    } else if (currentVersion == "v1.1.0") {
        try {
            // implemeted for the 5 day sync reset counter. Issue #52
            // https://github.com/coltoneshaw/Metrics-For-Ministry/issues/52
            addTriggers();
            setUserProperty('syncCount', '0')

            currentVersion = "v1.2.0";

            setUserProperty('currentVersion', currentVersion);
            return updateScripts(currentVersion, oldVersion, true);
        } catch (error) {
            console.log(`Failed to update current version. error: ${error}`)
        }

    } else if(currentVersion == "v1.2.0") {

        // most recent version - v1.2.1
        console.log("Updated to the current version");

        currentVersion = mostRecentVersion;

        setUserProperty('currentVersion', currentVersion);

        return {
            'oldVersion': oldVersion,
            "newVersion": mostRecentVersion

        }
    } else {
        currentVersion = "v1.0.9"
        setUserProperty('currentVersion', currentVersion);
        oldVersion = "v1.0.9";

        return updateScripts(currentVersion, oldVersion, true);
    }

}

function update() {
    setUserProperty('currentVersion', 'null');
}


function updateSheetNames() {
    const tabs = tabList();
    const spreadsheet = getDefaultSpreadsheetId();

    if (tabs.includes('people_personTab')) { spreadsheet.getSheetByName("people_personTab").setName("People") };
    if (tabs.includes('people_listTab')) { spreadsheet.getSheetByName("people_listTab").setName("Lists") };
    if (tabs.includes('people_listPersonTab')) { spreadsheet.getSheetByName("people_listPersonTab").setName("List Data") };
    if (tabs.includes('checkIns_headcounts')) { spreadsheet.getSheetByName("checkIns_headcounts").setName("Headcounts") };
    if (tabs.includes('giving_donationsTab')) { spreadsheet.getSheetByName("giving_donationsTab").setName("Donations") };
}



