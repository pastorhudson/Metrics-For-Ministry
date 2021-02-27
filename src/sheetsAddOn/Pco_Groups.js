async function getGroups(onlyUpdated, tab) {
    const timezone = getUserProperty('time_zone')
    /**
     * @return {dataArray} - filtered array of the headcount data
     */

    // currently not supported for updated_at syncs.
    onlyUpdated = false;

    const apiCall = await pcoApiCall("https://api.planningcenteronline.com/groups/v2/groups", onlyUpdated, true, "&include=group_type,location");
    let dataArray = []
    const GROUPS = apiCall.data;
    const GROUP_TYPES = apiCall.included.filter((e) => { if (e.type == "GroupType" && apiCall.included.findIndex(t => (e.id === t.id)) == apiCall.included.indexOf(e)) { return e } })



    for (group of GROUPS) {

        let attributes = group.attributes;
        let relationships = group.relationships;

        let groupType = GROUP_TYPES.find((e) => e.id == relationships.group_type.data.id);

        let tempGroup = {
            "id": group.id,
            "Group Name": attributes.name,
            "Membership Count": attributes.memberships_count,
            "Type Name": groupType.attributes.name,
            "Type Description": groupType.attributes.description,
        }

        // add Location. This will be a for
        // one to one relationship. If it has a location, it's only one.
    }


    if (onlyUpdated) {
        return compareWithSpreadsheet(dataArray, "Checkin ID", tab)
    } else {
        return dataArray
    }

}