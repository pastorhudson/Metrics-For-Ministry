async function getCampuses() {

    /**
     * The campus data call
     * 
     * @return {campusArray} - filtered array of the campus data. For how this should look, check out the examples readme.
     * @description - This function returns the array of our campuses. This is a bit more reliable than running an 'includes'
     */

    const campusApiCall = await pcoApiCall("https://api.planningcenteronline.com/people/v2/campuses", false, false, '');
    let campusArray = [];

    campusApiCall.forEach(campus => {
        const { attributes: { name }, id } = campus;
        campusArray.push({ name, id });
    });

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

    apiCall.forEach(category => {
        const { attributes: { name }, id } = category;
        categoryArray.push({ id, name });
    })


    return categoryArray;
}

async function getLists(onlyUpdated = false, tab) {

    console.log(onlyUpdated)

    let data = []
    const id_attribute = "List ID"

    

    try {
        const apiCall = await pcoApiCall("https://api.planningcenteronline.com/people/v2/lists", onlyUpdated, true, "&include=campus,category");
        if(apiCall.length == 0){
            console.log('Lists --- Nothing to Sync')
        } else {
            const CAMPUSES = apiCall.included.filter(e => e.type == "Campus")
            const CATEGORIES = apiCall.included.filter(e => e.type == "ListCategory")
            
            apiCall.data.forEach(list => {
                let { attributes, relationships, id } = list
        
                let { name, total_people, description, updated_at } = attributes
        
                description = description.replaceAll("'", '"')
        
                if (name == null) { name = description }
        
                let campusName = () => {
                    if (relationships.campus.data != null) {
                        return CAMPUSES.find(campus => campus.id == relationships.campus.data.id).attributes.name
                    }
                    return null
                }
        
                let categoryName = () => {
                    if (relationships.category.data != null) {
                        return CATEGORIES.find(category => category.id == relationships.category.data.id).attributes.name
                    }
                    return null
                }
        
                let subList = {
                    'List ID': id,
                    'Updated At':updated_at, 
                    'List Description': description,
                    'List Name': name,
                    'Total People': total_people,
                    'Campus Name': campusName(),
                    'Category Name': categoryName()
                }
        
                data.push(subList);
        
            })
        }
        
    } catch (error){
        statusReturn(data, `Error: ${error}`, onlyUpdated, tab, id_attribute)
    }
    
    return statusReturn(data, `Sync Successful`, onlyUpdated, tab, id_attribute)

}


async function getListsWithPeople(onlyUpdated, tab) {
    onlyUpdated = false;

    let data = []
    const id_attribute = "Person ID"

    try {

        // returning the eitire list so we can use the attributes on the list.
        const syncTheseLists = () => {
            const tabs = tabNamesReturn();
            return getSpreadsheetDataByName(tabs.people.listTab.name)
                .filter(list => list["Sync This List"] == true)
            //.map(list => list['List ID'])
        }

        
        for (list of syncTheseLists()) {
            let listId = list["List ID"]
            listApiCall = await pcoApiCall(`https://api.planningcenteronline.com/people/v2/lists/${listId}/people`, false, true, "&fields[Person]=id");

            listApiCall.data.forEach(person => {
                let personArray = {
                    'Person ID': person.id,
                    'List ID': list['List ID']
                }
                data.push(personArray)
            })
        }
    } catch (error) {
        statusReturn(data, `Error: ${error}`, onlyUpdated, tab, id_attribute)
    }

    return statusReturn(data, `Sync Successful`, onlyUpdated, tab, id_attribute)


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


function statusReturn(data, message, onlyUpdated, tab, id_attribute) {

    let type = 'Full Sync'
    if (onlyUpdated) { type = 'Only Updated' }
    return {
        data: (onlyUpdated) ? compareWithSpreadsheet(data, id_attribute, tab) : data,
        status: {
            sync_total: data.length,
            message,
            type
        }
    }
}


async function personDataCall(onlyUpdated, tab) {
    /**
     * The person data call
     * 
     * @return {personArray} - filtered array of the people on PCO. check out the readme for more information on how this is structured.
     * @description - 
     */

    let data = [];
    const id_attribute = "Person ID"

    try {
        const apiCall = await pcoApiCall("https://api.planningcenteronline.com/people/v2/people", onlyUpdated, true, '&include=households,primary_campus');

        if (apiCall.length == 0) {
            console.log('People --- Nothing to Sync')
        } else {
            const CAMPUSES = apiCall.included.filter((e) => { if (e.type == "Campus" && apiCall.included.findIndex(t => (e.id === t.id)) == apiCall.included.indexOf(e)) { return e } })

            if (apiCall.data.length > 0) {
                for (const element of apiCall.data) {

                    let { attributes, relationships, id } = element
                    let { birthdate, child, gender, grade, membership, status } = attributes


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
                    data.push(person);
                }

            }

            status = 'Sync Successful'
        }
    } catch (error) {
        statusReturn(data, `Error: ${error}`, onlyUpdated, tab, id_attribute)
    }

    // parsing the data from the sheet if we are requesting only updated info.
    if (onlyUpdated) {
        return statusReturn(data, `Sync Successful`, onlyUpdated, tab, id_attribute)
    } else {
        return statusReturn(data, `Sync Successful`, onlyUpdated, tab, id_attribute)
    }

}



