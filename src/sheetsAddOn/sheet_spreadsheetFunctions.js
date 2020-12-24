
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
                    "Campus Name"]
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
                    "Person ID"]
            },
            "campusTab": {
                "name": "people_campusTab",
                "headers": ["Campus ID", "Campus Name"]

            }
        },
        "giving": {},
        "check_ins": {},
        "groups": {},
        "calendar": {},
        "services": {},
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
        createSheet(tabs.people.listPeopleTab);
        createSheet(tabs.people.campusTab);

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


function pushToSheet(tab, data) {
    const spreadsheet = getDefaultSpreadsheetId();
    let ss = spreadsheet.getSheetByName(tab);

    // Remove all range protections in the spreadsheet that the user has permission to edit.
    var protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE);
    for (var i = 0; i < protections.length; i++) {
        var protection = protections[i];
        if (protection.canEdit()) {
            protection.remove();
        }
    }

    let output = [];

    //looping over the length of our data and turning it into an array that Google Sheets will accept.
    for (i = 0; i < data.length; i++) {
        output.push(Object.values(data[i]));
    }

    //setting the rows / columns based on the total length of our data once done.
    ss.getRange(2, 1, output.length, output[0].length).setValues(output);
    ss.getRange(1, 1, 1, output[0].length).setFontWeight("bold");
    ss.getRange(1, 1, ss.getLastRow(), ss.getLastColumn())
        .setHorizontalAlignment("center")
        .protect()
        .setWarningOnly(true)
}

function dataValidation(tab) {

    const spreadsheet = getDefaultSpreadsheetId();
    let ss = spreadsheet.getSheetByName(tab);


    var cell = ss.getRange(2, ss.getLastColumn(), ss.getLastRow()-1, 1)
    var rule = SpreadsheetApp.newDataValidation().requireCheckbox().build();
    cell.setDataValidation(rule);
    // (row, column, numRows, numColumns), 
}

async function updateSpreadsheet() {

    const tabs = tabNamesReturn();
    pushToSheet(tabs.people.campusTab.name, await getCampuses());
    //pushToSheet(tabs.people.personTab.name,  await personDataCall());
    pushToSheet(tabs.people.listTab.name, await getLists());
    dataValidation(tabs.people.listTab.name);
    pushToSheet(tabs.people.listPeopleTab.name, await getListsWithPeople());
}



function createDialog() {
    var htmlOutput = HtmlService
        .createHtmlOutputFromFile('sheetsAddOn/dialog')
        .setWidth(250)
        .setHeight(80);
    SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Loading');
}

async function updateListTab(){
    //run the get list function
    //get the data from the spreadsheet list tab
    //compare this with the list info
    //write to the sheet and set the attribute based on the 'sync this list'
    const tabs = tabNamesReturn();

    let listApiCall = await getLists();
    let listSpreadsheetData = getSpreadsheetDataByName(tabs.people.listTab.name);

    
    //console.log(listApiCall)
    let newArray = [];

    for(const list of listApiCall){
        //console.log(list)
        const syncThisList = listSpreadsheetData.filter( function(spreadsheetList){ 
            //console.log(spreadsheetList)
            if(spreadsheetList["List ID"] == list.listId){
                return spreadsheetList
            }
        });

        console.log(syncThisList[0]["Sync This List"])

        //console.log(list);
        //list["syncThisList"] = matchedList;

        newArray.push(list);


    }

    //console.log(newArray)

}

// pulling the sheet headers on any sheet. This is used to create key:value pairs.
function getSheetHeaders(name){
    const spreadsheet = getDefaultSpreadsheetId();
    let ss = spreadsheet.getSheetByName(name);
    let lastCol = ss.getLastColumn();

    // this assumes your sheet headers are all stores in the first row of your spreadsheet.
    let sheetHeaders = ss.getRange(1, 1, 1, lastCol).getValues();
    return sheetHeaders[0];
  
}

//to use this you call the spreadsheet by the name. You can adjust this if needed. 
function getSpreadsheetDataByName(tab) { 
    const spreadsheet = getDefaultSpreadsheetId();
    let ss = spreadsheet.getSheetByName(tab);
    let lastRow = ss.getDataRange().getNumRows();
    let lastCol = ss.getLastColumn();

    let headers = getSheetHeaders(tab);

    let output = [];
    let spreadsheetData = ss.getRange(2, 1, lastRow, lastCol).getValues();
 
    //doing a loop over each row in your spreadsheet. this runs top to bottom.
    for ( let i = 0 ; i < lastRow ; i++){  
      let currentRow = spreadsheetData[i];

      //creating an empty object for each loop
      let object = {};

      //doing a loop over each cell in your spreadsheet. this runs left to right.
      for (j = 0 ; j < currentRow.length ; j++) {

        //setting the key to be the column header that matches the column data
        let keyData = headers[j];
        let valueData = currentRow[j];

        //this is where we actually create teh key:value pairing.
        object[keyData] = valueData;
        }

    //the object we created above is stored in our ouput array.
    output.push(object);

    }
    
    //returning the data of your spreadsheet in a key:value pair.
    return output;
}