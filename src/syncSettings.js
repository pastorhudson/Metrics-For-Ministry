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
}

function getFullSyncStatus() {
    let syncStatus = JSON.parse(getUserProperty('syncUpdatedOnly'));
    console.log(syncStatus)
    return syncStatus;
}

function triggerSync(){
    removeAllTriggers();
}

async function triggerSyncDaily() {
    //let isSignedIn = getUserProperty('isSignedIn');
    var service = getOAuthService();
    let syncCount = +getUserProperty('syncCount');
    console.log(syncCount)

    if (service.hasAccess()) {

        // updates anything needed if they're not on the latest version.
        await updateScripts();
        userData();

        if(syncCount == 5){
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

    if(isAuthValid()){
        await updateScripts();
        let updatedOnlySync = getFullSyncStatus();
        userData();

        const updateResponse = await updateSpreadsheet(updatedOnlySync);

        if(updateResponse != 'success'){
            sheetsUiError('An Error occured while trying to sync',updateResponse.text)
        }

        
    } else {
        sheetsUiError("Not Signed In","It appears that you're not signed in. Try to Authorize again. If the issue persists email hello@savvytoolbelt.com for help.")
    }

}

async function syncPeople(onlyUpdated = false) {
    const tabs = tabNamesReturn();
    pushToSheet(tabs.people.personTab, await personDataCall(onlyUpdated, tabs.people.personTab));
    pushToSheet(tabs.people.listPeopleTab, await getListsWithPeople(onlyUpdated, tabs.people.listPeopleTab));
    await updateListTab();
}

async function syncGiving(onlyUpdated = false) {
    const tabs = tabNamesReturn();
    pushToSheet(tabs.giving.donationsTab, await getGivingDonations(onlyUpdated, tabs.giving.donationsTab));
}

async function syncCheckins(onlyUpdated = false) {
    const tabs = tabNamesReturn();
    pushToSheet(tabs.check_ins.headcountsTab, await getHeadcountsJoinedData(onlyUpdated, tabs.check_ins.headcountsTab));
    pushToSheet(tabs.check_ins.checkinsTab, await getCheckIns(onlyUpdated, tabs.check_ins.checkinsTab));
}

async function syncGroups(onlyUpdated = false) {
    const tabs = tabNamesReturn();

    let groupTab = tabs.groups.groupSummaryTab;

    let additionalHeaders = await getGroups_tagGroups(true);
    pushToSheet(groupTab, await getGroups(onlyUpdated, groupTab), additionalHeaders);
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

                //pushToSheet(tabs.people.campusTab.name, await getCampuses());
                syncPercentComplete(0)
                let peopleSync = pushToSheet(tabs.people.personTab, await personDataCall(onlyUpdated, tabs.people.personTab));
                syncStateText.push(`PCO People: ${peopleSync}`)
                syncPercentComplete(15)
                let peopleListSync = pushToSheet(tabs.people.listPeopleTab, await getListsWithPeople(onlyUpdated, tabs.people.listPeopleTab));
                syncStateText.push(`PCO People Lists: ${peopleListSync}`)

                await updateListTab();
                syncPercentComplete(30);

                //dataValidation(tabs.people.listTab.name);
            }
            if (modules.check_ins) {
                let headcountsSync = pushToSheet(tabs.check_ins.headcountsTab, await getHeadcountsJoinedData(onlyUpdated, tabs.check_ins.headcountsTab));
                syncPercentComplete(40);
                
                syncStateText.push(`PCO Check in Headcounts: ${headcountsSync}`);

                let checkinsSync = pushToSheet(tabs.check_ins.checkinsTab, await getCheckIns(onlyUpdated, tabs.check_ins.checkinsTab));

                syncStateText.push(`PCO Check in Headcounts: ${checkinsSync}`);
                
                syncPercentComplete(50);

            }
            if (modules.giving) {
                let donations = pushToSheet(tabs.giving.donationsTab, await getGivingDonations(onlyUpdated, tabs.giving.donationsTab));
                syncStateText.push(`PCO Giving Donations: ${donations}`)

                syncPercentComplete(80);

            }
            if (modules.groups) {
                let groupTab = tabs.groups.groupSummaryTab;
                let additionalHeaders = await getGroups_tagGroups(true);
                
                let groups = pushToSheet(groupTab, await getGroups(false, groupTab), additionalHeaders);
                syncStateText.push(`PCO Groups: ${groups}`)

                syncPercentComplete(100);
            }
            if (modules.calendar) {

            }
            if (modules.services) {

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
                'text' : syncStateText
            }
            
        }


    } else {
        console.log("actively syncing.")
    }

}