let cc = DataStudioApp.createCommunityConnector();


//Throws an error if they have not selected the list type for this connector.

function validateConfig(config) {
  var config = config || {};
  if (!config.peopleSelectorType) {
    cc.newUserError()
      .setText('You must select a connector type of either People Data or List Data.')
      .throwException();
  }

  return true;
}

function getSchema(request) {
  console.log(request);

  validateConfig(request.configParams);

  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  const connectorType = request.configParams.pcoConnectorType;
  const moduleDataJson = tabNamesReturn();

  if (connectorType == 'people') {

    const peopleInfo = moduleDataJson.people.peopleInfo;
    const peopleDataJson = moduleDataJson.people.personTab;
    const listDataJson = moduleDataJson.people.listPeopleTab;

    if (request.configParams.peopleSelectorType == "peopleData") {
      fields.newDimension()
        .setId(peopleDataJson.dimensions.birthday.id)
        .setName(peopleDataJson.dimensions.birthday.name)
        .setDescription(peopleDataJson.dimensions.birthday.description)
        .setType(types.YEAR_MONTH_DAY)

      fields.newDimension()
        .setId(peopleDataJson.dimensions.age.id)
        .setName(peopleDataJson.dimensions.age.name)
        .setDescription(peopleDataJson.dimensions.age.description)
        .setType(types.NUMBER)

      fields.newDimension()
        .setId(peopleDataJson.dimensions.ageRange.id)
        .setName(peopleDataJson.dimensions.ageRange.name)
        .setDescription(peopleDataJson.dimensions.ageRange.description)
        .setFormula(peopleDataJson.dimensions.ageRange.formula)
        .setType(types.TEXT)


      fields.newDimension()
        .setId(peopleDataJson.dimensions.gender.id)
        .setName(peopleDataJson.dimensions.gender.name)
        .setDescription(peopleDataJson.dimensions.gender.description)
        .setType(types.TEXT)

      fields.newDimension()
        .setId(peopleDataJson.dimensions.grade.id)
        .setName(peopleDataJson.dimensions.grade.name)
        .setDescription(peopleDataJson.dimensions.grade.description)
        .setType(types.NUMBER)

      fields.newDimension()
        .setId(peopleDataJson.dimensions.isChild.id)
        .setName(peopleDataJson.dimensions.isChild.name)
        .setDescription(peopleDataJson.dimensions.isChild.description)
        .setType(types.BOOLEAN)

      fields.newDimension()
        .setId(peopleDataJson.dimensions.membership.id)
        .setName(peopleDataJson.dimensions.membership.name)
        .setDescription(peopleDataJson.dimensions.membership.description)
        .setType(types.TEXT)

      fields.newDimension()
        .setId(peopleDataJson.dimensions.status.id)
        .setName(peopleDataJson.dimensions.status.name)
        .setDescription(peopleDataJson.dimensions.status.description)
        .setType(types.TEXT)




    } else if (request.configParams.peopleSelectorType == "listData") {
      fields.newDimension()
        .setId(listDataJson.dimensions.listID.id)
        .setName(listDataJson.dimensions.listID.name)
        .setDescription(listDataJson.dimensions.listID.description)
        .setType(types.NUMBER);

      fields.newDimension()
        .setId(listDataJson.dimensions.listDescription.id)
        .setName(listDataJson.dimensions.listDescription.name)
        .setDescription(listDataJson.dimensions.listDescription.description)
        .setType(types.NUMBER);

      fields.newDimension()
        .setId(listDataJson.dimensions.listName.id)
        .setName(listDataJson.dimensions.listName.name)
        .setDescription(listDataJson.dimensions.listName.description)
        .setType(types.NUMBER);


      fields.newDimension()
        .setId(listDataJson.dimensions.categoryID.id)
        .setName(listDataJson.dimensions.categoryID.name)
        .setDescription(listDataJson.dimensions.categoryID.description)
        .setType(types.NUMBER);

      fields.newDimension()
        .setId(listDataJson.dimensions.categoryName.id)
        .setName(listDataJson.dimensions.categoryName.name)
        .setDescription(listDataJson.dimensions.categoryName.description)
        .setType(types.TEXT)


    }

    fields.newDimension()
      .setId(peopleInfo.dimensions.personID.id)
      .setName(peopleInfo.dimensions.personID.name)
      .setDescription(peopleInfo.dimensions.personID.description)
      .setType(types.NUMBER)

    fields.newDimension()
      .setId(peopleInfo.dimensions.campusID.id)
      .setName(peopleInfo.dimensions.campusID.name)
      .setDescription(peopleInfo.dimensions.campusID.description)
      .setType(types.NUMBER)

    fields.newDimension()
      .setId(peopleInfo.dimensions.campusName.id)
      .setName(peopleInfo.dimensions.campusName.name)
      .setDescription(peopleInfo.dimensions.campusName.description)
      .setType(types.TEXT)

    fields.newMetric()
      .setId(peopleInfo.dimensions.personCount.id)
      .setName(peopleInfo.dimensions.personCount.name)
      .setType(types.NUMBER)
      .setDescription(peopleInfo.dimensions.personCount.description)
  }


  return { 'schema': fields.build() };
}
