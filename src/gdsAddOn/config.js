
function isAdminUser() {
  return true
}

// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig(request) {

  const configParams = request.configParams;

  let spreadsheetID = getUserProperty('activeSpreadsheetID');
  console.log(configParams)
  const isFirstRequest = configParams === undefined;
  const config = cc.getConfig();

  if (isFirstRequest) {
    config.setIsSteppedConfig(true);

  }

  config.newInfo()
    .setId('PCO People Connector Instructions')
    .setText(
      'This PCO People connector supports two connection types - people data and list data. Select what you are attempting to connect. You can add two connecters to capture both sets of data.'
    );

  config.newInfo()
    .setId('spreadsheetIDText')
    .setText(`Your Spreadsheet ID is: ${spreadsheetID}. You need to copy and paste this in the below field.`)

  const option1 = config.newOptionBuilder()
    .setLabel(spreadsheetID)
    .setValue(spreadsheetID);

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

    }

  }

  return config.build();
}


