function userData() {
    let userEmail = Session.getActiveUser().getEmail();
    let organization = getUserProperty('org_name')
    let totalSheetUsage = getUserProperty('totalPercentUsed');
    let modulesEnabled = getUserProperty('enabledModules');
    let currentVersion = getUserProperty('currentVersion');
    let lastSync = getUserProperty('lastSyncTimeISOString')

    let userReport =
        `
        Email: ${userEmail}
        Organization: ${organization}
        Total Usage: ${totalSheetUsage}%
        Modules Enabled: ${modulesEnabled}
        Version: ${currentVersion}
        Last Sync: ${lastSync}
        `
    

    console.log(userReport)

    let userReportJSON = {
        userEmail,
        organization,
        totalSheetUsage,
        modulesEnabled,
        currentVersion,
        lastSync
    }

    return userReportJSON

}