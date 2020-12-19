
function isAdminUser(){
  return true
}

// https://developers.google.com/datastudio/connector/reference#getconfig
function getConfig() {
  const cc = DataStudioApp.createCommunityConnector();

  const config = cc.getConfig();

  config.newInfo()
    .setId('PCO People Connector Instructions')
    .setText(
      'This PCO People connector supports two connection types - people data and list data. Select what you are attempting to connect. You can add two connecters to capture both sets of data.'
    );

    config
    .newSelectSingle()
    .setId('peopleSelectorType')
    .setName('Select Data Type')
    .setHelpText('Select if this will be a People Data or List Data connector.')
    .setAllowOverride(false)
    .addOption(config.newOptionBuilder().setLabel('People Data').setValue('peopleData'))
    .addOption(config.newOptionBuilder().setLabel('List Data').setValue('listData'))

  return config.build();
}


