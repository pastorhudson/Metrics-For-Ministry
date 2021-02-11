

function isAdminUser() {
  return true
}

// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig(request, step) {

  const configParams = request.configParams;

  console.log(configParams)
  const isFirstStep = configParams === undefined;
  let isSecondStep = false;
  let isThirdStep = false;

  var cc = DataStudioApp.createCommunityConnector();
  const config = cc.getConfig();

  if(!isFirstStep){
    isSecondStep = (configParams.haveAccess == null) ? true : false;

    if(!isSecondStep){
      isThirdStep = (configParams.pcoConnectorType == "people" || configParams.pcoConnectorType == "checkins") ? true : false;
    } else {
      config.setIsSteppedConfig(true);
    }
  }

  if (isFirstStep) {
    config.setIsSteppedConfig(true);
  }

  config.newInfo()
    .setId('Metrics for Ministry Instructions')
    .setText(
      'This connector supports data coming from Google Sheets. In order to use this you must have already configured Google Sheets to contain your PCO information. Once that is done you will configure a connector here for each type of data that you want to connect. '
    );

  config
    .newTextInput()
    .setId('spreadsheetIdSingle')
    .setName('Spreadsheet ID')
    .setHelpText('This is the ID for the spreadsheet where Metrics for Ministry is configured.')
    .setPlaceholder('spreadsheet id here.');

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


  if (isSecondStep) {

    //   if (configParams.spreadsheetIdSingle != spreadsheetID || configParams.spreadsheetIdSingle === undefined || configParams.spreadsheetIdSingle == '') {
    if (configParams.spreadsheetIdSingle === undefined || configParams.spreadsheetIdSingle == '') {
      cc.newUserError().setText('You must add a spreadsheet ID or verify you are using the right spreadsheet ID.').throwException();
    } else if (configParams.spreadsheetIdSingle.length > 1) {


      config.newInfo()
        .setId('testSpreadsheet')
        .setText(
          `To ensure you have access to this spreadsheet attempt to open this URL. - https://docs.google.com/spreadsheets/d/${configParams.spreadsheetIdSingle}`
        );

      config.newCheckbox()
        .setId("haveAccess")
        .setName("I have access to the spreadsheet")
        .setHelpText("Check here if you have access to the above spreadsheet")
        }



    } else if(isThirdStep) {

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

    //setUserProperty("activeSpreadsheetID", configParams.spreadsheetIdSingle);

    }






  return config.build();
}


