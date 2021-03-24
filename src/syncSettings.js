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

async function syncPeople(onlyUpdated = false) {
    let syncStateText = []
    const tabs = tabNamesReturn();
    let people = await pushToSheet(tabs.people.personTab, await personDataCall(onlyUpdated, tabs.people.personTab))
    syncStateText.push(`PCO People: ${people}`);
    let lists = await pushToSheet(tabs.people.listPeopleTab, await getListsWithPeople(onlyUpdated, tabs.people.listPeopleTab))
    syncStateText.push(`PCO People Lists: ${lists}`);
    await updateListTab();
    return syncStateText;
}

async function syncGiving(onlyUpdated = false) {
    const tabs = tabNamesReturn();
    let syncStateText = []
    let giving = pushToSheet(tabs.giving.donationsTab, await getGivingDonations(onlyUpdated, tabs.giving.donationsTab))
    syncStateText.push(`PCO Giving Donations: ${giving}`);

    return syncStateText;
}

async function syncCheckins(onlyUpdated = false) {
    let syncStateText = []
    const tabs = tabNamesReturn();

    let headcounts = await pushToSheet(tabs.check_ins.headcountsTab, await getHeadcountsJoinedData(onlyUpdated, tabs.check_ins.headcountsTab))
    syncStateText.push(`PCO Check in Headcounts: ${headcounts}`);

    let checkins = await pushToSheet(tabs.check_ins.checkinsTab, await getCheckIns(onlyUpdated, tabs.check_ins.checkinsTab))
    syncStateText.push(`PCO Check in Headcounts: ${checkins} -- Time: ${syncTimer}`);

    return syncStateText;
}

async function syncGroups(onlyUpdated = false) {

    let syncStateText = []

    const tabs = tabNamesReturn()
    let groupTab = tabs.groups.groupSummaryTab
    let additionalHeaders = await getGroups_tagGroups(true)
    let groups = await pushToSheet(groupTab, await getGroups(onlyUpdated, groupTab), additionalHeaders)

    syncStateText.push(`PCO Groups: ${groups}`)

    return syncStateText;

}

// todo - Look at grouping the Groups requests together to speed them up.
// todo - clean up the groups sync in the update function.
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
                        syncStateText.concat(text)
                        // TODO - Need to make this work with the promises
                        syncPercentComplete(30);

                    })
            }
            if (modules.giving) {
                await syncGiving(onlyUpdated)
                    .then(text => {
                        // TODO - Need to make this work with the promises
                        syncStateText.concat(text)
                    })


            }
            if (modules.check_ins) {
                await syncCheckins(onlyUpdated)
                    .then(text => {
                        // TODO - Need to make this work with the promises
                        syncStateText.concat(text)
                    })

            }
            if (modules.groups) {
                await syncGroups(onlyUpdated)
                    .then(text => {
                        // TODO - Need to make this work with the promises
                        syncStateText.concat(text)
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