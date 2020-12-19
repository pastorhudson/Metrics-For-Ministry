class List {
    constructor(id,description, listName, campusId, categoryId, personId = ""){
        this.listId = id;
        this.listDescription = description;
        this.listName = listName;
        this.campusId = campusId;
        this.campusName = "";

        this.categoryId = categoryId;
        this.categoryName = "";
        this.personId = personId;
        
    }

    /**
     * @param {array} included - data coming from the list
     */

     // TODO - currently this function writes the values for campusName and CategoryName. Need to look into making set in the constructor


    set includes(included) {
            if( this.campusId != null ){
                included.filter( value => {
                    let type = value.type;
                    if( value.id == this.campusId && type == "Campus"){
                        //console.log(value.attributes.name)
                        this.campusName = value.attributes.name;
                    }
                });
            }
            if( this.categoryId != null ){
                included.filter( value => {
                    let type = value.type;
                    if( value.id == this.categoryId && type == "ListCategory"){
                        //console.log(value.attributes.name)
                        this.categoryName =  value.attributes.name;
                    }
                });
            }

    }


}