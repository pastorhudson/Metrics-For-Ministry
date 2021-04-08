function totalStorageUsed(){
    let tabs = tabList();

    console.log(tabs);

    const spreadsheet = getDefaultSpreadsheetId();

    let cellsUsed = 0;


    for (const tab of tabs){
        let ss = spreadsheet.getSheetByName(tab);

        let lastCol = ss.getMaxColumns()
        let lastRow = ss.getMaxRows();

        let totalSheetStorage = lastCol * lastRow;
        //console.log(totalSheetStorage)

        cellsUsed += totalSheetStorage;

    }


    let totalPercentUsed = ((cellsUsed / 5000000) * 100).toFixed(3)

    setUserProperty('totalPercentUsed', totalPercentUsed);

    return totalPercentUsed;

}


