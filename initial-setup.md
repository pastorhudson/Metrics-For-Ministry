---
description: >-
  Start here for initial setup for Metrics for Ministry. Once you've followed
  the steps below you can customize each data point.
---

# Initial Setup

{% hint style="danger" %}
You must use the same Google account throughout the entire setup to Google Data Studio. 

**It is suggested to use incognito mode to log into this integration. This is a workaround for a bug with Google.**
{% endhint %}

## Step 1 - Add Metrics for Ministry to a Google Sheet

1. Navigate to [https://sheets.google.com](https://sheets.google.com)
2. Create a new Google Sheet.
3. Name this Google Sheet something fun. 
   * Click on the name in the top left of your sheet to do this.
4. In the file bar click **Add-ons** &gt; **Get Add-ons** and search for "Metrics for Ministry"

              [Direct link here](https://workspace.google.com/marketplace/app/metrics_for_ministry/938009781292)

5. Click the install button.
   * If you see Domain and Individual install pick which one is relevant for you.
6. Go through the install process. This will have you log into your Google Account and Authorize Metrics for Ministry.
   * _If you want a description of each permission and why we requested it check that out_ [_here_](https://docs.metricsforministry.com/privacy-policy#user-data)_._
7. Now on your Google Sheet, you should see this as an option under Add-ons. If you don't, refresh and try. You may have to refresh your browser.

## Step 2 - Configure Metrics for Ministry

Now that you've downloaded ministry metrics we will walk through the basic configuration process.

{% hint style="warning" %}
For each module you select below you are required to be an admin of that module. 
{% endhint %}

1. Back on your Google Sheet click **Add-ons** &gt; **Metrics for Ministry** &gt; **Sidebar.** 
2. Click **Settings** 
3. Select the modules you want to sync and click **Authorize with PCO.**
   * _The People module is required and automatically selected._ 
4. This will prompt you to now login with Planning Center. You will have to authorize Metrics for Ministry. Once done you'll be redirected to a success page.
5. Once you're logged in click the **Setup Document** button in **Settings**.
   * This will automatically download the lists that are available within Planning Center. You can view these under the tab **List Data**
6. If you want to configure specific lists open the tab labeled **List Data**
   1. Check each box under **Sync This List** for the lists you want to sync. This will prompt with a warning you can click **Don't show again for 5 minutes**
7. Click the **Back** button on the sidebar and then click **Update Sheets**
   * This update process can take 1 minute - 5 minutes to complete based on the size of your church database.
   * **Do not close this tab or sidebar while this is syncing.**

{% hint style="info" %}
Once the above steps are completed you should see tabs according to what you configured to be active. We suggest checking the total size of your sheet to ensure that you're not hitting the Google limit. You can do this under **Info** &gt; **Total % Storage**. 
{% endhint %}

## Step 3 - Configure Your Google Data Studio Connectors

Now we will configure each module as a connector to Google Data Studio \(GDS\).

{% hint style="warning" %}
Each Module \(tab\) on your Spreadsheet will require a connector to be configured.
{% endhint %}

1. Back on your Google Sheet click **Add-ons** &gt; **Metrics for Ministry** &gt; **Sidebar.**
2. Open **Info** and copy your **Spreadsheet ID**. You'll use this for your connectors.
3. Click on **GDS Connector** on the sidebar.
   * This will open a new tab with the Google Connector where you can configure them.
   * If you've never used Google Data Studio there will be a few setup steps to do first, then go back to your Sheet and click the link again.
   * Ensure you're signed in to the same Google Account as your Spreadsheet.
4. Use the **Spreadsheet ID** field to input the value from your **Info** tab on your sidebar.
5. Select the **Connector Type** then click **Next**
   * This is the Module that you want to connect to. 
   * We suggest configuring the **People** - **People Data** connector first and then subsequent modules.
6. For Check-ins & People modules you will be prompted to select the **Data Type**
   * **Check-ins**
     * **Headcounts** - This is basic headcount information found in the headcount tab on Check-ins.
     * **Checkin Data** - This is each unique check-in through Check-ins.
   * **People**
     * **List Data** - If you're syncing specific lists
     * **People Data** - This is the base data for People. 
7. Once you've configured the above click **Connect**
8. Here you should rename the connector by clicking **Metrics for Ministry** in the top left of the screen.
9. Read through the **Dimensions** you have available to you and the descriptions of what they do. If you want to configure additional dimensions you can use the **Add Field** and set these up.
   * [Read our Google Docs for more info!](google-data-studio.md#creating-additional-metrics)
10. You will need to repeat steps 2 - 7 for each connector you wish to configure.
    * If you're using sub connectors in Check-ins and People you will need to set up an additional connector.

{% hint style="info" %}
To get you off on a faster start we have created a template for you that you can simply copy the data over, attach your connectors, and you're good to go! Check out the GDS config below.
{% endhint %}

For more information on setting up custom dimensions and configuring Google Data Studio check out our GDS page.

{% page-ref page="google-data-studio.md" %}

## Step 4 - Module Specific Setup

{% page-ref page="module-specific-info/people.md" %}

{% page-ref page="module-specific-info/giving.md" %}

{% page-ref page="module-specific-info/check-ins.md" %}





