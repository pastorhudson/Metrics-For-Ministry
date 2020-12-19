/*********************************************
 * List of all possible User Properties
 *
 * @param {string} propertyName - purpose.
 * @param {string} activeSpreadsheetID - purpose.
 * @param {string} requestedModules - this is during the initial auth request. 
 * @param {string} enabledModules - Once the user is authorized the values from requestedModules get passed to here.
 * @param {string} isPcoGivingEnabled - 
 * @param {string} isPcoCheckinsEnabled - 
 * @param {string} isPcoGroupsEnabled - 
 * @param {string} isPcoPeopleEnabled - 
 * @param {string} isPcoCalendarEnabled - 
 * @param {string} isPcoServicesEnabled - 
 ********************************************/


/**
 * Used to set the user properties.
 *
 * @param {string} property - a string containing the name of the property you wish to set. This is case sensitive.
 * @param {string} propertyValue - a string that contains the user property value. This only accepts strings, not booleans.
 */
function setUserProperty(property, propertyValue) {
    var setUserProperty = PropertiesService.getUserProperties();
    setUserProperty.setProperty(property, propertyValue);
    Logger.log(getUserProperty(property));
}


/**
 * Used to fetch the user properties.
 *
 * @param {string} property - a string containing the name of the property you wish to set. This is case sensitive.
 * @returns {string} - The value that is set for the user propery. 
 */

function getUserProperty(property) {
    var returnUserProperty = PropertiesService.getUserProperties().getProperty(
        property
    );
    return returnUserProperty;
}

/**
 * Used to fetch the delete properties.
 *
 * @param {string} property - a string containing the name of the property you wish to set. This is case sensitive.
 */

function deleteUserProperty(property) {
    var userProperties = PropertiesService.getUserProperties();
    userProperties.deleteProperty(property);
}

/**
 * Used to fetch the delete properties.
 *
 * @description fetching the active sheetID and setting it as a property. This is called during the OAuth Auth flow.
 */
function setActiveSpreadsheetID() {
    const activeSpreadsheetID = SpreadsheetApp.getActiveSpreadsheet().getId();
    setUserProperty("activeSpreadsheetID", activeSpreadsheetID);
}

//This function pulls the default spreadsheetID and returns it to be used in calls to this sheet.
function getDefaultSpreadsheetId() {
    let spreadsheetID = getUserProperty("activeSpreadsheetID");
    let spreadsheet = SpreadsheetApp.openById(spreadsheetID);
    return spreadsheet;
}

/**
 * Used to fetch the delete properties.
 *
 * @param {string} requestedModules - This requires the values from the sidebar checkboxes and passes to the proper string.
 * @returns {string} - returns a string containing the requested or enabled modules.
 * @description - This sets the modules based on if the user is authorized or not. It's a middleman to storing the module data. 
 *      
 */
function pcoModuleUserProperties(requestedModules) {
    var service = getOAuthService();

    if (requestedModules == undefined) {
        if (service.hasAccess()) {
            let modules = getUserProperty('requestedModules');
            //console.log(modules);
            setModuleUserObject(modules);
            console.log(`User is authorized. Modules Enabled: ${modules}`)
        }

    } else if (requestedModules != undefined) {
        setUserProperty('requestedModules', requestedModules);

        if (service.hasAccess()) {
            let modules = getUserProperty('requestedModules');
            setModuleUserObject(modules);
            console.log(`User is authorized. Modules Enabled: ${modules}`)
        } else {
            console.log(`User has requested the modules: ${getUserProperty('requestedModules')}. Currently not authorized.`);
        }
    }
}


function setModuleUserObject(modules) {

    let moduleString = String(modules)
    console.log(moduleString)

    let moduleObject = {
        "giving": moduleString.includes("giving"),
        "check_ins": moduleString.includes("check_ins"),
        "groups": moduleString.includes("groups"),
        "people": moduleString.includes("people"),
        "calendar": moduleString.includes("calendar"),
        "services": moduleString.includes("services"),
    }

    setUserProperty('enabledModules', JSON.stringify(moduleObject));
}

function getModuleUserObject() {

    console.log(JSON.parse(getUserProperty('enabledModules')));
    return JSON.parse(getUserProperty('enabledModules'));

}