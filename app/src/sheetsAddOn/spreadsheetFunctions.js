

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
        //createSheet(tabs.people.campusTab);
    }
    if (modules.check_ins) {
        createSheet(tabs.check_ins.headcountsTab);
        createSheet(tabs.check_ins.checkinsTab);
    }
    if (modules.giving) {
        createSheet(tabs.giving.donationsTab);

    }
    if (modules.groups) {
        createSheet(tabs.groups.groupSummaryTab);

    }
    if (modules.calendar) {

    }
    if (modules.services) {

    }



}


function deleteSheetsCreated() {
    //let modules = getModuleUserObject();
    let tabs = tabNamesReturn();
    const spreadsheet = getDefaultSpreadsheetId();


    let sheets = tabList();

    if (!sheets.includes("Metrics for Ministry has been reset")) {
        deleteSheet("Metrics for Ministry has been reset");
        spreadsheet.insertSheet("Metrics for Ministry has been reset");

    }


    deleteSheet(tabs.people.personTab.name);
    deleteSheet(tabs.people.listTab.name);
    deleteSheet(tabs.people.listPeopleTab.name);

    deleteSheet(tabs.check_ins.headcountsTab.name);

    deleteSheet(tabs.check_ins.checkinsTab.name);
    deleteSheet(tabs.groups.groupSummaryTab.name);
    deleteSheet(tabs.giving.donationsTab.name);

}

function deleteSheet(tabName) {
    const spreadsheet = getDefaultSpreadsheetId();

    let sheets = tabList();
    if (sheets.includes(tabName)) {
        var sheet = spreadsheet.getSheetByName(tabName);
        spreadsheet.deleteSheet(sheet);
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

    //console.log(sheets);
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
    let headers = [tabInfo.headers]

    //if(additionalHeaders != null){headers = [...additionalHeaders]}

    //if a sheet does not exist it will create it.
    if (!existingSheets.includes(name)) {
        spreadsheet.insertSheet(name);
        let ss = spreadsheet.getSheetByName(name);
        ss.getRange(1, 1, 1, headers[0].length).setValues(headers);
    } else if (existingSheets.includes(name)) {
        spreadsheet.getSheetByName(name).clear();
        let ss = spreadsheet.getSheetByName(name);
        ss.getRange(1, 1, 1, headers[0].length).setValues(headers);

    }
    let ss = spreadsheet.getSheetByName(name);
    ss.getRange(1, 1, ss.getLastRow(), ss.getLastColumn())
        .setHorizontalAlignment("center")
        .protect()
        .setWarningOnly(true)
}

function updateHeaders(tabInfo, additionalHeaders) {
    const spreadsheet = getDefaultSpreadsheetId();
    let name = tabInfo.name
    let headers = [tabInfo.headers]

    if (additionalHeaders != null) { headers = [[...tabInfo.headers, ...additionalHeaders]] }

    let ss = spreadsheet.getSheetByName(name);
    ss.getRange(1, 1, 1, headers[0].length).setValues(headers);

    return headers

    // ss.setFrozenRows(1);
}


function pushToSheet(tabInfo, data, additionalHeaders) {

    //console.log(additionalHeaders)

    try {
        const ss = getDefaultSpreadsheetId().getSheetByName(tabInfo.name);

        var protections = ss.getProtections(SpreadsheetApp.ProtectionType.RANGE);

        for (var i = 0; i < protections.length; i++) {
            var protection = protections[i];
            if (protection.canEdit()) {
                protection.remove();
            }
        }

        let output = [];
        if (ss.getLastRow() > 0 && ss.getLastColumn() > 0) {

            // clearing the content of the spreadsheet
            ss.getRange(2, 1, ss.getLastRow(), ss.getLastColumn()).clearContent();
        }

        const headers = updateHeaders(tabInfo, additionalHeaders)[0];


        if (data.length != 0) {
            //looping over the length of our data and turning it into an array that Google Sheets will accept.

            // don't love this solution but this will map the array to be in the order of the header
            data = data.map(element => {
                let object = {}
                headers.forEach(header => {
                    object[header] = element[header]
                })
                return object
            })


            for (i = 0; i < data.length; i++) {

                // reorder data

                output.push(Object.values(data[i]));
            }

            //setting the rows / columns based on the total length of our data once done.

            //setting the formatting here causes a bug where it breaks the check boxes.
            ss.getRange(2, 1, output.length, output[0].length).setValues(output)//.setNumberFormat('@');
            ss.getRange(1, 1, 1, output[0].length).setFontWeight("bold");
            ss.getRange(1, 1, ss.getLastRow(), ss.getLastColumn())
                .setHorizontalAlignment("center")
                .protect()
                .setWarningOnly(true)
        }

        removeEmptyRows(tabInfo.name);
        removeEmptyColumns(tabInfo.name);
        resizeColumns(tabInfo.name);
        return "sync successful"
    } catch (err) {
        console.log(err);
        return `sync Failed. Reason - ${err}`
    }

}

function removeEmptyRows(tab) {
    const ss = getDefaultSpreadsheetId().getSheetByName(tab);

    // returns all the rows in the sheet as a number
    const maxRows = ss.getMaxRows();

    // returns the last row in the sheet THAT HAS CONTENT
    const lastRow = ss.getLastRow();

    console.log(`max Rows: ${maxRows}. Last Row: ${lastRow}. Sheet: ${tab}`)

    // need to delete all by the last row with a buffer.

    if (lastRow === 1 && maxRows === 2) {
        // do nothing because everything is okay.
    } else if (lastRow === 1 && maxRows >= 3){
        // first row to delete is row 3 (we want to keep 1 as the header, 2 as a buffer)
        ss.deleteRows(lastRow + 2 , maxRows - (lastRow + 1) );
        ss.getRange(2, 1, 1, ss.getLastColumn()).setFontWeight("normal");
    } else if (maxRows > lastRow) {
        ss.deleteRows(lastRow + 1, maxRows - lastRow);
    }
}

function resizeColumns(tab) {
    const ss = getDefaultSpreadsheetId().getSheetByName(tab);
    var lastColumn = ss.getLastColumn();
    ss.autoResizeColumns(1, lastColumn);
}

function removeEmptyColumns(tab) {
    const ss = getDefaultSpreadsheetId().getSheetByName(tab);
    var maxCols = ss.getMaxColumns();
    var lastCol = ss.getLastColumn();

    if (maxCols > lastCol) {
        ss.deleteColumns(lastCol + 1, maxCols - lastCol);

    }

}



/**
 * Adding Data Validation to the spreadsheet under listTab
 * 
 * @param {tab} - This is the name of the tab needing validating that's returned from the `tabNamesReturn` function.
 * @description - This function enables the checkbox data validation to be added in a single column.
 */
function dataValidation(tab) {
    const spreadsheet = getDefaultSpreadsheetId();
    let ss = spreadsheet.getSheetByName(tab);
    var cell = ss.getRange(2, ss.getLastColumn(), ss.getLastRow(), 1);
    var rule = SpreadsheetApp.newDataValidation().requireCheckbox().build();
    cell.setDataValidation(rule);
}

function clearDataValidation(tab) {
    const spreadsheet = getDefaultSpreadsheetId()
    const ss = spreadsheet.getSheetByName(tab)
    ss.getRange(1, 1, ss.getLastRow(), ss.getLastColumn()).setDataValidation(null)

}




// function createDialog() {
//     var htmlOutput = HtmlService
//         .createHtmlOutputFromFile('sheetsAddOn/dialog')
//         .setWidth(250)
//         .setHeight(80);
//     SpreadsheetApp.getUi().showModalDialog(htmlOutput, 'Loading');
// }

/**
 * Updating the list tab based on the user input
 * 
 * @return {listArray} - This is an array of the Lists returned from PCO combined with the data on the spreadsheet.
 * @description - This function is responsible for taking the user input from the ListTab on the spreadsheet, adding if it should be synced, and updating the list tab. This
 *      information will then feed into the listPeopleTab
 */
async function updateListTab(listApiCall) {
    const tabs = tabNamesReturn();

    let listSpreadsheetData = getSpreadsheetDataByName(tabs.people.listTab.name);
    let listArray = [];


    //console.log(listSpreadsheetData.length)

    if (listSpreadsheetData.length > 0) {

        listApiCall.forEach(list => {
            const syncThisList = listSpreadsheetData.find(spreadsheetList => spreadsheetList["List ID"] == list['List ID']);
            list["Sync This List"] = (syncThisList != null) ? syncThisList["Sync This List"] : false;
            listArray.push(list);
        })


    } else {
        listApiCall.forEach(list => {
            list["Sync This List"] = false;
            listArray.push(list);
        })
    }

    return listArray;
}

// pulling the sheet headers on any sheet. This is used to create key:value pairs.
function getSheetHeaders(name) {
    const spreadsheet = getDefaultSpreadsheetId();
    let ss = spreadsheet.getSheetByName(name);
    let lastCol = ss.getLastColumn();

    // this assumes your sheet headers are all stores in the first row of your spreadsheet.
    let sheetHeaders = ss.getRange(1, 1, 1, lastCol).getValues();
    return sheetHeaders[0];

}

//to use this you call the spreadsheet by the name. You can adjust this if needed. 
function getSpreadsheetDataByName(tab, spreadsheetID = null) {

    const spreadsheet = (spreadsheetID == null) ? getDefaultSpreadsheetId() : SpreadsheetApp.openById(spreadsheetID);

    // console.log(spreadsheet);

    //const spreadsheet = getDefaultSpreadsheetId();
    let ss = spreadsheet.getSheetByName(tab);
    let lastRow = ss.getLastRow();
    console.log(lastRow)
    let lastCol = ss.getDataRange().getLastColumn();

    //console.log(`last Row: ${lastRow}... last Column: ${lastCol}`)

    if (lastRow > 1) {
        let headers = getSheetHeaders(tab);

        let output = [];
        let spreadsheetData = ss.getRange(2, 1, lastRow - 1, lastCol).getValues();
        //console.log(spreadsheetData)

        //doing a loop over each row in your spreadsheet. this runs top to bottom.
        for (let i = 0; i < lastRow - 1; i++) {
            let currentRow = spreadsheetData[i];

            //creating an empty object for each loop
            let object = {};

            //doing a loop over each cell in your spreadsheet. this runs left to right.
            for (j = 0; j < currentRow.length; j++) {

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
    } else {
        return [];
    }


}