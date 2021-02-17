
/**
 * The base fetch data call.
 *
 * @param {string} url - this is the full URL we want to request.
 * @return {response} this returns the HTTP Response data to be used in the timeout function.
 * @description - This is broken out because Google does not return the headers if this response is within a function.
 */
function fetchCall(url) {
    var service = getOAuthService();
    let response = UrlFetchApp.fetch(url, {
        headers: {
            Authorization: 'Bearer ' + service.getAccessToken(),
        }, muteHttpExceptions: true,
    });
    return response;
}

/**
 * the Promise fetch call. Part 2 of the sync process.
 *
 * @param {string} url - this is the base URL that we are requesting. We add the end on this URL.
 * @param {number} offset - this is the API call offset. Increments of 100.
 * @param {number} retries - we retry the call 5 times before a fail. This keeps track.
 * @param {number} timeout - in seconds. This is fed into the Utilities.Sleep function that pauses operations until this timer is complete. 
 *      setTimeout DOES NOT WORK ON GOOGLE APP SCRIPT.
 * @param {string} includeURL - This is the variable to be added to the end to include additional info. Structured like '&included=value1,value2'
 * 
 * @return {testPromise} this is the array returned from the API call once it's passed.
 * 
 * @description - Here we create a promise that is returned with data from the PCO API.
 */
function promiseApiWithTimeout(url, offset, includeURL, updatedAt, retries = 5, timeout = 0) {
    Utilities.sleep(timeout)

    return promise = new Promise((resolve, reject) => {
        let fetchCallResponse = fetchCall(`${url}?per_page=100&offset=${offset}${includeURL}${updatedAt}`);
        let responseCode = fetchCallResponse.getResponseCode();
        let listCallContent = JSON.parse(fetchCallResponse.getContentText());
        let headers = fetchCallResponse.getAllHeaders();

        //console.log(`Starting Promise. Offset: ${offset}. Timeout: ${timeout} -------- Response Code: ${responseCode}. Rate Request Count: ${headers["x-pco-api-request-rate-count"]}. Request Rate Limit: ${headers["x-pco-api-request-rate-limit"]}. Request Rate Period: ${headers["x-pco-api-request-rate-period"]}`)

        if (responseCode == 200) {
            resolve(listCallContent);
        } else if (retries > 0 && responseCode == 429) {
            let retryPeriod = parseInt(headers["Retry-After"]);
            console.log(`Retry after: ${retryPeriod}`);
            console.log(headers);
            return resolve(promiseApiWithTimeout(url, offset, includeURL, updatedAt, retries - 1, retryPeriod * 1000))
        }
        else {
            reject("rejected homie");
        }

    });

}

async function pcoApiCall(url, onlyUpdated, include, includeURL) {
    
    var service = getOAuthService();
    if (service.hasAccess()) {
        let offset = 0;
        let data = [];
        let included = [];

        let updatedAt = '';
        if(onlyUpdated){
            let lastSyncTimeISOString = getUserProperty('lastSyncTimeISOString')
            updatedAt = `&where[updated_at][gte]=${lastSyncTimeISOString}`
            console.log(updatedAt)
        }


        let fetchedData = await promiseApiWithTimeout(url, offset, includeURL, updatedAt)

        let totalCount = fetchedData.meta.total_count;

        data.push(...fetchedData.data)

        if(include){
            included.push(...fetchedData.included)
        }

        for (let i = 100; i < totalCount; i += 100) {
            const response = await promiseApiWithTimeout(url, i, includeURL, updatedAt);
            data.push(...response.data);

            if(include){
                included.push(...response.included)
            }
            
            //const final = response.data;
            // const report = `group - ${i + 100} ; payload Length ${final.length} ; dataArray : ${data.length}`;
            // console.log(report)
            //console.log(response.included)
        }
        //console.log(`the data is: ${data.length} long.`);
        if(include){
            return {
                "data": data,
                "included": included
            };
        }

        return data;


    }
}



function compareWithSpreadsheet(apiCallData, idAttribute, tabInfo){
    let spreadsheetData = getSpreadsheetDataByName(tabInfo.name);

    // removing the existing instance of that person/value
    for(const element of apiCallData){

        // see if a person exists
        // spreadsheetData.forEach(function(e) {if(e['Person ID'] == person['Person ID']){console.log(e)}});

        spreadsheetData.forEach(function(e) {
            if(e[idAttribute] == element[idAttribute]){
                let index = spreadsheetData.indexOf(e);
                spreadsheetData.splice(index, 1)
                // console.log('spliced the data, yo')
            }

        })

        // verify the person does not exist anymore.
        // spreadsheetData.forEach(function(e) {if(e['Person ID'] == person['Person ID']){console.log(e)}});

    }
    //console.log(apiCallData);

    let dataArray = [];
    dataArray.push(...apiCallData);
    dataArray.push(...spreadsheetData);

    return dataArray
}


function getToken() {
    let token = getOAuthService().getAccessToken();
    console.log(token)
}


