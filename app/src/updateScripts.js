async function updateScripts(currentVersion = null, oldVersion, updating = false) {
    var scriptProperties = PropertiesService.getScriptProperties();
    const mostRecentVersion = scriptProperties.getProperty('mostRecentVersion');
    currentVersion = getUserProperty('currentVersion');

    console.log({ currentVersion, mostRecentVersion })

    let updateText = ''

    if (!updating) { oldVersion = currentVersion; }

    if (currentVersion == mostRecentVersion) {
        console.log(`On most recent version - ${mostRecentVersion}`)
        return false
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
            return console.log(`Failed to update current version. error: ${error}`)
        }

    } else if (currentVersion == "v1.2.0") {
        currentVersion = "v1.2.1"
        setUserProperty('currentVersion', currentVersion);
        return updateScripts(currentVersion, oldVersion, true);

    } else if (currentVersion == "v1.2.1") {
        try {

            // update to 1.2.2
            addCheckinsSheet();
            syncCheckins();
            currentVersion = "v1.2.2"
            setUserProperty('currentVersion', currentVersion);
            return updateScripts(currentVersion, oldVersion, true);

        } catch (error) {
            return console.log(`Failed to update to version 1.2.2. error: ${error}`)
        }
    } else if (currentVersion == "v1.2.2") {
        try {

            addTriggers();
            addGroupsSheet();
            syncGroups();

            currentVersion = 'v1.3.0';

            setUserProperty('currentVersion', currentVersion);
            return updateScripts(currentVersion, oldVersion, true);

        } catch (error) {
            return console.log(`Failed to version 1.3.0. error: ${error}`)
        }

    } else if (currentVersion == "v1.3.0") {
        try {

            const updateListPeople = async () => {

                // tested this and works.
                const tabs = tabNamesReturn();
                createSheet(tabs.people.listPeopleTab);
                clearDataValidation(tabs.people.listTab.name)
                await syncModule(tabs.people.listTab, getLists, false)
                dataValidation(tabs.people.listTab.name)
            }


            await updateListPeople()

            currentVersion = 'v1.4.0';

            setUserProperty('currentVersion', currentVersion);
            return updateScripts(currentVersion, oldVersion, true);

        } catch (error) {
            return console.log(`Failed to update to version 1.4.0 error: ${error}`)
        }

    } else if (currentVersion == "v1.4.0") {
        try {
            currentVersion = 'v1.4.1';
            setUserProperty('currentVersion', currentVersion);
            return updateScripts(currentVersion, oldVersion, true);

        } catch (error) {
            return console.log(`Failed to update to version 1.4.1. error: ${error}`)
        }
    } else if (currentVersion == "v1.4.1") {
        try {
            // updating to fix bug in actively syncing.
            // Issue #98
            // https://github.com/coltoneshaw/Metrics-For-Ministry/issues/98
            resetFullSyncStatus()

            currentVersion = 'v1.4.2';
            setUserProperty('currentVersion', currentVersion);
            return updateScripts(currentVersion, oldVersion, true);

        } catch (error) {
            return console.log(`Failed to update to version 1.4.2. error: ${error}`)
        }
    } else if (currentVersion == "v1.4.2") {

        try {
            // version 1.4.3
            // resetting the full sync status so everyone can have their sheet fixed
            // syncing giving to add the designation tab.
            await resetFullSyncStatus()
            await syncGiving()
            currentVersion = mostRecentVersion;
            setUserProperty('currentVersion', currentVersion);
            console.log("Updated to the current version");

            console.log({
                'oldVersion': oldVersion,
                "newVersion": currentVersion
            })
            return {
                'oldVersion': oldVersion,
                "newVersion": currentVersion
            }
        } catch (error) {
            return console.log(`Failed to update current version. error: ${error}`)
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


function addCheckinsSheet() {
    let modules = getModuleUserObject();
    let tabs = tabNamesReturn();
    if (modules.check_ins) { createSheet(tabs.check_ins.checkinsTab) };

}

function addGroupsSheet() {
    let modules = getModuleUserObject();
    let tabs = tabNamesReturn();
    if (modules.groups) { createSheet(tabs.groups.groupSummaryTab) };

}