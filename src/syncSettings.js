function dailySyncAdd() {
    //creating a trigger to run at noon
    ScriptApp.newTrigger("triggerSyncDaily")
        .timeBased()
        .atHour(23)
        .everyDays(1)
        .create();
}

function triggerSyncDaily() {
    let isSignedIn = getUserProperty('isSignedIn');
    var service = getOAuthService();


    if (isSignedIn == "true" && service.hasAccess()) {
        updateSpreadsheet(true);
    } else {
        Logger.log("No sync right now");
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



function dailySyncRemove() {
    const dailySyncStatus = getUserProperty("DailySyncTrigger");

    if (dailySyncStatus == "true") {
        // Loop over all triggers and delete them
        var allTriggers = ScriptApp.getProjectTriggers();
        for (var i = 0; i < allTriggers.length; i++) {
            ScriptApp.deleteTrigger(allTriggers[i]);
        }
        setUserProperty("DailySyncTrigger", "false");
    }

}

function updateSpreadsheetFromSidebar(){
    let updatedOnlySync = JSON.parse(getUserProperty('syncUpdatedOnly'));
    console.log(updatedOnlySync);
    updateSpreadsheet(updatedOnlySync);
}


async function updateSpreadsheet(onlyUpdated) {
    let syncStatus = getUserProperty('syncStatus')
    //let onlyUpdated = true;

    if (syncStatus == "ready") {
        let syncStateText = [];
        try{
            setUserProperty('syncStatus', "syncing")
            const tabs = tabNamesReturn();
    
            let modules = getModuleUserObject();
    
            if (modules.people) {
    
                //pushToSheet(tabs.people.campusTab.name, await getCampuses());
                syncPercentComplete(0)
                syncPercentComplete(10)
    
                //let peopleSync = pushToSheet(tabs.people.personTab, await personDataCall());

                let peopleSync = pushToSheet(tabs.people.personTab, await personDataCall(onlyUpdated, tabs.people.personTab));

                
                syncStateText.push(`PCO People: ${peopleSync}`)

                syncPercentComplete(30);

                let peopleListSync = pushToSheet(tabs.people.listPeopleTab, await getListsWithPeople(onlyUpdated, tabs.people.listPeopleTab));
                syncStateText.push(`PCO People Lists: ${peopleListSync}`)

                syncPercentComplete(60);
                await updateListTab();

                syncPercentComplete(70);
    
                //dataValidation(tabs.people.listTab.name);
            }
            if (modules.check_ins) {
                let headcountsSync = pushToSheet(tabs.check_ins.headcountsTab, await getCheckInsData(onlyUpdated, tabs.check_ins.headcountsTab));
                syncStateText.push(`PCO Check in Headcounts: ${headcountsSync}`)
                syncPercentComplete(80);
    
            }
            if (modules.giving) {
                let donations = pushToSheet(tabs.giving.donationsTab, await getGivingDonations(onlyUpdated, tabs.giving.donationsTab));
                syncStateText.push(`PCO Giving Donations: ${donations}`)

                syncPercentComplete(90);
    
            }
            if (modules.groups) {
    
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
        } catch(err){
            console.log(err)
            console.log(syncStateText);
            setUserProperty('syncStatus', "ready");
        }
        

    } else {
        console.log("actively syncing.")
    }

}