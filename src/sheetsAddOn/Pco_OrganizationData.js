async function getOrgData(){

    let orgApiCall = await pcoApiOrgCall("https://api.planningcenteronline.com/people/v2", false, false, '');
    // console.log(orgApiCall)


    setUserProperty('date_format',orgApiCall.attributes.date_format);
    setUserProperty('org_name',orgApiCall.attributes.name);
    setUserProperty('time_zone',orgApiCall.attributes.time_zone);




}

async function pcoApiOrgCall(url) {
    var service = getOAuthService();
    if (service.hasAccess()) {
        let fetchedData = await promiseApiWithTimeout(url)
        return fetchedData.body.data;

    }

}
