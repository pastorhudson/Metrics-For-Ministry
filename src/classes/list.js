class List {
    constructor(id, description, listName, totalPeople) {
        //this.syncThisList;
        this.listId = id;
        this.listDescription = description;
        this.listName = listName;
        this.totalPeople = totalPeople;
        this.campusId = undefined;
        this.campusName = undefined;
        this.categoryId = undefined;
        this.categoryName = undefined;
    }

    get syncthisList(){
        return this._syncThisList;
    }

    /**
     * @param {boolean} status - automatically set to false, to sync a list set to true.
     */
    set listSync(status) {
        this._syncThisList = status;
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



    set campus(campus){
        if (this.campusId != null) {
            campus.filter(value => {
                if (value.id == this.campusId) {
                    //console.log(value.attributes.name)
                    this.campusName = value.name;
                }
            });
        }
    }

    set category(category){
        if (this.categoryId != null) {
            category.filter(value => {
                if (value.id == this.categoryId) {
                    //console.log(value.attributes.name)
                    this.categoryName = value.name;
                }
            });
        }
    }

}

class ListPeople extends List {
    constructor(id, description, listName, totalPeople, personID){
        super(id, description, listName, totalPeople)
        this.personID = personID
    }
}