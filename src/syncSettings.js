function addTriggers() {
    removeAllTriggers();
    dailySyncAdd();

}

function removeAllTriggers() {
    var allTriggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < allTriggers.length; i++) {
        ScriptApp.deleteTrigger(allTriggers[i]);
    }
}

function dailySyncAdd() {
    //creating a trigger to run at noon
    ScriptApp.newTrigger("triggerSyncDaily")
        .timeBased()
        .atHour(3)
        .nearMinute(45)
        .everyDays(1)
        .create();
}

function resetFullSyncStatus() {
    setUserProperty('syncUpdatedOnly', 'false');
    setUserProperty('syncStatus', 'ready')
}

function getFullSyncStatus() {
    let syncStatus = JSON.parse(getUserProperty('syncUpdatedOnly'));
    console.log(syncStatus)
    return syncStatus;
}

function triggerSync() {
    removeAllTriggers();
}

async function triggerSyncDaily() {
    console.time('fullSync')
    //let isSignedIn = getUserProperty('isSignedIn');
    var service = getOAuthService();
    let syncCount = +getUserProperty('syncCount');
    console.log(syncCount)

    if (service.hasAccess()) {

        // updates anything needed if they're not on the latest version.
        await updateScripts();
        userData();

        if (syncCount == 5) {
            await resetFullSyncStatus();
            setUserProperty('syncCount', '0')
        }
        let updatedOnlySync = getFullSyncStatus();
        console.log(updatedOnlySync);
        await getOrgData();
        await updateSpreadsheet(updatedOnlySync);
        syncCount++;
        setUserProperty('syncCount', syncCount)

    } else {
        console.log('Trigger Sync Daily: The user does not have access.');
    }

    console.timeEnd('fullSync')
}


function setLastSyncTime() {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate();
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    var dateTime = date + ' ' + time;
    setUserProperty("lastSyncTime", dateTime);
    setUserProperty("lastSyncTimeISOString", today.toISOString())
}

async function updateSpreadsheetFromSidebar() {

    if (isAuthValid()) {
        await updateScripts();
        let updatedOnlySync = getFullSyncStatus();
        userData();

        const updateResponse = await updateSpreadsheet(updatedOnlySync);

        if (updateResponse != 'success') {
            sheetsUiError('An Error occured while trying to sync', updateResponse.text)
        }


    } else {
        sheetsUiError("Not Signed In", "It appears that you're not signed in. Try to Authorize again. If the issue persists email hello@savvytoolbelt.com for help.")
    }

}

async function syncModule(tabInfo, getDataFunction, onlyUpdated, additionalHeaders){

    const apiCall = await getDataFunction(onlyUpdated, tabInfo)

    let {data, status} = apiCall

    // updating the data with
    if(tabInfo.name === 'Lists') {data = await updateListTab(data)}
    let sheet_status = pushToSheet(tabInfo, data, additionalHeaders)
    const {message: api_status, sync_total, type} = status

    let object = {
        api_status,
        sheet_status,
        type,
        total_length: sync_total
    }

    return object
}

async function syncPeople(onlyUpdated = true) {
    let syncStateText = []
    const tabs = tabNamesReturn();

    const syncPeopleData = async (onlyUpdated,tabs) => {
        let object = await syncModule(tabs.people.personTab, personDataCall, onlyUpdated)
        syncStateText.push({people: object});
    }

    const syncPeopleLists = async (onlyUpdated,tabs) => {
        let object = await syncModule(tabs.people.listPeopleTab, getListsWithPeople, onlyUpdated)
        syncStateText.push({listPeople: object});
    }

    // need to have this properly use the getListsFunSheet function.
    const syncLists = async (onlyUpdated = false, tabs) => {
        let object = await syncModule(tabs.people.listTab, getLists, onlyUpdated)
        dataValidation(tabs.people.listTab.name)
        syncStateText.push({lists: object});
    }


    await syncPeopleData(onlyUpdated,tabs);
    await syncLists(undefined, tabs)
    await syncPeopleLists(onlyUpdated, tabs)
    
    console.log(syncStateText)

    return syncStateText;
}

async function syncGiving(onlyUpdated = false) {
    const tabs = tabNamesReturn();
    let syncStateText = []


    const syncDonations = async (onlyUpdated,tabs) => {
        let object = await syncModule(tabs.giving.donationsTab, getGivingDonations, onlyUpdated)
        syncStateText.push({donations: object});
    }

    await syncDonations(onlyUpdated, tabs)

    console.log(syncStateText)
    return syncStateText;
}

async function syncCheckins(onlyUpdated = false) {
    let syncStateText = []
    const tabs = tabNamesReturn()

    const syncHeadcounts = async (onlyUpdated,tabs) => {
        let object = await syncModule(tabs.check_ins.headcountsTab, getHeadcountsJoinedData, onlyUpdated)
        syncStateText.push({headcounts: object});
    }

    const syncCheckins = async (onlyUpdated,tabs) => {
        let object = await syncModule(tabs.check_ins.checkinsTab, getCheckIns, onlyUpdated)
        syncStateText.push({checkins: object});
    }

    await syncHeadcounts(onlyUpdated,tabs)
    await syncCheckins(onlyUpdated,tabs)
    
    console.log(syncStateText)

    return syncStateText;
}

async function syncGroups(onlyUpdated = false) {

    let syncStateText = []
    const tabs = tabNamesReturn()

    const syncGroups = async (onlyUpdated,tabs) => {
        let additionalHeaders = await getGroups_tagGroups(true)
        let object = await syncModule(tabs.groups.groupSummaryTab, getGroups, onlyUpdated, additionalHeaders)
        syncStateText.push({groups: object});
    }
    // let groupTab = tabs.groups.groupSummaryTab
    // let additionalHeaders = await getGroups_tagGroups(true)
    // let groups = await pushToSheet(groupTab, await getGroups(onlyUpdated, groupTab), additionalHeaders)

    // syncStateText.push(`PCO Groups: ${groups}`)
    await syncGroups(onlyUpdated, tabs)

    console.log(syncStateText)

    return syncStateText;

}

async function updateSpreadsheet(onlyUpdated) {
    let syncStatus = getUserProperty('syncStatus')

    if (syncStatus == "ready") {
        let syncStateText = [];
        try {
            setUserProperty('syncStatus', "syncing")
            const tabs = tabNamesReturn();

            let modules = getModuleUserObject();

            if (modules.people) {
                await syncPeople(onlyUpdated)
                    .then(text => {
                        syncStateText.push(...text)
                        // TODO - Need to make this work with the promises
                        syncPercentComplete(30);

                    })
            }
            if (modules.giving) {
                await syncGiving(onlyUpdated)
                    .then(text => {
                        // TODO - Need to make this work with the promises
                        syncStateText.push(...text)
                    })


            }
            if (modules.check_ins) {
                await syncCheckins(onlyUpdated)
                    .then(text => {
                        // TODO - Need to make this work with the promises
                        syncStateText.push(...text)
                    })

            }
            if (modules.groups) {
                await syncGroups(onlyUpdated)
                    .then(text => {
                        // TODO - Need to make this work with the promises
                        syncStateText.push(...text)
                    })
            }

            if (modules.calendar || modules.services) {
                // these are currently unsupported
            }


            syncPercentComplete(100);
            setUserProperty('syncStatus', "ready");
            setLastSyncTime();
            console.log(syncStateText);
            setUserProperty('syncUpdatedOnly', 'true')

            return 'success'

        } catch (error) {
            setUserProperty('syncStatus', "ready");

            // need to look into throwing an error here if the sync fails.
            console.log(error)
            console.log(syncStateText);

            return {
                'error': error,
                'text': syncStateText
            }

        }


    } else {
        console.log("actively syncing.")
    }

}