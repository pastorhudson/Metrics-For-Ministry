
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
            resolve({
                body: listCallContent,
                ratePeriod: headers["x-pco-api-request-rate-period"],
                rateLimit: headers["x-pco-api-request-rate-limit"]

            });
        } else if (retries > 0 && responseCode == 429) {
            let retryPeriod = parseInt(headers["Retry-After"]);
            console.log(`Retry after: ${retryPeriod}`);
            console.log(headers);
            return resolve(promiseApiWithTimeout(url, offset, includeURL, updatedAt, retries - 1, retryPeriod * 1000))
        }
        else {
            console.error('Failed to get the information.')
            console.error({ responseCode, listCallContent })
        }

    });

}

function fetchFailRetry(url, retries = 5, timeout = 0) {
    Utilities.sleep(timeout)

    return promise = new Promise((resolve, reject) => {
        let fetchCallResponse = fetchCall(url);
        let responseCode = fetchCallResponse.getResponseCode();

        let responseContent = JSON.parse(fetchCallResponse.getContentText());
        let headers = fetchCallResponse.getAllHeaders();

        if (responseCode == 200) {
            resolve(responseContent);
        } else if (retries > 0 && responseCode == 429) {
            let retryPeriod = parseInt(headers["Retry-After"]);
            console.log(`Retry after: ${retryPeriod}`);
            console.log(headers);
            return resolve(fetchFailRetry(url, retries - 1, retryPeriod * 1000))
        }
        else {
            console.error('Failed to get the information.')
            console.error({ responseCode, listCallContent })
        }

    });

}

async function pcoApiCall(url, onlyUpdated, include, includeURL) {
    console.time('syncing')
    var service = getOAuthService();
    if (service.hasAccess()) {
        let data = [];
        let included = [];

        let updatedAt = '';
        if (onlyUpdated) {
            let lastSyncTimeISOString = getUserProperty('lastSyncTimeISOString')
            updatedAt = `&where[updated_at][gte]=${lastSyncTimeISOString}`
            console.log(updatedAt)
        }

        let fetchedData = await promiseApiWithTimeout(url, 0, includeURL, updatedAt)
        if (fetchedData.body.data.length == 0) { console.log('Nothing to sync'); return [] }

        let firstFetchBody = fetchedData.body
        let totalCount = (firstFetchBody.meta.total_count == null) ? 0 : firstFetchBody.meta.total_count;


        // pushing the first group of data to the arrays.
        data = data.concat(firstFetchBody.data)
        if (include) { included = included.concat(firstFetchBody.included) }

        if (Array.isArray(firstFetchBody.data)) {

            let callPerChunk = fetchedData.rateLimit - 10
            let numberOfPromiseArrays = Math.ceil((totalCount / 100) / callPerChunk)


            for (let promiseLoop = 0; promiseLoop < numberOfPromiseArrays; promiseLoop++) {

                // adding a 5 second delay for all loops greater than the first.
                if (promiseLoop > 0) { await Utilities.sleep(fetchedData.ratePeriod * 1000) }
                //console.log('starting new promise loop!')
                let promiseCalls = [];

                let loopStart;
                let loopEnd;

                if (promiseLoop > 0) {
                    loopStart = (promiseLoop * (callPerChunk * 100))
                    loopEnd = loopStart + (callPerChunk * 100)
                } else {
                    loopStart = 100;
                    loopEnd = loopStart + ((callPerChunk * 100) - 100)
                }

                if (loopEnd > totalCount) { loopEnd = totalCount }

                //console.log({ promiseLoop, numberOfPromiseArrays, loopStart, loopEnd })

                const requestArray = buildRequestArray(url, loopStart, loopEnd, includeURL, updatedAt)
                const fetchedDataLoop = await fetchAllDataLoop(requestArray, include);

                data = data.concat(fetchedDataLoop.data)
                if (include) { included = included.concat(fetchedDataLoop.included) }

            }


        }

        console.log(`the data is: ${data.length} long. Total count is ${totalCount}`);


        console.timeEnd('syncing')
        if (include) {
            return {
                "data": data,
                "included": included
            };
        }

        return data;


    }
}


function compareWithSpreadsheet(apiCallData, idAttribute, tabInfo) {
    let spreadsheetData = getSpreadsheetDataByName(tabInfo.name);

    // removing the existing instance of that person/value
    for (const element of apiCallData) {

        // see if a person exists
        // spreadsheetData.forEach(function(e) {if(e['Person ID'] == person['Person ID']){console.log(e)}});

        spreadsheetData.forEach(function (e) {
            if (e[idAttribute] == element[idAttribute]) {
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

function fetchAllTest() {

    let number = 20

    let requestArray = []

    for (i = 0; i < number; i++) {

        let request = {
            url: `https://api.planningcenteronline.com/people/v2/people?per_page=100&offset=${i * 100}&include=households,primary_campus`,
            headers: { Authorization: 'Bearer 7d36e9fc2261a6f200d1ec20e0d613632ee1da162504a71afafbdf717738f0bb' },
            muteHttpExceptions: true
        }

        requestArray.push(request)

    }

    console.log(UrlFetchApp.fetchAll(requestArray))
}

function buildRequestArray(url, loopStart, loopEnd, includeURL, updateAt) {

    const service = getOAuthService();
    let requestArray = [];

    for (let i = loopStart; i < loopEnd; i += 100) {

        // forming the request URL array.
        let request = {
            url: `${url}?per_page=100&offset=${i}${includeURL}${updateAt}`,
            headers: {
                Authorization: 'Bearer ' + service.getAccessToken()
            },
            muteHttpExceptions: true
        }

        requestArray.push(request);
    }


    return requestArray
}

function buildRetryRequestArray(urlArray) {

    const service = getOAuthService();
    let retryRequestArray = [];

    for (url of urlArray) {

        // forming the request URL array.
        let request = {
            url,
            headers: {
                Authorization: 'Bearer ' + service.getAccessToken()
            },
            muteHttpExceptions: true
        }

        retryRequestArray.push(request);
    }


    return retryRequestArray
}

async function fetchAllDataLoop(requestArray, include, data = [], included = [], retryPeriod = 0) {

    await Utilities.sleep(retryPeriod)

    let fetchAllArray = await UrlFetchApp.fetchAll(requestArray)
    let retryCount = 0
    let failedFetches = []

    for (response of fetchAllArray) {
        let responseCode = response.getResponseCode()
        let responseContent = JSON.parse(response.getContentText())
        let index = fetchAllArray.indexOf(response);

        if (responseCode == 200) {
            //console.log({ responseCode })

            data = data.concat(responseContent.data)
            if (include) { included = included.concat(responseContent.included) }
        }

        if (responseCode != 200) {

            // pushing the URL of the failed sync
            failedFetches.push(requestArray[index].url)


            if (retryCount == 0) {
                let headers = response.getAllHeaders();
                retryPeriod = parseInt(headers["Retry-After"])
                retryCount++
            }
        }
    }

    if (failedFetches.length != 0) {
        // call the function 
        let failedRequestArray = buildRetryRequestArray(failedFetches)
        console.log(`Total Failed requests -- ${failedRequestArray.length}. Retrying after -- ${retryPeriod} Seconds`)
        return fetchAllDataLoop(failedRequestArray, include, data, included, retryPeriod * 1000)
    }




    return {
        data,
        included
    }


}

/*
***************************************************
***************************************************
*
* Groups Sync API
*
***************************************************
***************************************************
*/

// does not support the includes
async function groups_pcoApiCall(urlArray) {
    const service = getOAuthService();
    if (service.hasAccess()) {
        let data = [];
        const groupsRequestArray = []

        urlArray.forEach(url => {
            groupsRequestArray.push({
                url: `${url}?per_page=100&offset=0`,
                headers: {
                    Authorization: 'Bearer ' + service.getAccessToken()
                },
                muteHttpExceptions: true
            }
            )
        })

        let fetchedData = await promiseApiWithTimeout(groupsRequestArray[0].url, 0, '', '')
        // if (fetchedData.body.data.length == 0) { console.log('Nothing to sync'); return [] }

        let firstFetchBody = fetchedData.body

        // the total count array will be inaccurate here.
        let totalCount = urlArray.length

        // pushing the first group of data to the arrays.
        data = data.concat(firstFetchBody)

        if (Array.isArray(firstFetchBody.data)) {

            let callPerChunk = fetchedData.rateLimit - 10
            let numberOfPromiseArrays = Math.ceil((totalCount / 100) / callPerChunk)


            for (let promiseLoop = 0; promiseLoop < numberOfPromiseArrays; promiseLoop++) {

                if (promiseLoop > 0) { await Utilities.sleep(fetchedData.ratePeriod * 1000) }

                let loopStart;
                let loopEnd;

                if (promiseLoop > 0) {
                    loopStart = (promiseLoop * (callPerChunk * 100))
                    loopEnd = loopStart + (callPerChunk * 100)
                } else {
                    loopStart = 100;
                    loopEnd = loopStart + ((callPerChunk * 100) - 100)
                }

                if (loopEnd > totalCount) { loopEnd = totalCount }

                const fetchedDataLoop = await groups_fetchAllDataLoop(groupsRequestArray);

                data = data.concat(fetchedDataLoop)
            }
        }
        console.log(`the data is: ${data.length} long. Total count is ${totalCount}`);

        return data;


    }
}

async function groups_fetchAllDataLoop(groupsRequestArray, data = [], retryPeriod = 0) {

    await Utilities.sleep(retryPeriod)

    let fetchAllArray = await UrlFetchApp.fetchAll(groupsRequestArray)
    let retryCount = 0
    let failedFetches = []

    for (response of fetchAllArray) {
        let responseCode = response.getResponseCode()
        let responseContent = JSON.parse(response.getContentText())
        let index = fetchAllArray.indexOf(response);

        if (responseCode == 200) {
            //console.log({ responseCode })
            // let groupID = groupIdArray[index]

            data = data.concat(responseContent)
        }

        if (responseCode != 200) {

            // pushing the URL of the failed sync
            failedFetches.push(requestArray[index].url)


            if (retryCount == 0) {
                let headers = response.getAllHeaders();
                retryPeriod = parseInt(headers["Retry-After"])
                retryCount++
            }
        }
    }

    // need to validate that this does properly create a loop for groups
    if (failedFetches.length != 0) {
        // call the function 
        let failedRequestArray = buildRetryRequestArray(failedFetches)
        console.log(`Total Failed requests -- ${failedRequestArray.length}. Retrying after -- ${retryPeriod} Seconds`)
        return fetchAllDataLoop(failedRequestArray, data, retryPeriod * 1000)
    }

    return data


}



