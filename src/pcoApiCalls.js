
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
function promiseApiWithTimeout(url, offset, includeURL, retries = 5, timeout = 0) {
    console.log(`Starting Promise. Offset: ${offset}. Timeout: ${timeout}`)
    Utilities.sleep(timeout)

    return promise = new Promise((resolve, reject) => {
        let fetchCallResponse = fetchCall(`${url}?per_page=100&offset=${offset}` + includeURL);
        let responseCode = fetchCallResponse.getResponseCode();
        let listCallContent = JSON.parse(fetchCallResponse.getContentText());
        let headers = fetchCallResponse.getAllHeaders();

        console.log(`Rate Request Count: ${headers["x-pco-api-request-rate-count"]}. Request Rate Limit: ${headers["x-pco-api-request-rate-limit"]}. Request Rate Period: ${headers["x-pco-api-request-rate-period"]}`)

        console.log(responseCode);
        if (responseCode == 200) {
            resolve(listCallContent);
        } else if (retries > 0 && responseCode == 429) {
            let retryPeriod = parseInt(headers["Retry-After"]);
            console.log(`Retry after: ${retryPeriod}`);
            console.log(headers);
            return resolve(promiseApiWithTimeout(url, offset, includeURL, retries - 1, retryPeriod * 1000))
        }
        else {
            reject("rejected homie");
        }

    });

}



/**
 * The looped API call.
 *
 * @param {string} url - this is the base URL that we are requesting. We add the end on this URL.
 * @param {boolean} include - This is to define the return based on if you have an includes or not.
 * @param {string} includeURL - This is the additional URL. This is required to be structured like '&include=value1,value2'
 * 
 * @var {number} totalCount - this is returned by PCO and is the total amount of items in that API call. We increment over this in chunks of 100
 * 
 * @return {data} - This is our complete array of data to parse. 
 * 
 * @description - This call will continue to loop in increments of 100 until the entire total_count is complete.
 */
async function pcoApiLoopedCall(url, include = false, includeURL = undefined) {
    var service = getOAuthService();
    if (service.hasAccess()) {
        let offset = 0;
        let data = [];

        let fetchedData = await promiseApiWithTimeout(url, offset, includeURL)

        let totalCount = fetchedData.meta.total_count;

        data.push(...fetchedData.data)
        //console.log(fetchedData.included)

        for (let i = 100; i < totalCount; i += 100) {
            const response = await promiseApiWithTimeout(url, i, includeURL);
            data.push(...response.data);
            const final = response.data;
            const report = `group - ${i + 100} ; payload Length ${final.length} ; dataArray : ${data.length}`;
            console.log(report)
            //console.log(response.included)
        }
        console.log(`the data is: ${data.length} long.`);
        return data;

    }

}

async function pcoApiOrgCall(url) {
    var service = getOAuthService();
    if (service.hasAccess()) {


        let fetchedData = await promiseApiWithTimeout(url)
        return fetchedData.data;

    }

}


async function pcoApiLoopedCall_giving(url, include = false, includeURL = undefined) {
    var service = getOAuthService();
    if (service.hasAccess()) {
        let offset = 0;
        let data = [];
        let included = [];

        let fetchedData = await promiseApiWithTimeout(url, offset, includeURL)

        let totalCount = fetchedData.meta.total_count;

        data.push(...fetchedData.data)
        included.push(...fetchedData.included)

        for (let i = 100; i < totalCount; i += 100) {
            const response = await promiseApiWithTimeout(url, i, includeURL);
            data.push(...response.data);
            included.push(...response.included)
            const final = response.data;
            const report = `group - ${i + 100} ; payload Length ${final.length} ; dataArray : ${data.length}`;
            console.log(report)
            //console.log(response.included)
        }
        console.log(`the data is: ${data.length} long.`);
        
        return {
            "data" : data,
            "included" : included
        };

    }

}


