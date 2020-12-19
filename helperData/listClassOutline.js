
{
    listData: [
        {
            "listId" : "listId", //(data[i].id)
            "description" : "listDescription", //(data[i].attributes.description) //This appears to be a summary of the rules in long format.
            "name" : "this is a name", //(data[i].attributes.name) //name is only set if they've modified the name. Or it defaults to description.
            campus: {
                "Id" : "campus Id", // (data[i].relationships.campus.data.id)
                "Name" : "campus Name" // Need to query from (included type=campus, 
            },
            category: {
                "Id" : "category Id", // (data[i].relationships.campus.data.id)
                "Name" : "category Name" // Need to query from (included type=campus, 
            },
            people: ["personId", "personId", "personId", "personId", "personId"]

        }
    ]
}
