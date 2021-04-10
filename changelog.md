# Changelog

## v1.4.1

* **General**
* * 403 Errors were not handled and caused the sync to stop mid sync
  * Lists were not synced properly on document setup
  * Fixed the check interval to now clear the interval if the sync fails
  * Added a blank line to empty sheets to prevent styles from bleeding down and out of bounds errors.

## v1.4.0

* **General**
  * Drastically improved the sync process. On average a sync takes 40% less time!
  * Optimized each module to better use the existing data.
  * Improved logging on the user side.
  * Removed the Services / Calendar options when logging into PCO
* **People**
  * Updated the List Data tab to only include the People IDs and List IDs. This is to improve Sheet storage.
  * Improved the PCO List function to only call the lists that have been selected.

## v1.3.0

* **General**
  * Added UI notifications for more prominent user notifications.   
  * Adjusted the sync time to 3am to account for PCOs update at 2am.
* **Groups**
  * Group summary connector released! This pulls general group information, alongside tabs as headers.
  * Future releases will include a connector for attendance and membership.
* **People**
  * Added age as `-1` if no birthday is configured.
  * Added`Age Range` in Google Data Studio as `Not Assigned` if no birthday.
* **Check-ins**
  * Added an additional check-in connector that pulls information about unique check-ins and not just headcounts.
* **List Data**
  * Built a list data Google Data Studio connector that pulls data from the List Data tab into Google Sheets. This allows for summary data without having to sync list people data.
* **Bug Fixes:**
  * Event IDs were not returned for Headcounts.
  * List IDs were not pulled into Google Data Studio, returned this.
  * List People synced all people, regardless of checked groups. Resolved the function of managing this.
  * 

## v1.2.0

* General
  * Sidebar enhancements to include a contact email and virtual tip jar.
  * Improved the OAuth landing page to be more dynamic
  * Created UI errors if attempting to sync from the sidebar and it fails.
  * Reworked the Setup flow to no longer require list sync, but rather a Setup Document function to run this process. This was to fix bugs in the Trigger.
  * Created an update script that runs when you open the sidebar. This will notify you if anything has been updated.
* Google Data Studio
  * Removed any user properties from Google Data Studio
* Bug Fixes:
  * Triggers were created under the HEAD deployment during the OAuth process. Moved this to the Setup Document

## v1.1.0

* Giving: 
  * Added a Date column on Donations that takes the _recievedAt_ date and converts it to the local timezone.
* Check-ins:
  * Modified the default Event Time Name to use the time start if the event time is not named.
* Google Data Studio
  * Enabled users to input a default Sheet ID
  * Created a verification to ensure the user has access to that sheet before continuing. 
* General:
  * Updated the sheet names to be more user-centric.
  * Added the ability to sync specific modules in the menu bar.

## v1.0.9

* Initial Beta Release of Metrics for Ministry

## Know Bugs:

#### General:

* If you are signed into multiple Google accounts you may have to use Incognito mode for the PCO sign-in to work. This is an issue within Google currently.

#### Google Data Studio:

* If the user does not have access to the Spreadsheet it will allow them to continue the setup and throw an error when they attempt to fetch the spreadsheet Data.



