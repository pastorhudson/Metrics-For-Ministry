

/**
  The base call to PCO.
   */
function pcoPeopleAPICall(url) {
    var service = getOAuthService();
    if (service.hasAccess()) {
        let response = UrlFetchApp.fetch(url, {
            headers: {
                Authorization: 'Bearer ' + service.getAccessToken(),
            }, muteHttpExceptions: true,
        });
        return response;
    } else {
        var authorizationUrl = service.getAuthorizationUrl();
        Logger.log('Open the following URL and re-run the script: %s', authorizationUrl);
    }
}

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
    const listApiCall = pcoPeopleAPICall("https://api.planningcenteronline.com/people/v2/lists?include=campus,category,people&per_page=1");
    const responseCode = listApiCall.getResponseCode();
    const listCallContent = listApiCall.getContentText();

    let listPayload = JSON.parse(listCallContent).included;
    let counter = 0;

    for(const row in listPayload){
        if(row.type == "Person"){
            counter ++;
        }
    }
    //console.log(listCallContent);
    console.log(listPayload.length)
    console.log(counter)

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
        let personPayload = JSON.parse(content).data;
        let metaPayload = JSON.parse(content).meta;
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

        // return personArray;
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

