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
        let {attributes, id} = campus;
        let elementCampus = {}
        elementCampus.id = id;
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

        const { attributes, id } = element;
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
    const CAMPUSES = listApiCall.included.filter((e) => { if (e.type == "Campus" && listApiCall.included.findIndex(t => (e.id === t.id)) == listApiCall.included.indexOf(e)) { return e } })
    const CATEGORIES = listApiCall.included.filter((e) => { if (e.type == "ListCategory" && listApiCall.included.findIndex(t => (e.id === t.id)) == listApiCall.included.indexOf(e)) { return e } })

    let listArrayListData = [];

    for (const list of listApiCall.data) {
        let {attributes, relationships, id} = list

        let {name, total_people, description} = attributes

        description = description.replaceAll("'", '"')

        if (name == null) { name = description }

        let campusName = () => {
            if(relationships.campus.data != null){
                return CAMPUSES.find(campus => campus.id == relationships.campus.data.id).attributes.name
            }
            return null
        }

        let categoryName = () => {
            if(relationships.category.data != null){
                return CATEGORIES.find(category => category.id == relationships.category.data.id).attributes.name
            }
            return null
        }

        let subList = {
            'List ID': id,
            'List Description': description,
            'List Name': name,
            'Total People': total_people,
            'Campus Name' : campusName(),
            'Category Name': categoryName()
        }

        listArrayListData.push(subList);
        
    }

    //console.log(listArrayListData)

    return listArrayListData;

}


async function getListsWithPeople(onlyUpdated, tab) {

    // returning the eitire list so we can use the attributes on the list.
    const syncTheseLists = () => {
        const tabs = tabNamesReturn();
        return getSpreadsheetDataByName(tabs.people.listTab.name)
            .filter(list => list["Sync This List"] == true )
            //.map(list => list['List ID'])
    }

    let listPeopleArray = [];

    for(list of syncTheseLists()){
        let listId= list["List ID"]
       listApiCall = await pcoApiCall(`https://api.planningcenteronline.com/people/v2/lists/${listId}/people`, false , true, "&fields[Person]=id");

        console.log(listApiCall.data.length)

        listApiCall.data.forEach(person => {
            let personArray = {
                'Person ID': person.id,
                'List ID' : list['List ID']
            }
            listPeopleArray.push(personArray)
        })
    }
    return listPeopleArray


}


function getAge(birthday) {
    if (birthday != null) {
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

    const apiCall = await pcoApiCall("https://api.planningcenteronline.com/people/v2/people", onlyUpdated, true, '&include=households,primary_campus');

    const CAMPUSES = apiCall.included.filter((e) => { if (e.type == "Campus" && apiCall.included.findIndex(t => (e.id === t.id)) == apiCall.included.indexOf(e)) { return e } })


    let newPeopleArray = [];

    if (apiCall.data.length > 0) {
        for (const element of apiCall.data) {

            let {attributes, relationships, id} = element
            let {birthdate, child, gender, grade, membership, status} = attributes


            let person = {
                'Person ID': element.id,
                "Birthday": birthdate,
                "Age": getAge(birthdate),
                "Is Child": child,
                "Gender": gender,
                "Grade": grade,
                "Membership": membership,
                "Status": status
            }

            let campusName = undefined;

            if (relationships.primary_campus.data != null) {
                campusName = CAMPUSES.find((e) => e.id == relationships.primary_campus.data.id).attributes.name
            }

            Object.assign(person, { "Campus Name": campusName })

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
    if (onlyUpdated) {
        return compareWithSpreadsheet(newPeopleArray, "Person ID", tab)
    } else {
        return newPeopleArray
    }

}



