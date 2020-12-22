
function tabNamesReturn(){
    return tabNames = {
        "people" : {
            "personTab" : {
                "name" :  "people_personTab",
                "headers" : ["header", "header 2"]
            },
            "listTab": {
                "name": "people_listTab",
                "headers" : ["List ID", "List Description", "List Name", "Person Count", "Campus ID", "Campus Name", "Category ID" , "Category Name", "Sync This List"]
            },
            "listPeopleTab" : {
                "name" : "people_listPersonTab",
                "headers" : ""
            },
            "campuses" : {
                "name" : "people_campusTab",
                "headers" : ""

            }
        }, 
        "giving" : {},
        "check_ins" : {},
        "groups" : {},
        "calendar" : {},
        "services" : {},
    }
}

/**
 * Setting up the Google Sheets document
 *
 * @description - This is called during the initial OAuth to set up the document. For each module that's marked as true we configure the sheets.
 *      This must be done AFTER the pcoModuleUserProperties(undefined) call in the callback.
 *      
 */

function setUpDocument() {
    let modules = getModuleUserObject();
    let tabs = tabNamesReturn();

    if (modules.people) {
        createSheet(tabs.people.personTab);
        createSheet(tabs.people.listTab);
        
        //createSheet(tabs.people.listPeopleTab);
    }
    if (modules.check_ins) {

    }
    if (modules.giving) {

    }
    if (modules.groups) {

    }
    if (modules.calendar) {

    }
    if (modules.services) {

    }



}

/**
 * Fetching the tabs on the Google Sheet
 *
 * @description - Using the configured SheetId we build an array of the sheet names.
 * @returns {array} - An array of Sheet Names from the existing Google Sheet
 *      
 */
function tabList() {
    const spreadsheet = getDefaultSpreadsheetId();
    const sheets = spreadsheet.getSheets();

    console.log(sheets);
    let sheetNames = [];

    for (let i = 0; i < sheets.length; i++) {
        sheetNames.push(sheets[i].getSheetName());
    }
    return sheetNames;

}

/**
* Create Sheets for Google Sheets
*
* @description - checks if the sheet exists in the tabList function, then if it does not we create a new sheet.
* @param {string} name - the name of the sheet we are checking for.
* @returns {array} - An array of Sheet Names from the existing Google Sheet
*      
*/
function createSheet(tabInfo) {
    const existingSheets = tabList();
    const spreadsheet = getDefaultSpreadsheetId();
    let name = tabInfo.name
    let ss = spreadsheet.getSheetByName(name);
    let headers = [tabInfo.headers]
    console.log(headers)

    //if a sheet does not exist it will create it.
    if (!existingSheets.includes(name)) {
        spreadsheet.insertSheet(name);
        ss.getRange(1, 1, 1, headers[0].length).setValues(headers);
    } else if (existingSheets.includes(name)) {
        spreadsheet.getSheetByName(name).clear();
        ss.getRange(1, 1, 1, headers[0].length).setValues(headers);

    }
}

function TestFunction() {

}




function pushToSheet(tab, data) {
    const spreadsheet = getDefaultSpreadsheetId();
    let ss = spreadsheet.getSheetByName(tab);

    let output = [];

    //looping over the length of our data and turning it into an array that Google Sheets will accept.
    for (i = 0; i < data.length; i++) {
        output.push(Object.values(data[i]));
    }

    //setting the rows / columns based on the total length of our data once done.
    ss.getRange(2, 1, output.length, output[0].length).setValues(output);
    ss.getRange(1,1,1,output[0].length).setFontWeight("bold");
    ss.getRange(1,1,output.length + 1, output[0].length).setHorizontalAlignment("center").setWarningOnly(true);
}

function updateSpreadsheet() {

    const tabs = tabNamesReturn();
    //pushToSheet(spreadsheetCampusTab,getCampuses());
    //pushToSheet(spreadsheetPeople_person, personDataCall());
    pushToSheet(tabs.people.listTab.name, getLists());
    //pushToSheet(spreadsheetListCategoriesTab,getListCategories());
}