
function isAdminUser() {
  return true
}

// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig(request) {

  const configParams = request.configParams;

  console.log(configParams)
  const isFirstRequest = configParams === undefined;
  var cc = DataStudioApp.createCommunityConnector();
  const config = cc.getConfig();

  if (isFirstRequest) {
    config.setIsSteppedConfig(true);

  }

  config.newInfo()
    .setId('Metrics for Ministry Instructions')
    .setText(
      'This connector supports data coming from Google Sheets. In order to use this you must have already configured Google Sheets to contain your PCO information. Once that is done you will configure a connector here for each type of data that you want to connect. '
    );

  let spreadsheetID = getUserProperty('activeSpreadsheetID');
  let option1 = config.newOptionBuilder()
    .setLabel("null - set up the Google Sheets Addon first")
    .setValue("null - set up the Google Sheets Addon first");

  if (spreadsheetID != null) {
    config.newInfo()
      .setId('spreadsheetIDText')
      .setText(`Your Spreadsheet ID is: ${spreadsheetID}. If this is blank that means you have not configured the Google Sheets integration yet. Please configure that first.`)

    option1 = config.newOptionBuilder()
      .setLabel(spreadsheetID)
      .setValue(spreadsheetID);

  } else {

    config.newInfo()
      .setId('spreadsheetIDText')
      .setText(`It looks like you have not set up the Google Sheets add on yet. Please configure this first. For more information go to https://docs.metricsforministry.com. Please note that you must use the same Google account for this connector as you used to set up the Metrics for Ministry plugin. Once you have set that up click next or refresh the page to continue setup.`)

    //console.log(err)

    return config.build();


    }

  config.newSelectSingle()
    .setId('spreadsheetIdSingle')
    .setName('Spreadsheet ID')
    .setHelpText("There should only be one item in the dropdown, that's your spreadsheet ID.")
    .addOption(option1)


  //can look at making this dynamic based on what modules they have enabled. 
  config
    .newSelectSingle()
    .setId('pcoConnectorType')
    .setName('Select Connector Type')
    .setHelpText('Select which PCO module this connector is for.')
    .setAllowOverride(false)
    .setIsDynamic(true)
    // to do - can I make this dynamic here?
    .addOption(config.newOptionBuilder().setLabel('People').setValue('people'))
    .addOption(config.newOptionBuilder().setLabel('Giving').setValue('giving'))
    .addOption(config.newOptionBuilder().setLabel('Check-ins').setValue('checkins'))
    .addOption(config.newOptionBuilder().setLabel('Groups').setValue('groups'))
    .addOption(config.newOptionBuilder().setLabel('Calendar').setValue('calendar'))
    .addOption(config.newOptionBuilder().setLabel('Services').setValue('services'))


  if (!isFirstRequest) {

    if (configParams.spreadsheetIdSingle != spreadsheetID || configParams.spreadsheetIdSingle === undefined || configParams.spreadsheetIdSingle == '') {
      cc.newUserError().setText('You must add a spreadsheet ID or verify you are using the right spreadsheet ID.').throwException();
    }

    if (configParams.pcoConnectorType === undefined) {
      cc.newUserError().setText('You must select a Connector Type').throwException();
    }

    //this is currently stopping the stepped config. 
    config.setIsSteppedConfig(false);

    // need to make a block for each module as they're enabled.
    if (configParams.pcoConnectorType == "people") {
      config
        .newSelectSingle()
        .setId('peopleSelectorType')
        .setName('Select Data Type')
        .setHelpText('Select if this will be a People Data or List Data connector.')
        .setAllowOverride(false)
        .addOption(config.newOptionBuilder().setLabel('People Data').setValue('peopleData'))
        .addOption(config.newOptionBuilder().setLabel('List Data').setValue('listData'))

    } else if (configParams.pcoConnectorType == "checkins") {
      config
        .newSelectSingle()
        .setId('checkinsSelectorType')
        .setName('Select Data Type')
        .setHelpText('Select if this will be headcounts or people checkin data')
        .setAllowOverride(false)
        .addOption(config.newOptionBuilder().setLabel('Headcounts').setValue('headcountData'))
        .addOption(config.newOptionBuilder().setLabel('People Checkins').setValue('peopleCheckinsData'))

    }

  }

  return config.build();
}


