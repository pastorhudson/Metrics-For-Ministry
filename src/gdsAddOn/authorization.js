
/**
 * Returns the Auth Type of this connector.
 * @return {object} The Auth type.
 */
function getAuthType() {
  const cc = DataStudioApp.createCommunityConnector();
  
  return cc.newAuthTypeResponse()
    .setAuthType(cc.AuthType.OAUTH2)
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

  
  return OAuth2.createService('pcoToGdsConnector')
    .setAuthorizationBaseUrl("https://api.planningcenteronline.com/oauth/authorize")
    .setTokenUrl("https://api.planningcenteronline.com/oauth/token")
    .setClientId("bdfe8251b60e0dda3c726ba1a2ba73d0e2757b4d46f0a7c947327e8edf6372cc")
    .setClientSecret("f8bd1c1594c349e2a72da503f5f1bd30716c6f65a0e9097972d32132aedb01a1")
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
  var authorized = getOAuthService().handleCallback(request);
  console.log(authorized)
  if (authorized) {

    
    setActiveSpreadsheetID();
    pcoModuleUserProperties(undefined);
    setUpDocument();
    deleteSheet("Metrics for Ministry has been reset");
    dailySyncAdd();
    setUserProperty("isSignedIn","true");
    setUserProperty('syncStatus', "ready")
    getOrgData();

    return HtmlService.createHtmlOutput('Success. You can close this tab');
  } else {
    return HtmlService.createHtmlOutput('Denied. You can close this tab');
  };
};

