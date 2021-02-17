

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
        .setType(types.TEXT);

      fields.newDimension()
        .setId(listDataJson.dimensions.listName.id)
        .setName(listDataJson.dimensions.listName.name)
        .setDescription(listDataJson.dimensions.listName.description)
        .setType(types.TEXT);


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
      .setId(peopleInfo.dimensions.campusName.id)
      .setName(peopleInfo.dimensions.campusName.name)
      .setDescription(peopleInfo.dimensions.campusName.description)
      .setType(types.TEXT)

    fields.newMetric()
      .setId(peopleInfo.metrics.personCount.id)
      .setName(peopleInfo.metrics.personCount.name)
      .setType(types.NUMBER)
      .setFormula(peopleInfo.metrics.personCount.formula)
      .setDescription(peopleInfo.metrics.personCount.description)

  } else if (connectorType == 'giving') {
    const givingDataJson = moduleDataJson.giving.donationsTab;

    fields.newDimension()
      .setId(givingDataJson.dimensions.donationId.id)
      .setName(givingDataJson.dimensions.donationId.name)
      .setDescription(givingDataJson.dimensions.donationId.description)
      .setType(types.NUMBER)

    fields.newDimension()
      .setId(givingDataJson.dimensions.personId.id)
      .setName(givingDataJson.dimensions.personId.name)
      .setDescription(givingDataJson.dimensions.personId.description)
      .setType(types.NUMBER)

    fields.newDimension()
      .setId(givingDataJson.dimensions.receivedAt.id)
      .setName(givingDataJson.dimensions.receivedAt.name)
      .setDescription(givingDataJson.dimensions.receivedAt.description)
      .setType(types.YEAR_MONTH_DAY_SECOND)

    fields.newDimension()
      .setId(givingDataJson.dimensions.receivedAtMonth.id)
      .setName(givingDataJson.dimensions.receivedAtMonth.name)
      .setDescription(givingDataJson.dimensions.receivedAtMonth.description)
      .setFormula(givingDataJson.dimensions.receivedAtMonth.formula)
      .setType(types.MONTH)

    fields.newDimension()
      .setId(givingDataJson.dimensions.receivedAtYear.id)
      .setName(givingDataJson.dimensions.receivedAtYear.name)
      .setDescription(givingDataJson.dimensions.receivedAtYear.description)
      .setType(types.TEXT)

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
      .setId(givingDataJson.dimensions.paymentChannel.id)
      .setName(givingDataJson.dimensions.paymentChannel.name)
      .setDescription(givingDataJson.dimensions.paymentChannel.description)
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
  } else if (connectorType == 'checkins') {

    const headcountsInfo = moduleDataJson.check_ins.headcountsTab;
    const checkinInfo = moduleDataJson.check_ins.checkinsTab;
    const genericCheckinData = moduleDataJson.check_ins.universal;

    if (request.configParams.checkinsSelectorType == "headcountData") {

      fields.newDimension()
        .setId(headcountsInfo.dimensions.countType.id)
        .setName(headcountsInfo.dimensions.countType.name)
        .setDescription(headcountsInfo.dimensions.countType.description)
        .setType(types.TEXT)

      fields.newDimension()
        .setId(headcountsInfo.metrics.count.id)
        .setName(headcountsInfo.metrics.count.name)
        .setDescription(headcountsInfo.metrics.count.description)
        .setType(types.NUMBER)


    } else if (request.configParams.checkinsSelectorType == "checkinsData") {

      fields.newDimension()
      .setId(checkinInfo.dimensions.checkinID.id)
      .setName(checkinInfo.dimensions.checkinID.name)
      .setDescription(checkinInfo.dimensions.checkinID.description)
      .setType(types.NUMBER)

      fields.newDimension()
      .setId(checkinInfo.dimensions.personID.id)
      .setName(checkinInfo.dimensions.personID.name)
      .setDescription(checkinInfo.dimensions.personID.description)
      .setType(types.NUMBER)

      fields.newDimension()
      .setId(checkinInfo.dimensions.locationID.id)
      .setName(checkinInfo.dimensions.locationID.name)
      .setDescription(checkinInfo.dimensions.locationID.description)
      .setType(types.NUMBER)

      fields.newDimension()
      .setId(checkinInfo.dimensions.locationName.id)
      .setName(checkinInfo.dimensions.locationName.name)
      .setDescription(checkinInfo.dimensions.locationName.description)
      .setType(types.TEXT)

      fields.newDimension()
      .setId(checkinInfo.metrics.count.id)
      .setName(checkinInfo.metrics.count.name)
      .setDescription(checkinInfo.metrics.count.description)
      .setType(types.NUMBER)


    }


    fields.newDimension()
      .setId(genericCheckinData.dimensions.eventId.id)
      .setName(genericCheckinData.dimensions.eventId.name)
      .setDescription(genericCheckinData.dimensions.eventId.description)
      .setType(types.NUMBER)

    fields.newDimension()
      .setId(genericCheckinData.dimensions.eventTimeID.id)
      .setName(genericCheckinData.dimensions.eventTimeID.name)
      .setDescription(genericCheckinData.dimensions.eventTimeID.description)
      .setType(types.NUMBER)

    fields.newDimension()
      .setId(genericCheckinData.dimensions.eventName.id)
      .setName(genericCheckinData.dimensions.eventName.name)
      .setDescription(genericCheckinData.dimensions.eventName.description)
      .setType(types.TEXT)

    fields.newDimension()
      .setId(genericCheckinData.dimensions.archivedAt.id)
      .setName(genericCheckinData.dimensions.archivedAt.name)
      .setDescription(genericCheckinData.dimensions.archivedAt.description)
      .setType(types.YEAR_MONTH_DAY_SECOND)

    fields.newDimension()
      .setId(genericCheckinData.dimensions.eventFrequency.id)
      .setName(genericCheckinData.dimensions.eventFrequency.name)
      .setDescription(genericCheckinData.dimensions.eventFrequency.description)
      .setType(types.TEXT)

    fields.newDimension()
      .setId(genericCheckinData.dimensions.eventTimeName.id)
      .setName(genericCheckinData.dimensions.eventTimeName.name)
      .setDescription(genericCheckinData.dimensions.eventTimeName.description)
      .setType(types.TEXT)

    fields.newDimension()
      .setId(genericCheckinData.dimensions.eventDate.id)
      .setName(genericCheckinData.dimensions.eventDate.name)
      .setDescription(genericCheckinData.dimensions.eventDate.description)
      .setType(types.YEAR_MONTH_DAY)

    fields.newDimension()
      .setId(genericCheckinData.dimensions.eventTime.id)
      .setName(genericCheckinData.dimensions.eventTime.name)
      .setDescription(genericCheckinData.dimensions.eventTime.description)
      .setType(types.TEXT)

    fields.newDimension()
      .setId(genericCheckinData.dimensions.starts.id)
      .setName(genericCheckinData.dimensions.starts.name)
      .setDescription(genericCheckinData.dimensions.starts.description)
      .setType(types.YEAR_MONTH_DAY_SECOND)

    fields.newDimension()
      .setId(genericCheckinData.dimensions.eventYearMonth.id)
      .setName(genericCheckinData.dimensions.eventYearMonth.name)
      .setDescription(genericCheckinData.dimensions.eventYearMonth.description)
      .setType(types.YEAR_MONTH)
  }


  return { 'schema': fields.build() };
}
