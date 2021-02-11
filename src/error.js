/**
 * Throws User-facing errors.
 *
 * @param  {string} message Error message.
 */
function throwUserError(message) {
    DataStudioApp.createCommunityConnector()
      .newUserError()
      .setText(message)
      .throwException();
  }

function sheetsUiError(title,message) {
  var ui = SpreadsheetApp.getUi();
  ui.alert(title,message, ui.ButtonSet.OK);
}