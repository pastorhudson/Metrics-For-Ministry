
/**
 * Used by DataStudio to perform a data request.
 *
 * @param {Request} request - a JavaScript object containing the data request parameters.
 * @param {Response} response - A JavaScript object that contains the schema and data for the given request.
 */
function getData(request) {

  // make this request an if statement where we see what kind of data it is and run it from there.
  const connectorType = request.configParams.pcoConnectorType;

  if (connectorType == 'people') {
    return getPcoPeopleData(request);
  }

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

function convertDate(dateString) {
  let date = new Date(dateString);
  //YYYYMMDD
  //console.log(birthday)
  let month = date.getMonth() + 1  // 10 (PS: +1 since Month is 0-based)
  let day = date.getDate()       // 30
  let year = date.getFullYear()

  return `${year}${month}${day}`

}


function getPcoPeopleData(request) {
  var data = [];
  let requestedData;

  const moduleDataJson = tabNamesReturn();

  var schemaData = getSchema(request).schema;
  let requestType = request.configParams.peopleSelectorType;

  // Prepare the schema for the fields requested.
  var dataSchema = request.fields.map(function (field) {
    for (var i = 0; i < schemaData.length; i++) {
      if (schemaData[i].name == field.name) {
        return schemaData[i];
      }
    }
  });

  // Need to make a call that goes to the spreadsheet, takes the data, and gives it to me in a json format with keys that match the IDs within GDS
  if (requestType == "peopleData") {
    let personData = getSpreadsheetDataByName(moduleDataJson.people.personTab.name);

    let tempArray = [];


    for (const person of personData) {


      let tempPerson = {
        "personId": person["Person ID"],
        "personBirthday": convertDate(person["Birthday"]),
        "personIsChild": person["Is Child"],
        "personGender": person["Gender"],
        "personGrade": person["Grade"],
        "personMembership": person["Membership"],
        "personStatus": person["Status"],
        "personCount": person["Person Count"],
        "campusId": person["Campus Number"],
        "campusName": person["Campus Name"],
      }
      tempArray.push(tempPerson);
    }

    requestedData = tempArray;

  } else if (requestType == "listData") {
    let listData = getSpreadsheetDataByName(moduleDataJson.people.listPeopleTab.name);

    let tempArray = [];

    for (const person of listData) {
      let tempPerson = {
        "personId": person["Person ID"],
        "personCount": 1,
        "campusId": person["Campus Number"],
        "campusName": person["Campus Name"],
        "listId": person["List ID"],
        "listDescription": person["List Description"],
        "listName": person["List Name"],
        "categoryId": person["Category ID"],
        "categoryName": person["Category Name"]
      }
      tempArray.push(tempPerson);
      //console.log(tempPerson)
    }

    requestedData = tempArray;

  }

  console.log(requestedData[809]);

  let requestedKeys = [];

  //this is filtering the names of the fields that i've requested.
  for (const field of dataSchema) {
    requestedKeys.push(field.name)
  }

  console.log(requestedKeys);

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

  return {
    schema: dataSchema,
    rows: data
  }
}