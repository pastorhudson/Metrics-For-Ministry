/*********************************************
 * List of all possible User Properties
 *
 * @param {string} propertyName - purpose.
 * @param {string} activeSpreadsheetID - purpose.
 * @param {string} requestedModules - this is during the initial auth request. 
 * @param {string} enabledModules - Once the user is authorized the values from requestedModules get passed to here.
 * @param {string} lastSyncTime - the time when we last synced to PCO
 * @param {string} isSignedIn - This returns true / false if the script is signed in.
 * @param {string} lastSyncTimeISOString - configured as an ISO string and should be used in the 'update_at' function to PCO.
 * @param {string} date_format - 
 * @param {string} org_name
 * @param {string} time_zone
 * @param {string} totalPercentUsed
 * @param {string} syncPercentComplete
 * @param {string} dateSelectorDiv
 * @param {string} syncStatus - notSignedIn/ready/syncing

 ********************************************/

 function newUserUserProperties(){
    setActiveSpreadsheetID();
    setUserProperty("requestedModules", "n/a");
    setUserProperty("enabledModules", "n/a");
    setUserProperty("lastSyncTime", "n/a");
    setUserProperty("isSignedIn", "false");
    setUserProperty("lastSyncTimeISOString", "n/a");
    setUserProperty("date_format", "n/a");
    setUserProperty("org_name", "n/a");
    setUserProperty("time_zone", "n/a");
    // setUserProperty("totalPercentUsed", "n/a");
    setUserProperty("syncPercentComplete", "n/a");
    setUserProperty("dateSelectorDiv", "n/a");
    setUserProperty('syncStatus', "notSignedIn")


 }

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
    //console.log(returnUserProperty);
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
 * @description fetching the active sheetID and setting it as a property. This is called during the OAuth Auth flow.
 */
function setActiveSpreadsheetID() {
    const activeSpreadsheetID = SpreadsheetApp.getActiveSpreadsheet().getId();
    setUserProperty("activeSpreadsheetID", activeSpreadsheetID);
}

/**
 * @description fetching the active sheetID and setting it as a property. This is called during the OAuth Auth flow.
 * @returns {string} - returns the full value for openign the spreadsheet by ID
 */
function getDefaultSpreadsheetId() {
    let spreadsheetID = getUserProperty("activeSpreadsheetID");
    let spreadsheet = SpreadsheetApp.openById(spreadsheetID);
    return spreadsheet;
}


function syncPercentComplete(percent) {
    if (percent == undefined) {
        let amount = getUserProperty('syncPercentComplete')
        return +amount
    } else {
        setUserProperty('syncPercentComplete', percent);

    }


}



function pcoModuleUserProperties(requestedModules) {
    /**
     * Used to fetch the delete properties.
     *
     * @param {string} requestedModules - This requires the values from the sidebar checkboxes and passes to the proper string.
     * @returns {string} - returns a string containing the requested or enabled modules.
     * @description - This sets the modules based on if the user is authorized or not. It's a middleman to storing the module data. 
     *      
     */

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
    /**
     *
     * @returns {JSON} - returns a JSON object with each module enabled. 
     * @description - simple return for the modules the user has enabled within PCO.
     *      
     */

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
                    "Age",
                    "Is Child",
                    "Gender",
                    "Grade",
                    "Membership",
                    "Status",
                    // "Person Count",
                    // "Campus Number",
                    "Campus Name"
                ],
                "dimensions": {
                    "birthday": {
                        "id": "personBirthday",
                        "name": "Birthday",
                        "description": "The PCO Person's birthdate"
                    },
                    "age": {
                        "id": "personAge",
                        "name": "Age",
                        "description": "The PCO Person's age calculated from their birthday"
                    },
                    "ageRange": {
                        "id": "personAgeRange",
                        "name": "Age Range",
                        "description": "Grouping of the person's age range",
                        "formula": 'CASE WHEN $personAge <= 3 THEN "0 - 3" WHEN $personAge >= 4 AND $personAge <= 11  THEN "04 - 11" WHEN $personAge >= 12 AND $personAge <= 18  THEN "12 - 18" WHEN $personAge >= 19 AND $personAge <= 25  THEN "19 - 25" WHEN $personAge >= 26 AND $personAge <= 35  THEN "26 - 35" WHEN $personAge >= 36 AND $personAge <= 50  THEN "36 - 50" WHEN $personAge >= 51 AND $personAge <= 64  THEN "51 - 64" WHEN $personAge >= 65 THEN "65+" ELSE "Other" END'
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
                    //"Campus ID",
                    "Campus Name",
                    //"Category ID",
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
                    //"Campus ID",
                    "Campus Name",
                    //"Category ID",
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
                    // "categoryID": {
                    //     "id": "categoryId",
                    //     "name": "Category ID",
                    //     "description": "This is the unique ID for each category generated by PCO"
                    // },
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
                    // "campusID": {
                    //     "id": "campusId",
                    //     "name": "Campus ID",
                    //     "description": "This is a unique ID that's assigned to each campus"
                    // },
                    "campusName": {
                        "id": "campusName",
                        "name": "Campus Name",
                        "description": "This is the name for each campus that you've assigned in PCO"
                    }

                },
                "metrics": {
                    "personCount": {
                        "id": "personCount",
                        "name": "Person Count",
                        "description": "This gives a count of one for each person.",
                        "formula": "COUNT($personId)"
                    }
                }
            }
        },
        "giving": {
            "donationsTab": {
                "name": "giving_donationsTab",
                "headers": [
                    "Donation ID",
                    "Person ID",
                    //"Updated At",
                    "Received At",
                    "Refunded",
                    "Payment Method",
                    "Payment Method Type",
                    "Payment Channel",
                    "Status",
                    "Card Brand",
                    "Source",
                    "Labels",
                    "Fund Name",
                    "Ledger Code",
                    "Amount",
                    "Fee",
                    "Net Amount"
                ],
                "dimensions": {
                    "donationId": {
                        "id": "donationId",
                        "name": "Donation Id",
                        "description": "A unique ID that's generated per donation. There will be multiple duplicate values for a split donation."
                    },
                    "personId": {
                        "id": "personId",
                        "name": "Person Id",
                        "description": "This is the unique value for each person assigned by PCO."
                    },
                    // "updatedAt": {
                    //     "id": "updatedAt",
                    //     "name": "Updated At",
                    //     "description": "This is the last time this donation was updated."
                    // },
                    "receivedAt": {
                        "id": "receivedAt",
                        "name": "Received At",
                        "description": "This is when the donation was marked as received. Use this as your primary date column."
                    },
                    "receivedAtMonth": {
                        "id": "receivedAtMonth",
                        "name": "Received At - Month",
                        "description": "This is the month pulled from the received At data.",
                        "formula": "Month($receivedAt)"
                    },
                    "receivedAtYear": {
                        "id": "receivedAtYear",
                        "name": "Received At - Year",
                        "description": "This is the year pulled from the received At data.",
                        //"formula" : "YEAR($receivedAt)"
                    },
                    "refunded": {
                        "id": "refunded",
                        "name": "Refunded?",
                        "description": "True / False based on if the amount is refunded or not."
                    },
                    "paymentMethod": {
                        "id": "paymentMethod",
                        "name": "Payment Method",
                        "description": "Card/Cash/Check/ACH. This will be how this was received into PCO"
                    },
                    "paymentMethodType": {
                        "id": "paymentMethodType",
                        "name": "Credit / Debit",
                        "description": "This will show if the card was credit or debit."
                    },
                    "paymentChannel": {
                        "id": "paymentChannel",
                        "name": "Payment Channel",
                        "description": "Showing if the gift came in through Batch or Stripe"
                    },
                    "status": {
                        "id": "status",
                        "name": "Status",
                        "description": "Payment Status within PCO."
                    },
                    "cardBrand": {
                        "id": "cardBrand",
                        "name": "Card Brand",
                        "description": "This is the brand of the card your donor is using."
                    },
                    "source": {
                        "id": "source",
                        "name": "Payment Source",
                        "description": "These are the payment sources within PCO."
                    },
                    "labels": {
                        "id": "labels",
                        "name": "Labels",
                        "description": "If you've assigned a payment a label, you'll get a list of those labels here."
                    },
                    "fundName": {
                        "id": "fundName",
                        "name": "Fund Name",
                        "description": "The Fund Name this donation belongs to."
                    },
                    "ledgerCode": {
                        "id": "ledgerCode",
                        "name": "Ledger Code",
                        "description": "This is the ledger code you've configured in PCO to represent your Chart of Accounts code."
                    },

                },
                "metrics": {
                    "amount": {
                        "id": "amount",
                        "name": "Amount (pre fee)",
                        "description": "This is the gift amount BEFORE the fee is removed."
                    },
                    "fee": {
                        "id": "fee",
                        "name": "Fee",
                        "description": "This is the total amount for the fee"
                    },
                    "netAmount": {
                        "id": "netAmount",
                        "name": "Net Amount (post fee)",
                        "description": "This is the amount after the fee is deducted."
                    }
                }
            }
        },
        "check_ins": {
            "headcountsTab": {
                "name": "checkIns_headcounts",
                "headers": [
                    //"Updated At", // updated at for the Event Time.
                    "Event ID", // Foreign Key
                    "EventTime ID", // Primary Key
                    //"Headcount ID", // Foreign Key
                    //Attendee Type ID", // Foreign Key
                    "Event Name", // pulled from Events
                    "Archived At", // pulled from Events
                    "Event Frequency", // Pulled from Events
                    "Event Time Name", // custom name in PCO for the event Time. Ex: First Service
                    // "Date", // removed since this data is just calculated coming into GDS
                    // "Time", // removed since this data is just calculated coming into GDS
                    "Starts", // Pulled from Event Times
                    "Count Type", // generated from Event Time and Headcounts
                    "Count" // the value that exists for the count type.
                ],

                "dimensions": {
                    "eventId": {
                        "id": "checkinsEventId",
                        "name": "Event ID",
                        "description": "Auto-generated ID for each Event."
                    },
                    "eventTimeID": {
                        "id": "eventTimeID",
                        "name": "Event Time ID",
                        "description": "Auto-generated ID for each Event Time."
                    },
                    "eventName": {
                        "id": "eventName",
                        "name": "Event Name",
                        "description": "The Event Name, example: Weekend Experience."
                    },
                    "archivedAt": {
                        "id": "archivedAt",
                        "name": "Archived At",
                        "description": "This is the time in which this was archived. You can use this as a filter."
                    },
                    "eventFrequency": {
                        "id": "eventFrequency",
                        "name": "Event Frequency",
                        "description": "The configured frequency for an event."
                    },
                    "eventTimeName": {
                        "id": "eventTimeName",
                        "name": "Event Time Name",
                        "description": "This will be blank if you have not named your times or will show the name of your time from Check-ins."
                    },
                    "eventDate": {
                        "id": "eventDate",
                        "name": "Event Date",
                        "description": "This is the date of your event in the format `YYYY-MM-DD`"
                    },
                    "eventTime": {
                        "id": "eventTime",
                        "name": "Event Time",
                        "description": "This is the time of your event in the format `HH:mm AM/PM`"
                    },
                    "starts": {
                        "id": "starts",
                        "name": "Starts",
                        "description": "This is your date metric to use. This is in long format and looks like 'YYYY-MM-DDTHH:mm:ssZ'."
                    },
                    "eventYearMonth": {
                        "id": "eventYearMonth",
                        "name": "Starts - Year / Month",
                        "description": "This is your date metric to use. This is in long format and looks like 'YYYYMM'."
                    },
                    "countType": {
                        "id": "countType",
                        "name": "Count Type",
                        "description": "This is the data directly from the headcounts tab. If you have custom headcounts they will also show here."
                    },
                },
                "metrics": {
                    "count": {
                        "id": "count",
                        "name": "Count",
                        "description": "Total number of people who are accounted for the headcounts."
                    }
                }
            }
        },
        "groups": {},
        "calendar": {},
        "services": {},
    }
}
