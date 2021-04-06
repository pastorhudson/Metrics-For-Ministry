async function getOrgData(){

    let orgApiCall = await pcoApiOrgCall("https://api.planningcenteronline.com/people/v2", false, false, '');

    const {attributes: {date_format, name, time_zone}} = orgApiCall
    // console.log(orgApiCall)


    setUserProperty('date_format',date_format);
    setUserProperty('org_name',name);
    setUserProperty('time_zone',time_zone);




}

async function pcoApiOrgCall(url) {
    var service = getOAuthService();
    if (service.hasAccess()) {
        let fetchedData = await promiseApiWithTimeout(url)
        return fetchedData.body.data;

    }

}
