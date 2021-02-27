async function getCampuses() {

    /**
     * The campus data call
     * 
     * @return {campusArray} - filtered array of the campus data. For how this should look, check out the examples readme.
     * @description - This function returns the array of our campuses. This is a bit more reliable than running an 'includes'
     */

    const campusApiCall = await pcoApiCall("https://api.planningcenteronline.com/people/v2/campuses", false, false, '');
    let campusArray = [];

    for (const campus of campusApiCall) {
        let attributes = campus.attributes;
        let elementCampus = {}
        elementCampus.id = campus.id;
        elementCampus.name = attributes.name;
        campusArray.push(elementCampus);
    }

    return campusArray;
}

async function getListCategories() {
    /**
     * The cateogory data call
     * 
     * @return {categoryArray} - filtered array of the list category data For how this should look, check out the examples readme.
     * @description - This function returns the array of the list category data. This is a bit more reliable than running an 'includes'
     */

    const apiCall = await pcoApiCall("https://api.planningcenteronline.com/people/v2/list_categories", false, false, '');
    let categoryArray = [];

    for (const element of apiCall) {

        const {attributes, id} = element;
        let subElement = {
            id: id,
            name: attributes.name
        }

        categoryArray.push(subElement);
    }

    return categoryArray;
}

async function getLists() {
    let listApiCall = await pcoApiCall("https://api.planningcenteronline.com/people/v2/lists", false, true, "&include=campus,category");
    let campuses = await getCampuses();
    let categories = await getListCategories();

    let listArrayListData = [];

    for (const list of listApiCall.data) {
        let relationships = list.relationships;
        let description = list.attributes.description.replaceAll("'", '"')

        let listName = list.attributes.name;

        if(listName == null){
            listName = description;
        }


        let subList = new List(
            list.id,
            description,
            listName,
            list.attributes.total_people);
        subList.relationships = relationships;
        //subList.listSync = null;
        subList.campus = campuses;
        subList.category = categories;
        delete subList['Campus ID'];
        delete subList['Category ID'];

        listArrayListData.push(subList);
    }


    return listArrayListData;

}


// we use the includes only for the relationship data. The other data is ignored
async function getListsWithPeople(onlyUpdated, tab) {

    
    let listApiCall = await pcoApiCall("https://api.planningcenteronline.com/people/v2/lists", onlyUpdated , true, "&include=campus,category,people");
    let campuses = await getCampuses();
    let categories = await getListCategories();

    let listArrayListData = [];

    for (const list of listApiCall.data) {

        let relationships = list.relationships;
        let people = relationships.people.data
        let description = list.attributes.description.replaceAll("'", '"')
        let listName = list.attributes.name;

        if(listName == null || listName == undefined){
            listName = description;
        }

        // this is where to add a looped call to get the people of each list.

        for (const person of people) {
            let subList = new ListPeople(
                list.id,
                description,
                listName,
                list.attributes.total_people,
                person.id);
            subList.relationships = relationships;
            subList.campus = campuses;
            subList.category = categories;
            delete subList['Campus ID'];
            delete subList['Category ID'];
            
            subList["Person ID"] = person.id;
            listArrayListData.push(subList);
        }

    }

    let updateListData = await updateListTab();
    let syncTheseLists = [];
    let syncThesePeople = [];

    console.log(updateListData)

    for (list2 of updateListData) {
        if (list2._syncThisList == true) {
            syncTheseLists.push(list2['List ID']);
        }
    }

    console.log(syncTheseLists)

    for (i = 0; i < listArrayListData.length; i++) {
        let value = syncTheseLists.indexOf(listArrayListData[i]['List ID']);
        if (value != -1) {
            syncThesePeople.push(listArrayListData[i])
        }
    }

    //console.log(syncThesePeople);

    // parsing the data from the sheet if we are requesting only updated info.
    if(onlyUpdated){
        return compareWithSpreadsheet(syncThesePeople, "Person ID", tab)
    } else {
        return syncThesePeople
    }

    //return syncThesePeople;

}


function getAge(birthday) {
    if(birthday != null){
        birthday = new Date(birthday)
        var today = new Date();
        var thisYear = 0;
        if (today.getMonth() < birthday.getMonth()) {
            thisYear = 1;
        } else if ((today.getMonth() == birthday.getMonth()) && today.getDate() < birthday.getDate()) {
            thisYear = 1;
        }
        var age = today.getFullYear() - birthday.getFullYear() - thisYear;
        return age;
    } else {
        // return -1 if they don't have an age for easier filtering.
        return -1
    }
 
}

function uniq(a) {
    return Array.from(new Set(a));
 }


async function personDataCall(onlyUpdated, tab) {
    /**
     * The person data call
     * 
     * @return {personArray} - filtered array of the people on PCO. check out the readme for more information on how this is structured.
     * @description - 
     */

    const apiCall = await pcoApiCall("https://api.planningcenteronline.com/people/v2/people", false, true, '&include=households,primary_campus');

    const CAMPUSES = apiCall.included.filter((e) => { if (e.type == "Campus" && apiCall.included.findIndex(t => (e.id === t.id)) == apiCall.included.indexOf(e)) { return e } })
    console.log(CAMPUSES)
    const HOUSEHOLDS = apiCall.included.filter((e) => { if (e.type == "Household" && apiCall.included.findIndex(t => (e.id === t.id)) == apiCall.included.indexOf(e)) { return e } })

    //const campusArray = await getCampuses();

    

    let newPeopleArray = [];

    if(apiCall.data.length > 0 ){
        for (const element of apiCall.data) {
            let attributes = element.attributes;
            let relationships = element.relationships;

            console.log(relationships);

            let person = {
                'Person ID': element.id,
                "Birthday": attributes.birthdate,
                "Age": getAge(attributes.birthdate),
                "Is Child": attributes.child,
                "Gender": attributes.gender,
                "Grade": attributes.grade,
                "Membership": attributes.membership,
                "Status" : attributes.status
            }

            let campusName = undefined;
    
            if (relationships.primary_campus.data != null) {
                let campus = CAMPUSES.find((e) => e.id == relationships.primary_campus.data.id);
                console.log(campus);
                campusName = campus.attributes.name;
            }

            Object.assign(person, {"Campus Name": campusName})

            // let householdID = undefined;
            // let householdInfo = relationships.households.data

            // if(householdInfo != null){
            //     let tempArray = []
                
            //     for(let i = 0; i < householdInfo.length ; i++){
            //         let household = HOUSEHOLDS.find((home) => home.id == relationships.households.data[i].id);
            //         tempArray.push(household.attributes.name)
            //     }
                
            //     householdID = tempArray;
            // }

            // Object.assign(person, {"Household ID": householdID.join(", ")})
    
            newPeopleArray.push(person);
        }
    
    }


    // parsing the data from the sheet if we are requesting only updated info.
    if(onlyUpdated){
        return compareWithSpreadsheet(newPeopleArray, "Person ID", tab)
    } else {
        return newPeopleArray
    }

}



