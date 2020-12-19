// enhancement / refactoring - should this be user input? Does it matter?
const spreadsheetPeople_person = 'pcoPeople_person';
//const spreadsheetCampusTab = 'campus';
const spreadsheetPeople_lists = 'pcoPeople_list';
//const spreadsheetListCategoriesTab = 'listCategories';





/**
 * Setting up the Google Sheets document
 *
 * @description - This is called during the initial OAuth to set up the document. For each module that's marked as true we configure the sheets.
 *      This must be done AFTER the pcoModuleUserProperties(undefined) call in the callback.
 *      
 */

function setUpDocument() {
    let modules = getModuleUserObject();

    if (modules.people) {
        createSheet(spreadsheetPeople_person);
        createSheet(spreadsheetPeople_lists);
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
function createSheet(name) {
    const existingSheets = tabList();
    const spreadsheet = getDefaultSpreadsheetId();

    //if a sheet does not exist it will create it.
    if (!existingSheets.includes(name)) {
        spreadsheet.insertSheet(name);
    } else if (existingSheets.includes(name)) {
        spreadsheet.getSheetByName(name).clear();

    }
}




function pushToSheet(tab, data) {
    const spreadsheet = getDefaultSpreadsheetId();
    let ss = spreadsheet.getSheetByName(tab);

    let output = [Object.keys(data[0])];

    //looping over the length of our data and turning it into an array that Google Sheets will accept.
    for (i = 0; i < data.length; i++) {
        output.push(Object.values(data[i]));
    }

    //setting the rows / columns based on the total length of our data once done.
    ss.getRange(1, 1, output.length, output[0].length).setValues(output);
}

function updateSpreadsheet() {

    //pushToSheet(spreadsheetCampusTab,getCampuses());
    pushToSheet(spreadsheetPeople_person, personDataCall());
    pushToSheet(spreadsheetPeople_lists, getLists());
    //pushToSheet(spreadsheetListCategoriesTab,getListCategories());
}