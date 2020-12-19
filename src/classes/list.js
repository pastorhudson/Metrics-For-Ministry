class List {
    constructor(id, description, listName, personCount) {
        this.listId = id;
        this.listDescription = description;
        this.listName = listName;
        this.personCount = personCount;
        this.campusId = undefined;
        this.campusName = undefined;
        this.categoryId = undefined;
        this.categoryName = undefined;
    }

    /**
     * @param {array} listData - data coming from the list
     */
    set relationships(listData) {
        // to do - move the below id pulling to my list class where i can just provide it the campus data.
        if (listData.campus.data != null) {
            this.campusId = listData.campus.data.id;


        } else {
            this.campusId = null;
        }
        if (listData.category.data != null) {
            this.categoryId = listData.category.data.id;

        } else {
            this.categoryId = null;
        }
    }

    /**
     * @param {array} included - data coming from the list
     */

    // TODO - currently this function writes the values for campusName and CategoryName. 

    set includes(included) {
        if (this.campusId != null) {
            included.filter(value => {
                let type = value.type;
                if (value.id == this.campusId && type == "Campus") {
                    //console.log(value.attributes.name)
                    this.campusName = value.attributes.name;
                }
            });
        }
        if (this.categoryId != null) {
            included.filter(value => {
                let type = value.type;
                if (value.id == this.categoryId && type == "ListCategory") {
                    //console.log(value.attributes.name)
                    this.categoryName = value.attributes.name;
                }
            });
        }

    }


}