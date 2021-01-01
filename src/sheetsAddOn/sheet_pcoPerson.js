
/**
 * The campus data call
 * 
 * @return {campusArray} - filtered array of the campus data. For how this should look, check out the examples readme.
 * @description - This function returns the array of our campuses. This is a bit more reliable than running an 'includes'
 */
async function getCampuses() {
    const campusApiCall = await pcoApiLoopedCall("https://api.planningcenteronline.com/people/v2/campuses");
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

/**
 * The cateogory data call
 * 
 * @return {categoryArray} - filtered array of the list category data For how this should look, check out the examples readme.
 * @description - This function returns the array of the list category data. This is a bit more reliable than running an 'includes'
 */
async function getListCategories() {
    const apiCall = await pcoApiLoopedCall("https://api.planningcenteronline.com/people/v2/list_categories");
    let categoryArray = [];

    for (const element of apiCall) {
        let attributes = element.attributes;
        let subElement = {}
        subElement.id = element.id;
        subElement.name = attributes.name;
        categoryArray.push(subElement);
    }

    //console.log(categoryArray)

    return categoryArray;
}

async function getLists() {
    let listApiCall = await pcoApiLoopedCall("https://api.planningcenteronline.com/people/v2/lists", true, "&include=campus,category");
    let campuses = await getCampuses();
    let categories = await getListCategories();

    let listArrayListData = [];

    for (const list of listApiCall) {
        let relationships = list.relationships;
        let subList = new List(
            list.id,
            list.attributes.description.replaceAll("'", '"'),
            list.attributes.name,
            list.attributes.total_people);
        subList.relationships = relationships;
        //subList.listSync = null;
        subList.campus = campuses;
        subList.category = categories;

        listArrayListData.push(subList);
    }

    //console.log(listArrayListData)

    return listArrayListData;

}

async function getListsWithPeople() {
    let listApiCall = await pcoApiLoopedCall("https://api.planningcenteronline.com/people/v2/lists", true, "&include=campus,category,people");
    let campuses = await getCampuses();
    let categories = await getListCategories();

    let listArrayListData = [];

    for (const list of listApiCall) {
        let relationships = list.relationships;
        console.log(relationships)
        let people = relationships.people.data
        for(const person of people){
            let subList = new ListPeople(
                list.id,
                list.attributes.description.replaceAll("'", '"'),
                list.attributes.name,
                list.attributes.total_people,
                person.id);
            subList.relationships = relationships;
            subList.campus = campuses;
            subList.category = categories;
            subList.personID = person.id;
            listArrayListData.push(subList);
        }

    }

    let updateListData = await updateListTab();
    let syncTheseLists = [];
    let syncThesePeople = [];

    for(list of updateListData){
        if(list._syncThisList == true){
            syncTheseLists.push(list.listId);
        }
    }

    for(i = 0 ; i < listArrayListData.length ; i++){
        let value = syncTheseLists.indexOf(listArrayListData[i].listId);
        if(value != -1){
            syncThesePeople.push(listArrayListData[i])
        }
    }

    return syncThesePeople;

}

// async function getListsWithPeople() {
//     let listWithSyncables = await updateListTab();
//     console.log(listWithSyncables.length);
//     let campuses = await getCampuses();
//     let categories = await getListCategories();

//     let listArrayListData = [];

//     for (const list of listWithSyncables) {
//         let listID = list.listId;

//         if(list._syncThisList){
//             let listApiCall = await pcoApiLoopedCall(`https://api.planningcenteronline.com/people/v2/lists/${list.listId}`, true, "&include=people");
//             console.log(listApiCall)

//             let relationships = listApiCall.relationships;
//             console.log(relationships)
//             let people = relationships.people.data
//             for(const person of people){

//                 list.personID = person.id;
        
//                 listArrayListData.push(list);
//             }


//         }


//     }

//     console.log(listArrayListData)

//     return listArrayListData;

// }



/**
 * The person data call
 * 
 * @return {personArray} - filtered array of the people on PCO. check out the readme for more information on how this is structured.
 * @description - 
 */
async function personDataCall() {

    const personData = await pcoApiLoopedCall("https://api.planningcenteronline.com/people/v2/people");
    const campusArray = await getCampuses();

    let personArray = [];

    for (const element of personData) {
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

    console.log(personArray[9000]);
    console.log(personArray.le)

    return personArray;

}

