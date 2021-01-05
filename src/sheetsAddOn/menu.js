function onInstall(e) {
  /**
   * The document is already open, so after installation is complete
   * the ˙onOpen()` trigger must be called manually in order for the
   * add-on to execute.
   */
  onOpen(e);
}

// add custom menu
function onOpen(e) {
  var ui = SpreadsheetApp.getUi();
  ui.createMenu('PCO to GDS')
    .addItem('Sidebar', 'showSidebar')
    .addItem('Log Out', 'reset')
    .addItem('Update Sheet', 'createDialog')
    .addItem('Update Lists', 'updateListPeople')
    .addToUi();
}


// Display's the sidebar
function showSidebar() {
  const html = HtmlService.createTemplateFromFile('sheetsAddOn/sidebar');
  const page = html.evaluate();
  page.setTitle("Savvy Tool Belt");
  SpreadsheetApp.getUi().showSidebar(page);
}

function returnData(data) {
  console.log(data)
}


function authorizeSidebarButton(requestedModules) {
  pcoModuleUserProperties(String(requestedModules))
  const Authservice = getOAuthService(String(requestedModules));
  const authorizationUrl = Authservice.getAuthorizationUrl();
  return authorizationUrl;
}

function reset() {

  getOAuthService().reset();
  dailySyncRemove();
  setUserProperty("isSignedIn", "false");

}

async function updateListPeople() {
  const tabs = tabNamesReturn();
  await updateListTab();
  pushToSheet(tabs.people.listPeopleTab.name, await getListsWithPeople());
}