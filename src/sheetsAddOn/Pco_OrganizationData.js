async function getOrgData(){

    let orgApiCall = await pcoApiOrgCall("https://api.planningcenteronline.com/people/v2");
    console.log(orgApiCall)


    setUserProperty('date_format',orgApiCall.attributes.date_format);
    setUserProperty('org_name',orgApiCall.attributes.name);
    setUserProperty('time_zone',orgApiCall.attributes.time_zone);




}