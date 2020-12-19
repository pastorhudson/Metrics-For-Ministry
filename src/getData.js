// function testConnect(){
//   let request = 	{ fields: [ { name: 'personCount' }, { name: 'personGender' } ],
//   configParams: { peopleSelectorType: 'peopleData' },
//   scriptParams: { lastRefresh: '1608226209383' } }

//   getData(request);
// }

/**
 * Used by DataStudio to perform a data request.
 *
 * @param {Request} request - a JavaScript object containing the data request parameters.
 * @param {Response} response - A JavaScript object that contains the schema and data for the given request.
 */
function getData(request) {

  //var dataType = request.configParams.peopleSelectorType;

  return getPcoData(request);

}



/** Data functions implement getData for that specific data type. All functions take a request, GoogleFit instance, start date, and end date.
 *
 * @param {Request} request - a JavaScript object containing the data request parameters.
 * @param {!object} instance of GoogleFit()
 * @param {String} Date variable
 * @param {String} Date variable
 * @return {!object} Data for the given request.
 */
function getPcoData(request) {
  var data = [];
  let requestedData;

  //console.log(request);
  var schemaData = getSchema(request).schema;
  //console.log(schemaData);
  let requestType = request.configParams.peopleSelectorType;

  // Prepare the schema for the fields requested.
  var dataSchema = request.fields.map(function(field) {
    //console.log(field)
    for (var i = 0; i < schemaData.length; i++) {
      if (schemaData[i].name == field.name) {
        return schemaData[i];
      }
    }
  });
  // TODO: Get the data from the Apps Script Cache service if it exists otherwise get the data from the Google Fit API.
  // See: https://developers.google.com/datastudio/connector/build#fetch_and_return_data_with_getdata

  //console.log(dataSchema)
  // Works until this point

  if(requestType == "peopleData"){
    requestedData = personDataCall();
  } else if(requestType == "listData") {
    requestedData = getLists();
    console.log("you dun me in")
  }

  let requestedKeys = [];

  for (const field of dataSchema){
    requestedKeys.push(field.name)
  }

  console.log(requestedKeys);
  console.log(requestedData.length)

  for (const row of requestedData) {

    let values = [];
    for(i = 0 ; i < requestedKeys.length ; i++ ){
      let requestedKeyName = requestedKeys[i]
      let columnData = row[requestedKeyName];
      values.push(columnData)
    }


    let pushData = {
      "values": values
    }
    data.push(pushData);
    //console.log(pushData);

  }

  //console.log(data);
    
  return {
    schema: dataSchema,
    rows: data
  }
}



  //   // currently this returns the results of the API call and passes it down to the data schema
  //   dataSchema.forEach(function(field) {
  //     console.log(field);



  //     // switch (field.name) {
  //     //   case 'StartTime':
  //     //     values.push();
  //     //     break;
  //     //   case 'EndTime':
  //     //     values.push();
  //     //     break;
  //     //   case 'Steps':
  //     //     values.push();
  //     //     break;
  //     //   default:
  //     //     values.push('');
  //   }
  //   });
  //   data.push({
  //     values: values
  //   });
  // }