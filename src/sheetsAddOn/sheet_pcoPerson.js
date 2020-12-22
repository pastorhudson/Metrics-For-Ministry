
/**
  The base call to PCO.
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

function promiseApiWithTimeout(url, offset, retries = 5, timeout = 0) {
    console.log(`Starting Promise. Offset: ${offset}. Timeout: ${timeout}`)
    Utilities.sleep(timeout)

    return testPromise = new Promise((resolve, reject) => {
        let fetchCallResponse = fetchCall(`${url}?per_page=100&offset=${offset}`);
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
            return resolve(promiseApiWithTimeout(url, offset, retries - 1, retryPeriod * 1000))
        }
        else {
            reject("rejected homie");
        }

    });

}

function promiseAPI(url, offset, retries = 5) {
    console.log("Starting Promise Call")

    return testPromise = new Promise((resolve, reject) => {
        let fetchCallResponse = fetchCall(`${url}?per_page=1&offset=${offset}`);

        let responseCode = fetchCallResponse.getResponseCode();
        let listCallContent = JSON.parse(fetchCallResponse.getContentText());
        let headers = fetchCallResponse.getAllHeaders();

        console.log(`Rate Request Count: ${headers["x-pco-api-request-rate-count"]}. Request Rate Limit: ${headers["x-pco-api-request-rate-limit"]}. Request Rate Period: ${headers["x-pco-api-request-rate-period"]}`)

        console.log(responseCode);
        if (responseCode == 200) {
            resolve(listCallContent);
        } else if (retries > 0 && responseCode == 429) {
            let retryPeriod = headers["Retry-After"];
            console.log(`Retry after: ${retryPeriod}`);
            console.log(headers);

            let timeout = retryPeriod * 1000;
            setTimeout(() => { console.log(timeout) }, timeout);

            // let wait = setTimeout( () => {
            //     promiseAPI(url, offset, retries - 1)
            // }, timeout);

            // return wait;
        }
        else {
            reject("rejected homie");
        }

    });
}

function testCall() {
    pcoApiLoopedCall('https://api.planningcenteronline.com/people/v2/lists');

}


async function pcoApiLoopedCall(url) {
    var service = getOAuthService();
    if (service.hasAccess()) {
        let offset = 0;
        let data = [];

        let fetchedData = await promiseApiWithTimeout(url, offset)
        let totalCount = fetchedData.meta.total_count;
        data.push(...fetchedData.data)

        for (let i = 100; i < totalCount; i += 100) {
            const response = await promiseApiWithTimeout(url, i);
            //console.log(response.data)
            data.push(...response.data);
            const final = response.data;
            const report = `group - ${i + 100} ; payload Length ${final.length} ; dataArray : ${data.length}`;
            console.log(report)
        }
        console.log(`the data is: ${data.length} long.`)
        return data;
    }

}

// async function pcoApiLoopedCall(url) {
//     var service = getOAuthService();
//     if (service.hasAccess()) {
//         let offset = 0;
//         let data = [];

//         await promiseApiWithTimeout(url, offset)
//             .then(async fetchedData => {
//                 let totalCount = fetchedData.meta.total_count;

//                 data.push(...fetchedData.data)

//                 for (let i = 100; i < totalCount; i += 100) {
//                     const response = await promiseApiWithTimeout(url, i);
//                     data.push(...response.data);
//                     const final = response.data;
//                     const report = `group - ${i + 100} ; payload Length ${final.length} ; dataArray : ${data.length}`;
//                     console.log(report)
//                 }
//                 console.log(`the data is: ${data.length} long.`)
//                 return data;
//             })
//     } else {
//         var authorizationUrl = service.getAuthorizationUrl();
//         Logger.log('Open the following URL and re-run the script: %s', authorizationUrl);
//     }
// }





// TODO - Look at turning this into a Class method
function getCampuses() {
    const campusApiCall = pcoPeopleAPICall("https://api.planningcenteronline.com/people/v2/campuses?per_page=100");
    const responseCode = campusApiCall.getResponseCode();
    const campusCallContent = campusApiCall.getContentText();
    let campusArray = [];


    if (responseCode == 200) {
        let campusPayload = JSON.parse(campusCallContent).data;
        let metaPayload = JSON.parse(campusCallContent).meta;
        for (const element of campusPayload) {
            let attributes = element.attributes;
            let elementCampus = {}
            elementCampus.id = element.id;
            elementCampus.name = attributes.name;
            campusArray.push(elementCampus);
        }

        //console.log(campusArray)
    }
    return campusArray;
}

function getListCategories() {
    const apiCall = pcoPeopleAPICall("https://api.planningcenteronline.com/people/v2/list_categories");
    const responseCode = apiCall.getResponseCode();
    const CallContent = apiCall.getContentText();
    let categoryArray = [];


    if (responseCode == 200) {
        let payload = JSON.parse(CallContent).data;
        let metaPayload = JSON.parse(CallContent).meta;
        for (const element of payload) {
            let attributes = element.attributes;
            let subElement = {}
            subElement.id = element.id;
            subElement.name = attributes.name;
            categoryArray.push(subElement);
        }

        //console.log(categoryArray)
    }
    return categoryArray;
}

function getLists() {
    let listApiCall = pcoPeopleAPICall("https://api.planningcenteronline.com/people/v2/lists?per_page=1");
    let responseCode = listApiCall.getResponseCode();
    let listCallContent = listApiCall.getContentText();
    let metaPayload = JSON.parse(listCallContent).meta;



    if (responseCode == 200) {
        let listArrayListData = [];
        for (let i = 0; i < metaPayload.total_count; i++) {
            listApiCall = pcoPeopleAPICall(`https://api.planningcenteronline.com/people/v2/lists?include=campus,category&per_page=1&offset=${i}`);
            responseCode = listApiCall.getResponseCode();
            listCallContent = listApiCall.getContentText();

            if (responseCode == 200) {
                let listPayload = JSON.parse(listCallContent).data;
                let included = JSON.parse(listCallContent).included;

                for (const list of listPayload) {
                    let relationships = list.relationships;
                    let subList = new List(
                        list.id,
                        list.attributes.description.replaceAll("'", '"'),
                        list.attributes.name,
                        list.attributes.total_people);
                    subList.relationships = relationships;
                    subList.listSync = false;
                    subList.includes = included;
                    listArrayListData.push(subList);
                }
            }
        }
    }
    console.log(listArrayListData)

    return listArrayListData;

}

function getListsWithPeople() {
    const listApiCall = pcoPeopleAPICall("https://api.planningcenteronline.com/people/v2/lists?include=campus,category,people&per_page=100");
    const responseCode = listApiCall.getResponseCode();
    const listCallContent = listApiCall.getContentText();
    //console.log(listCallContent);
    let listArrayListData = [];



    if (responseCode == 200) {
        let listPayload = JSON.parse(listCallContent).data;
        let metaPayload = JSON.parse(listCallContent).meta;
        let included = JSON.parse(listCallContent).included;

        for (const list of listPayload) {
            let campusId;
            let categoryId;


            if (list.relationships.campus.data != null) {
                let campusData = list.relationships.campus.data;
                campusId = campusData.id;

            } else {
                campusId = null;
            }

            if (list.relationships.category.data != null) {
                let categoryData = list.relationships.category.data;
                categoryId = categoryData.id;

            } else {
                categoryId = null;
            }

            if (list.attributes.total_people > 0) {

                let people = list.relationships.people.data;
                //console.log(people);

                for (const person of people) {
                    let subList = new List(
                        list.id,
                        list.attributes.description.replaceAll("'", '"'),
                        list.attributes.name,
                        campusId,
                        categoryId,
                        person.id);
                    subList.includes = included;
                    listArrayListData.push(subList);
                    //console.log(subList);
                }
            } else {
                let subList = new List(
                    list.id,
                    list.attributes.description.replaceAll("'", '"'),
                    list.attributes.name,
                    campusId,
                    categoryId,
                    null);
                subList.includes = included;
                listArrayListData.push(subList);
                //console.log(subList);
            }



        }

        //console.log(listArrayListData)
    }

    return listArrayListData;
}


function personDataCall() {

    const personData = pcoPeopleAPICall("https://api.planningcenteronline.com/people/v2/people?per_page=100");
    let responseCode = personData.getResponseCode();
    console.log(responseCode);
    let content = personData.getContentText();
    const campusArray = getCampuses();

    let personArray = [];

    if (responseCode == 200) {

        let total_count = metaPayload.total_count;
        let offset = metaPayload.next.offset;

        // for tesing this value was changed to 15000. In future, i = offset.
        for (i = offset; i < total_count; i += 100) {
            let tempPersonData = pcoPeopleAPICall(`https://api.planningcenteronline.com/people/v2/people?per_page=100&offset=${i}`);
            responseCode = tempPersonData.getResponseCode();
            console.log(responseCode);
            content = tempPersonData.getContentText();
            if (responseCode == 429) {
                console.log(content);
            }
            let personPayload = JSON.parse(content).data;
            let metaPayload = JSON.parse(content).meta;
            //let payloadCount = metaPayload.count;
            for (const element of personPayload) {
                let attributes = element.attributes;
                let elementPerson = {}
                elementPerson.personId = element.id;
                elementPerson.personBirthdate = attributes.birthdate;
                elementPerson.personIsChild = attributes.child;
                elementPerson.personGender = attributes.gender;
                elementPerson.personGrade = attributes.grade;
                elementPerson.personMembership = attributes.membership;
                elementPerson.personStatus = attributes.status;
                elementPerson.personCount = 1;

                if (element.relationships.primary_campus.data != null) {
                    let campusNumber = element.relationships.primary_campus.data.id;
                    let campus = campusArray.find(o => o.id === campusNumber);
                    elementPerson.campusId = campusNumber;
                    elementPerson.campusName = campus.name;

                } else {
                    elementPerson.campusId = undefined;
                    elementPerson.campusName = undefined;
                }

                personArray.push(elementPerson);
            }

            let report = `group - ${i} ; payload Length ${personPayload.length} ; personArrayLength : ${personArray.length}`;

            console.log(report);
        }



        return personArray;
    }
}

