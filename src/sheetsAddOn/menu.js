function onInstall(e) {
  /**
   * The document is already open, so after installation is complete
   * the ˙onOpen()` trigger must be called manually in order for the
   * add-on to execute.
   */
  onOpen(e);

  deleteAllProperties();
  userData();
  
}


// add custom menu
function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('Metrics for Ministry')
    .addItem('Sidebar', 'showSidebar')
    .addItem('Log Out', 'reset')
    .addItem('Force Full Sync', 'resetFullSyncStatus')
    .addSubMenu(ui.createMenu('Sync Specific Modules')
              .addItem('Giving', 'syncGiving')
              .addItem('Check-ins', 'syncCheckins')
              .addItem('People', 'syncPeople'))
    //.addItem('Setup Properties', 'newUserUserProperties')
    .addToUi();
}


// Display's the sidebar
function showSidebar() {
  
  setActiveSpreadsheetID();
  userData();
  let status = getUserProperty('setupStatus');
  console.log(status)

  if (status != 'true') {
    try{
      newUserUserProperties();
      setUserProperty('setupStatus', 'true')
    } catch (err){
      setUserProperty('setupStatus', 'false')
    }

  }

  updateScripts();

  const html = HtmlService.createTemplateFromFile('sheetsAddOn/sidebar');
  const page = html.evaluate();
  page.setTitle("Savvy Tool Belt");
  SpreadsheetApp.getUi().showSidebar(page);


}

// Display's the sidebar
function showSidebarOld() {
  const html = HtmlService.createTemplateFromFile('sheetsAddOn/sidebar-old');
  const page = html.evaluate();
  page.setTitle("Savvy Tool Belt");
  SpreadsheetApp.getUi().showSidebar(page);
}


function returnData(data) {
  console.log(data)
}


function authorizeSidebarButton(requestedModules) {
  try {
    pcoModuleUserProperties(String(requestedModules))
    const Authservice = getOAuthService(String(requestedModules));
    const authorizationUrl = Authservice.getAuthorizationUrl();
    return authorizationUrl;
  }
  catch (err) {
    return err;
  }

}

function reset() {

  resetAuth();
  removeAllTriggers();
  newUserUserProperties();
  deleteSheetsCreated();

  showSidebar();

}

async function updateListPeople() {
  const tabs = tabNamesReturn();
  await updateListTab();
  pushToSheet(tabs.people.listPeopleTab, await getListsWithPeople());
}