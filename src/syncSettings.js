function dailySyncAdd() {
    //creating a trigger to run at noon
    ScriptApp.newTrigger("triggerSync")
        .timeBased()
        .atHour(23)
        .everyDays(1)
        .create();

}

function triggerSync() {
    let isSignedIn = getUserProperty('isSignedIn');
    var service = getOAuthService();


    if (isSignedIn == "true" && service.hasAccess()) {

        updateSpreadsheet();
        //updating the last sync time
        setLastSyncTime();

        //setting a property to confirm that we have sync'd and are not ready to sync.

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