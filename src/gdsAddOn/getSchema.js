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


  var cc = DataStudioApp.createCommunityConnector();
  var fields = cc.getFields();
  var types = cc.FieldType;
  const connectorType = request.configParams.pcoConnectorType;
  const moduleDataJson = tabNamesReturn();

  if (connectorType == 'people') {
    validateConfig(request.configParams);

    const peopleInfo = moduleDataJson.people.peopleInfo;
    const peopleDataJson = moduleDataJson.people.personTab;
    const listDataJson = moduleDataJson.people.listPeopleTab;

    if (request.configParams.peopleSelectorType == "peopleData") {
      fields.newDimension()
        .setId(peopleDataJson.dimensions.birthday.id)
        .setName(peopleDataJson.dimensions.birthday.name)
        .setDescription(peopleDataJson.dimensions.birthday.description)
        .setType(types.DATE)

      fields.newDimension()
        .setId(peopleDataJson.dimensions.age.id)
        .setName(peopleDataJson.dimensions.age.name)
        .setDescription(peopleDataJson.dimensions.age.description)
        .setType(types.DATE)

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
      .setId(peopleInfo.metrics.personCount.id)
      .setName(peopleInfo.metrics.personCount.name)
      .setType(types.NUMBER)
      .setDescription(peopleInfo.metrics.personCount.description)

  } else if (connectorType == 'giving') {
    const givingDataJson = moduleDataJson.giving.donationsTab;

    fields.newDimension()
      .setId(givingDataJson.dimensions.donationId.id)
      .setName(givingDataJson.dimensions.donationId.name)
      .setDescription(givingDataJson.dimensions.donationId.description)
      .setType(types.TEXT)

    fields.newDimension()
      .setId(givingDataJson.dimensions.personId.id)
      .setName(givingDataJson.dimensions.personId.name)
      .setDescription(givingDataJson.dimensions.personId.description)
      .setType(types.TEXT)

    fields.newDimension()
      .setId(givingDataJson.dimensions.updatedAt.id)
      .setName(givingDataJson.dimensions.updatedAt.name)
      .setDescription(givingDataJson.dimensions.updatedAt.description)
      .setType(types.YEAR_MONTH_DAY_SECOND)

    fields.newDimension()
      .setId(givingDataJson.dimensions.recievedAt.id)
      .setName(givingDataJson.dimensions.recievedAt.name)
      .setDescription(givingDataJson.dimensions.recievedAt.description)
      .setType(types.YEAR_MONTH_DAY_SECOND)

    fields.newDimension()
      .setId(givingDataJson.dimensions.paymentMethod.id)
      .setName(givingDataJson.dimensions.paymentMethod.name)
      .setDescription(givingDataJson.dimensions.paymentMethod.description)
      .setType(types.TEXT)

    fields.newDimension()
      .setId(givingDataJson.dimensions.paymentMethodType.id)
      .setName(givingDataJson.dimensions.paymentMethodType.name)
      .setDescription(givingDataJson.dimensions.paymentMethodType.description)
      .setType(types.TEXT) 

    fields.newDimension()
      .setId(givingDataJson.dimensions.status.id)
      .setName(givingDataJson.dimensions.status.name)
      .setDescription(givingDataJson.dimensions.status.description)
      .setType(types.TEXT)

    fields.newDimension()
      .setId(givingDataJson.dimensions.cardBrand.id)
      .setName(givingDataJson.dimensions.cardBrand.name)
      .setDescription(givingDataJson.dimensions.cardBrand.description)
      .setType(types.TEXT)

    fields.newDimension()
      .setId(givingDataJson.dimensions.source.id)
      .setName(givingDataJson.dimensions.source.name)
      .setDescription(givingDataJson.dimensions.source.description)
      .setType(types.TEXT)

    fields.newDimension()
      .setId(givingDataJson.dimensions.labels.id)
      .setName(givingDataJson.dimensions.labels.name)
      .setDescription(givingDataJson.dimensions.labels.description)
      .setType(types.TEXT)

    fields.newDimension()
      .setId(givingDataJson.dimensions.fundName.id)
      .setName(givingDataJson.dimensions.fundName.name)
      .setDescription(givingDataJson.dimensions.fundName.description)
      .setType(types.TEXT)

    fields.newDimension()
      .setId(givingDataJson.dimensions.ledgerCode.id)
      .setName(givingDataJson.dimensions.ledgerCode.name)
      .setDescription(givingDataJson.dimensions.ledgerCode.description)
      .setType(types.TEXT)

    fields.newMetric()
      .setId(givingDataJson.metrics.amount.id)
      .setName(givingDataJson.metrics.amount.name)
      .setDescription(givingDataJson.metrics.amount.description)
      .setType(types.CURRENCY_USD)

    fields.newMetric()
      .setId(givingDataJson.metrics.fee.id)
      .setName(givingDataJson.metrics.fee.name)
      .setDescription(givingDataJson.metrics.fee.description)
      .setType(types.CURRENCY_USD)

    fields.newMetric()
      .setId(givingDataJson.metrics.netAmount.id)
      .setName(givingDataJson.metrics.netAmount.name)
      .setDescription(givingDataJson.metrics.netAmount.description)
      .setType(types.CURRENCY_USD)
  }


  return { 'schema': fields.build() };
}
