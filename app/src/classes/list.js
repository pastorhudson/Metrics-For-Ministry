class List {
    constructor(id, description, listName, totalPeople) {
        //this.syncThisList;
        this['List ID'] = id;
        this['List Description'] = description;
        this['List Name'] = listName;
        this['Total People'] = totalPeople;
        this['Campus ID'] = undefined;
        this['Campus Name'] = undefined;
        this['Category ID'] = undefined;
        this['Category Name'] = undefined;
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
            this['Campus ID'] = listData.campus.data.id;

        } else {
            this['Campus ID'] = null;
        }
        if (listData.category.data != null) {
            this['Category ID'] = listData.category.data.id;

        } else {
            this['Category ID'] = null;
        }
    }



    set campus(campus){
        if (this['Campus ID'] != null) {
            campus.filter(value => {
                if (value.id == this['Campus ID']) {
                    //console.log(value.attributes.name)
                    this['Campus Name'] = value.name;
                }
            });
        }
    }

    set category(category){
        if (this['Category ID'] != null) {
            category.filter(value => {
                if (value.id == this['Category ID']) {
                    //console.log(value.attributes.name)
                    this['Category Name'] = value.name;
                }
            });
        }
    }

}

class ListPeople extends List {
    constructor(id, description, listName, totalPeople, personID){
        super(id, description, listName, totalPeople)
        this['Person ID'] = personID
    }
}