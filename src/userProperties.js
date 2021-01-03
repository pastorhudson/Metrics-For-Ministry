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
    console.log(property);
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


function tabNamesReturn() {
    return tabNames = {
        "people": {
            "personTab": {
                "name": "people_personTab",
                "headers": [
                    "Person ID",
                    "Birthday",
                    "Is Child",
                    "Gender",
                    "Grade",
                    "Membership",
                    "Status",
                    "Person Count",
                    "Campus Number",
                    "Campus Name"
                ],
                "dimensions": {
                    "birthday": {
                        "id": "personBirthday",
                        "name": "Birthday",
                        "description": "The PCO Person's birthdate"
                    },
                    "gender": {
                        "id": "personGender",
                        "name": "Gender",
                        "description": "Gender, as assigned in PCO per person"
                    },
                    "grade": {
                        "id": "personGrade",
                        "name": "Grade",
                        "description": "Grade value pulled from PCO"
                    },
                    "isChild": {
                        "id": "personIsChild",
                        "name": "Is a Child",
                        "description": "This value is true/false based on the info in PCO"
                    },
                    "membership": {
                        "id": "personMembership",
                        "name": "Membership",
                        "description": "This is the person's membership type as pulled by PCO"
                    },
                    "status": {
                        "id": "personStatus",
                        "name": "Profile Status",
                        "description": "This is either active/inactive. We suggest to filter out inactive profiles from most of your charts."
                    },
                },
                "metrics": {

                }
            },
            "listTab": {
                "name": "people_listTab",
                "headers": [
                    "List ID",
                    "List Description",
                    "List Name",
                    "Total People",
                    "Campus ID",
                    "Campus Name",
                    "Category ID",
                    "Category Name",
                    "Sync This List"]
            },
            "listPeopleTab": {
                "name": "people_listPersonTab",
                "headers": [
                    "List ID",
                    "List Description",
                    "List Name",
                    "Total People",
                    "Campus ID",
                    "Campus Name",
                    "Category ID",
                    "Category Name",
                    "Person ID"
                ],
                "dimensions": {
                    "listID": {
                        "id": "listId",
                        "name": "List ID",
                        "description": "This is the unique ID for each list generated by PCO"
                    },
                    "listDescription": {
                        "id": "listDescription",
                        "name": "List Description",
                        "description": "This is a an outline of the rules that are in your PCO List"
                    },
                    "listName": {
                        "id": "listName",
                        "name": "List Name",
                        "description": "This is the name of your list, if you have not modified the value it's equal to the list description."
                    },
                    "categoryID": {
                        "id": "categoryId",
                        "name": "Category ID",
                        "description": "This is the unique ID for each category generated by PCO"
                    },
                    "categoryName": {
                        "id": "categoryName",
                        "name": "Category Name",
                        "description": "This is a named category that you created to sort PCO lists."
                    },
                },
                "metrics": {

                }
            },
            "campusTab": {
                "name": "people_campusTab",
                "headers": ["Campus ID", "Campus Name"]

            },
            "peopleInfo": {
                "dimensions": {
                    "personID": {
                        "id": "personId",
                        "name": "Person ID",
                        "description": "This is the unique value for each person assigned by PCO."
                    },
                    "campusID": {
                        "id": "campusId",
                        "name": "Campus ID",
                        "description": "This is a unique ID that's assigned to each campus"
                    },
                    "campusName": {
                        "id": "campusName",
                        "name": "Campus Name",
                        "description": "This is the name for each campus that you've assigned in PCO"
                    },
                    "personCount": {
                        "id": "personCount",
                        "name": "Person Count",
                        "description": "This gives a count of one for each person."
                    }
                },
                "metrics": {

                }
            }
        },
        "giving": {},
        "check_ins": {},
        "groups": {},
        "calendar": {},
        "services": {},
    }
}