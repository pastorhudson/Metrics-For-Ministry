
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

  
  return OAuth2.createService('metricsForMinistry')
    .setAuthorizationBaseUrl("https://api.planningcenteronline.com/oauth/authorize")
    .setTokenUrl("https://api.planningcenteronline.com/oauth/token")
    .setClientId("16f33e2f7ef0bf0f44df437f2b00d7060a47f7c8c08e614132ad9e4a7ae176e7")
    .setClientSecret("b29cb5440cf79ab2242566cda51335d37e54dac1b9c88edc3cc5a8d8f8522555")
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

