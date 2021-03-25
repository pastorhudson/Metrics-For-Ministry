async function getGroups_tagGroups(onlyNames){
    const apiCall = await pcoApiCall('https://api.planningcenteronline.com/groups/v2/tag_groups', false, false, '')

    let dataArray = []
    let tagGroupNames = [];
    const tagger = apiCall;

    for (tagGroup of tagger){
        let attributes = tagGroup.attributes;

        let tempTagGroup = {
            "Tag ID": tagGroup.id,
            "Tag Group Name" : attributes.name
        }

        tagGroupNames.push(attributes.name)

        dataArray.push(tempTagGroup)

    }
    
    if(onlyNames){return tagGroupNames}
    return dataArray
}


async function getGroups(onlyUpdated, tab) {
    const timezone = getUserProperty('time_zone')
    /**
     * @return {dataArray} - filtered array of the headcount data
     */

    // currently not supported for updated_at syncs.
    onlyUpdated = false;

    const apiCall = await pcoApiCall("https://api.planningcenteronline.com/groups/v2/groups", onlyUpdated, true, "&include=group_type&where[archive_status]=include");
    let dataArray = []
    const GROUPS = apiCall.data;
    const GROUP_TYPES = apiCall.included.filter((e) => { if (e.type == "GroupType" && apiCall.included.findIndex(t => (e.id === t.id)) == apiCall.included.indexOf(e)) { return e } })
    const TAG_GROUPS = await getGroups_tagGroups();

    let groupTagURLs = [];

    GROUPS.forEach(group => groupTagURLs.push(`https://api.planningcenteronline.com/groups/v2/groups/${group.id}/tags`))


    const groupTagsAPICall = await groups_pcoApiCall(groupTagURLs) 
    
    // if the tag groups don't match what we have stored, then we need to regenerate the groups.


    for (group of GROUPS) {

        let attributes = group.attributes;
        let relationships = group.relationships;

        let groupType = GROUP_TYPES.find((e) => e.id == relationships.group_type.data.id);

        let tempGroup = {
            "Group ID": group.id,
            "Group Name": attributes.name,
            "Membership Count": attributes.memberships_count,
            "Type ID": groupType.id,
            "Type Name": groupType.attributes.name,
            "Group Location Type": attributes.location_type_preference,
            "Created At": Utilities.formatDate(new Date(attributes.created_at), timezone, "yyyy-MM-dd"),
            "Archived At": (attributes.archived_at != null) ? Utilities.formatDate(new Date(attributes.archived_at), timezone, "yyyy-MM-dd"): null,
            "Enrollment Open": attributes.enrollment_open,
            "Enrollment Strategy" : attributes.enrollment_strategy

        }

        let tagObject = {}

        // need to refactor this code to grab an Array of URLs then push them out and remove this await.
        // let groupTags = await pcoApiCall(`https://api.planningcenteronline.com/groups/v2/groups/${group.id}/tags`, false, false, '')

        let groupTags = groupTagsAPICall.find(e => e.meta.parent.id == group.id).data

        for (tagGroup of TAG_GROUPS){

            let tags = groupTags.filter((tag) => tag.relationships.tag_group.data.id == tagGroup["Tag ID"]);

            let tagsArray = [];
            for (tag of tags){ tagsArray.push(tag.attributes.name)}

            let tagGroupName = tagGroup["Tag Group Name"];
            tagObject[tagGroupName] = tagsArray.join(', ');

        }

        Object.assign(tempGroup, tagObject)
        dataArray.push(tempGroup)
    }



    if (onlyUpdated) {
        return compareWithSpreadsheet(dataArray, "Group ID", tab)
    } else {
        return dataArray
    }

}