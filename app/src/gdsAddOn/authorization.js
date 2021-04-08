
/**
 * Returns the Auth Type of this connector.
 * @return {object} The Auth type.
 */
function getAuthType() {
  const cc = DataStudioApp.createCommunityConnector();

  return cc.newAuthTypeResponse()
    .setAuthType(cc.AuthType.NONE)
    .build();
}

/**
 * Gets the 3P authorization URL.
 * @return {string} The authorization URL.
 * @see https://developers.google.com/apps-script/reference/script/authorization-info
 */
function get3PAuthorizationUrls() {
  return getOAuthService().getAuthorizationUrl();
}


/**
 * Resets the auth service.
 */
function resetAuth() {
  getOAuthService().reset();
}

/**
 * Returns true if the auth service has access.
 * @return {boolean} True if the auth service has access.
 */
function isAuthValid() {
  return getOAuthService().hasAccess();
}



/**
 * Returns the configured OAuth Service.
 * @return {Service} The OAuth Service
 */
function getOAuthService(requestedModules) {
  var scriptProperties = PropertiesService.getScriptProperties();
  var clientID = scriptProperties.getProperty('clientID');
  var clientSecret = scriptProperties.getProperty('clientSecret');

  return OAuth2.createService('metricsForMinistry')
    .setAuthorizationBaseUrl("https://api.planningcenteronline.com/oauth/authorize")
    .setTokenUrl("https://api.planningcenteronline.com/oauth/token")
    .setClientId(clientID)
    .setClientSecret(clientSecret)
    .setPropertyStore(PropertiesService.getUserProperties())
    .setCallbackFunction('authCallback')
    .setScope(requestedModules);
};



// TODO

// [ ] - Need to create the authorized response to go to Savvy's site where the GDS guide is. This might be on gitbook.io as well.
// [ ] - create a denied response on Gitbook.

/**
 * The OAuth callback.
 * @param {object} request The request data received from the OAuth flow.
 * @return {HtmlOutput} The HTML output to show to the user.
 */

function authCallback(request) {
  const testService = getOAuthService();
  var authorized = testService.handleCallback(request);
  console.log(authorized)
  if (authorized) {
    return HtmlService.createHtmlOutputFromFile('sheetsAddOn/signin-success');
  } else {
    return HtmlService.createHtmlOutputFromFile('sheetsAddOn/signin-failure');
  };
};

// function signinWindow(loginStatus){
//   const html = HtmlService.createTemplateFromFile('sheetsAddOn/signin');
//   html.signin = loginStatus;
//   return html.evaluate().getContent();

// }

async function initialConfiguration() {

  var service = getOAuthService();
  if (service.hasAccess()) {
    setActiveSpreadsheetID();
    pcoModuleUserProperties(undefined);
    setUpDocument();
    deleteSheet("Metrics for Ministry has been reset");
    addTriggers();
    //setUserProperty("isSignedIn", "true");
    setUserProperty('syncStatus', "ready");
    getOrgData();
    setUserProperty('syncUpdatedOnly', 'false');
    //updateListTab();
    await initialListSync()
    showSidebar();
  } else {
    sheetsUiError("Not Signed In","It appears that you're not signed in. Try to Authorize again. If the issue persists email hello@savvytoolbelt.com for help.")
  }
}