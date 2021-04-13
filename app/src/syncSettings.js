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
    setUserProperty('syncUpdatedOnly', 'false')
    setUserProperty('syncStatus', 'ready')
    setUserProperty('syncCount', '0')
}

function getFullSyncStatus() {
    let onlyUpdatedSync = JSON.parse(getUserProperty('syncUpdatedOnly'));
    console.info({onlyUpdatedSync})
    return onlyUpdatedSync;
}

function triggerSync() {
    removeAllTriggers();
}

function getCurrentMillis() {
    const start = new Date();
    let startTime = +Number(start.getTime()).toFixed(0)
    return startTime
}


function getStartTime() {
    const syncStartTime = +getUserProperty('syncStartTime')
    console.info({syncStartTime})
}


function syncStartTime(method) {
    // checks the time start of the last sync. If it's greater than 30 minutes it'll rest the sync counter

    // this is not designed to be a sync status checker because it would limit users to one sync every 30 minutes. 

    if (method === 'set') {
        // Utilities.formatDate(new Date(person["Birthday"]), timezone, "yyyy-MM-dd"),
        setUserProperty('syncStartTime', getCurrentMillis())
    } else if (method === 'check') {
        const syncStartTime = +getUserProperty('syncStartTime')
        const currentTime = getCurrentMillis()
        // 30 minutes in milliseconds
        const thirtyMinutes = 1800000
        if ((syncStartTime + thirtyMinutes) < currentTime) {
            setUserProperty('syncStatus', 'ready')
            console.info('Reset sync status. Outside of 30 minute window.')
        } else {
            console.info('Still within 30 minutes of last sync.')
        }

        // resetting back to ready for a sync.
    } else {
        console.error(`Please use set or check values. Not ${method}`)
    }

}

async function triggerSyncDaily() {
    console.time('fullSync')
    var service = getOAuthService();
    let syncCount = +getUserProperty('syncCount');
    console.info({syncCount})

    if (service.hasAccess()) {

        // updates anything needed if they're not on the latest version.
        await updateScripts();
        userData();
        syncStartTime('check')

        if (syncCount >= 5) {
            await resetFullSyncStatus();
            setUserProperty('syncCount', '0')
            syncCount = 0;
        }

        await getOrgData();
        let updateSheet = await updateSpreadsheet(getFullSyncStatus());

        if (updateSheet === 'success') {
            syncStartTime('set')
            syncCount++;
            setUserProperty('syncCount', syncCount)
        }

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
        syncStartTime('check')

        const updateResponse = await updateSpreadsheet(updatedOnlySync);

        // make this handle the errors better
        if(updateResponse === 'success') {
            sheetsUiError('Sync completed successfully', 'You should now see each tab populated with your information! If you have any questions check out www.metricsforministry.com')
        } else if (updateResponse === 'actively syncing') {
            sheetsUiError('Actively Syncing', 'Metrics for Ministry is currently syncing. Try again in 5 minutes. If the issue persists, click Add-ons > Metrics for Ministry > Force Full Sync then attempt to sync again on the sidebar.')


        } else if (updateResponse.error) {
            console.log({ updateResponse })

            if (updateResponse.error === '403 -- You do not have access to this resource') {
                sheetsUiError('An Error occured while trying to sync', 'One or more of the modules you selected you do not have access to. Verify your Planning Center Account has access to all the modules enabled under Info > Modules Enabled.')
            } else {
                sheetsUiError('An Error occured while trying to sync', JSON.stringify(updateResponse.error))
            }
        } else {
            
            sheetsUiError("Something has gone wrong", "It appears that something has gone wrong. Refresh the page and try again. If the issue still persists email hello@savvytoolbelt.com with a description of the issue and a timestamp of when you tried to sync.")
        }
    }

}

async function syncModule(tabInfo, getDataFunction, onlyUpdated, additionalHeaders) {

    const apiCall = await getDataFunction(onlyUpdated, tabInfo)

    let { data, status } = apiCall

    // updating the data with
    if (tabInfo.name === 'Lists') { data = await updateListTab(data) }
    let sheet_status = pushToSheet(tabInfo, data, additionalHeaders)
    const { message: api_status, sync_total, type } = status

    let object = {
        api_status,
        sheet_status,
        type,
        total_length: sync_total
    }

    return object
}

async function initialListSync() {
    const tabs = tabNamesReturn();

    await syncModule(tabs.people.listTab, getLists, false)
    dataValidation(tabs.people.listTab.name)

}

async function syncPeople(onlyUpdated = false) {
    let syncStateText = {}
    const tabs = tabNamesReturn();

    const syncPeopleData = async (onlyUpdated, tabs) => {
        let object = await syncModule(tabs.people.personTab, personDataCall, onlyUpdated)
        Object.assign(syncStateText, { people: object })
    }

    const syncPeopleLists = async (onlyUpdated, tabs) => {
        let object = await syncModule(tabs.people.listPeopleTab, getListsWithPeople, onlyUpdated)
        Object.assign(syncStateText, { listPeople: object })
    }

    // need to have this properly use the getListsFunSheet function.
    const syncLists = async (onlyUpdated = false, tabs) => {
        let object = await syncModule(tabs.people.listTab, getLists, onlyUpdated)
        dataValidation(tabs.people.listTab.name)
        Object.assign(syncStateText, { lists: object })
    }


    await syncPeopleData(onlyUpdated, tabs);
    await syncLists(undefined, tabs)
    await syncPeopleLists(onlyUpdated, tabs)

    console.log(syncStateText)

    return syncStateText;
}

async function syncGiving(onlyUpdated = false) {
    const tabs = tabNamesReturn();
    let syncStateText = {}


    const syncDonations = async (onlyUpdated, tabs) => {
        let object = await syncModule(tabs.giving.donationsTab, getGivingDonations, onlyUpdated)
        Object.assign(syncStateText, { donations: object })
    }

    await syncDonations(onlyUpdated, tabs)

    console.log(syncStateText)
    return syncStateText;
}

async function syncCheckins(onlyUpdated = false) {
    let syncStateText = {}
    const tabs = tabNamesReturn()

    const syncHeadcounts = async (onlyUpdated, tabs) => {
        let object = await syncModule(tabs.check_ins.headcountsTab, getHeadcountsJoinedData, onlyUpdated)
        Object.assign(syncStateText, { headcounts: object })
    }

    const syncCheckins = async (onlyUpdated, tabs) => {
        let object = await syncModule(tabs.check_ins.checkinsTab, getCheckIns, onlyUpdated)
        Object.assign(syncStateText, { checkins: object })

    }

    await syncHeadcounts(onlyUpdated, tabs)
    await syncCheckins(onlyUpdated, tabs)

    console.log(syncStateText)

    return syncStateText;
}

async function syncGroups(onlyUpdated = false) {

    let syncStateText = {}
    const tabs = tabNamesReturn()

    const syncGroups = async (onlyUpdated, tabs) => {
        let additionalHeaders = await getGroups_tagGroups(true)
        let object = await syncModule(tabs.groups.groupSummaryTab, getGroups, onlyUpdated, additionalHeaders)
        Object.assign(syncStateText, { groups: object })


    }
    await syncGroups(onlyUpdated, tabs)

    console.log(syncStateText)

    return syncStateText;

}

async function updateSpreadsheet(onlyUpdated) {
    let syncStatus = getUserProperty('syncStatus')
    console.log({onlyUpdated})

    if (syncStatus == "ready") {
        let syncStateText = {};
        syncPercentComplete(0)
        try {
            setUserProperty('syncStatus', "syncing")
            const tabs = tabNamesReturn();

            let modules = getModuleUserObject();

            if (modules.people) {
                await syncPeople(onlyUpdated)
                    .then(text => {
                        Object.assign(syncStateText, { people: text })
                        syncPercentComplete(25)
                    })

            }
            if (modules.giving) {
                await syncGiving(onlyUpdated)
                    .then(text => {
                        // TODO - Need to make this work with the promises
                        Object.assign(syncStateText, { giving: text })
                        syncPercentComplete(25)
                    })


            }
            if (modules.check_ins) {
                await syncCheckins(onlyUpdated)
                    .then(text => {
                        // TODO - Need to make this work with the promises
                        Object.assign(syncStateText, { checkins: text })
                        syncPercentComplete(25)
                    })
            }
            if (modules.groups) {
                await syncGroups(onlyUpdated)
                    .then(text => {
                        // TODO - Need to make this work with the promises
                        Object.assign(syncStateText, { groups: text })
                        syncPercentComplete(25)
                    })
            }

            if (modules.calendar || modules.services) {
                // these are currently unsupported
            }


            setUserProperty('syncStatus', "ready");
            setLastSyncTime();
            console.log(syncStateText)
            setUserProperty('syncUpdatedOnly', 'true')
            setUserProperty('lastSyncStatus', JSON.stringify(syncStateText))

            return 'success'

        } catch (error) {
            setUserProperty('syncStatus', "ready");

            console.log(error)
            return {
                'error': error,
                'text': syncStateText
            }

        }


    } else {
        console.log("actively syncing.")

        return 'actively syncing'
    }

}