
/**
 * Used by DataStudio to perform a data request.
 *
 * @param {Request} request - a JavaScript object containing the data request parameters.
 * @param {Response} response - A JavaScript object that contains the schema and data for the given request.
 */
function getData(request) {

  console.log(request);
  let module = request.configParams.pcoConnectorType;
  let data;

  if (module == 'people') {

    try {
      data = getPcoPeopleData(request);
    } catch (e) {
      DataStudioApp.createCommunityConnector()
        .newUserError()
        .setDebugText('Error fetching data from API. Exception details: ' + e)
        .setText('There was an error communicating with the service. Try again later, or file an issue if this error persists.')
        .throwException();

    }

  } else if (module == 'giving') {

    try {
      // API request that can be malformed.
      data = getPcoPeopleData(request);
    } catch (e) {
      DataStudioApp.createCommunityConnector()
        .newUserError()
        .setDebugText('Error fetching data from API. Exception details: ' + e)
        .setText('There was an error communicating with the service. Try again later, or file an issue if this error persists.')
        .throwException();

    }
  } else if (module == 'checkins') {

    try {
      // API request that can be malformed.
      data = getPcoPeopleData(request);
    } catch (e) {
      DataStudioApp.createCommunityConnector()
        .newUserError()
        .setDebugText('Error fetching data from API. Exception details: ' + e)
        .setText('There was an error communicating with the service. Try again later, or file an issue if this error persists.')
        .throwException();

    }
  }

  return data;

}

/*
Steps:
done - 1. Identify the connector
done - 2. Pass to the proper data connector function
done - 3. Within the data connector identify the proper sub connector
done - 4. Parse the Get Data `request` from GDS for the specific fields needed.
done - 5. Run the Get Data functions to pull data from the proper tab. This is based on the spreadsheet ID value and the tab values stored in the user variable
done - 6. Parse these values to put the columnn name in with the proper column ID from the schema section
done - 7. Return the data in the schema requested.

TODO:
done - Sync the column IDs with the tab JSON that's stored in the user values. This would allow us to keep everything related to the data in one place and changes to be synced.
to do the above we would need to also call this function within the `getSchesdsma` function and dynamically place the IDs.s

- Need to create an age column that converts their birthday to current age.


*/



function getPcoPeopleData(request) {
  var data = [];
  let requestedData;

  console.log(request)


    const timezone = SpreadsheetApp.openById(request.configParams.spreadsheetIdSingle).getSpreadsheetTimeZone();

   //getUserProperty('time_zone')

  console.log(timezone);

  const moduleDataJson = tabNamesReturn();

  var schemaData = getSchema(request).schema;
  //console.log(request)

if(request.fields != undefined){
  // Prepare the schema for the fields requested.
  var dataSchema = request.fields.map(function (field) {
    for (var i = 0; i < schemaData.length; i++) {
      if (schemaData[i].name == field.name) {
        return schemaData[i];
      }
    }
  });
} else {
  return {
    schema: '',
    rows: ''
  }
}

  let module = request.configParams.pcoConnectorType

  if (module == 'people') {
    let requestType = request.configParams.peopleSelectorType;

    if (requestType == "peopleData") {
      //console.log(request.configParams.spreadsheetIdSingle)
      let personData = getSpreadsheetDataByName(moduleDataJson.people.personTab.name, request.configParams.spreadsheetIdSingle);

      let tempArray = [];


      for (const person of personData) {


        let tempPerson = {
          "personId": +person["Person ID"],
          "personBirthday": Utilities.formatDate(new Date(person["Birthday"]), timezone, "yyyy-MM-dd"),
          "personAge": +person["Age"],
          "personIsChild": person["Is Child"],
          "personGender": person["Gender"],
          "personGrade": person["Grade"],
          "personMembership": person["Membership"],
          "personStatus": person["Status"],
          //"personCount": +person["Person Count"],
          //"campusId": +person["Campus Number"],
          "campusName": person["Campus Name"]
        }
        tempArray.push(tempPerson);
      }

      requestedData = tempArray;

    } else if (requestType == "listData") {
      let listData = getSpreadsheetDataByName(moduleDataJson.people.listPeopleTab.name, request.configParams.spreadsheetIdSingle);

      let tempArray = [];

      for (const person of listData) {
        let tempPerson = {
          "personId": +person["Person ID"],
          "personCount": 1,
          //"campusId": +person["Campus Number"],
          "campusName": person["Campus Name"],
          "listId": +person["List ID"],
          "listDescription": person["List Description"],
          "listName": person["List Name"],
          //"categoryId": +person["Category ID"],
          "categoryName": person["Category Name"]
        }
        tempArray.push(tempPerson);
        //console.log(tempPerson)
      }

      requestedData = tempArray;

    }

  } else if (module == 'giving') {
    let donationData = getSpreadsheetDataByName(moduleDataJson.giving.donationsTab.name, request.configParams.spreadsheetIdSingle);

    let tempArray = [];


    for (const donation of donationData) {

      let tempDonation = {
        "donationId": +donation["Donation ID"],
        "personId": +donation["Person ID"],
        // "updatedAt": convertDateLong(donation["Updated At"]),
        //"receivedAt": convertDateLong(donation["Received At"]),
        "receivedAt": Utilities.formatDate(new Date(donation["Received At"]), timezone, "yyyyMMddhhmmss"),
        "receivedAtYear": Utilities.formatDate(new Date(donation["Received At"]), timezone, "yyyy"),
        "refunded": donation["Refunded"],
        "paymentMethod": donation["Payment Method"],
        "paymentMethodType": donation["Payment Method Type"],
        "paymentChannel": donation["Payment Channel"],
        "status": donation["Status"],
        "cardBrand": donation["Card Brand"],
        "source": donation["Source"],
        "labels": donation["Labels"],
        "fundName": donation["Fund Name"],
        "ledgerCode": donation["Ledger Code"],
        "amount": +donation["Amount"],
        "fee": +donation["Fee"],
        "netAmount": +donation["Net Amount"]

      }
      tempArray.push(tempDonation);

    }

    requestedData = tempArray;
  } else if (module == 'checkins') {
    let requestType = request.configParams.checkinsSelectorType;

    if (requestType == "headcountData") {
      let headcountData = getSpreadsheetDataByName(moduleDataJson.check_ins.headcountsTab.name, request.configParams.spreadsheetIdSingle);

      let tempArray = [];


      for (const headcount of headcountData) {


        let tempPerson = {
          "eventId": +headcount["Event ID"],
          "eventTimeID": +headcount["EventTime ID"],
          "eventName": headcount["Event Name"],
          "archivedAt": Utilities.formatDate(new Date(headcount["Archived At"]), timezone, "yyyyMMddhhmmss"),
          "eventFrequency": headcount["Event Frequency"],
          "eventTimeName": headcount["Event Time Name"],
          "eventDate": Utilities.formatDate(new Date(headcount["Starts"]), timezone, "yyyyMMdd"),
          "eventTime": Utilities.formatDate(new Date(headcount["Starts"]), timezone, "HH:mm a"),
          "starts": Utilities.formatDate(new Date(headcount["Starts"]), timezone, "yyyyMMddhhmmss"),
          "eventYearMonth": Utilities.formatDate(new Date(headcount["Starts"]), timezone, "yyyyMM"),
          "countType": headcount["Count Type"],
          "count": headcount["Count"]
        }
        tempArray.push(tempPerson);
      }

      requestedData = tempArray;
    }
  }



  //console.log(requestedData[2])


  let requestedKeys = [];

  //console.log(dataSchema)

  //this is filtering the names of the fields that i've requested.
  for (const field of dataSchema) {
    requestedKeys.push(field.name)
  }

  //console.log(requestedKeys);

  //instead of one by one adding here, would it be easier to filter the data based on key values?
  for (const row of requestedData) {

    let values = [];

    for (i = 0; i < requestedKeys.length; i++) {
      let requestedKeyName = requestedKeys[i]
      let columnData = row[requestedKeyName];
      values.push(columnData)
    }


    let pushData = {
      "values": values
    }
    data.push(pushData);


  }

  //console.log(data[100])


  let returnData = {
    schema: dataSchema,
    rows: data
  }


  return returnData;
}
