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

            // removed description as this shouldn't be needed for analysis and it's quite long.
            //"Type Description": groupType.attributes.description,
        }

        
        //console.log(groupTags)

        let tagObject = {}

        // for (tag of groupTags){

        //     // need to loop through this for each group and find the value.
        //     let tag_attributes = tag.attributes;
        //     let tag_relationships = tag.relationships;
        //     //console.log(tag_relationships.tag_group.data.id)

        //     let tag_group = TAG_GROUPS.find((tg) => tg["Tag ID"] == tag_relationships.tag_group.data.id);

        //     let tagGroupName = tag_group["Tag Group Name"];
        //     tagObject[tagGroupName] = tag_attributes.name

        // }
        let groupTags = await pcoApiCall(`https://api.planningcenteronline.com/groups/v2/groups/${group.id}/tags`, false, false, '');
        for (tagGroup of TAG_GROUPS){

            // need to loop through this for each group and find the value.
            // let tag_attributes = tag.attributes;
            // let tag_relationships = tag.relationships;
            //console.log(tag_relationships.tag_group.data.id)

            let tags = groupTags.filter((tag) => tag.relationships.tag_group.data.id == tagGroup["Tag ID"]);

            let tagsArray = [];
            for (tag of tags){ tagsArray.push(tag.attributes.name)}

            let tagGroupName = tagGroup["Tag Group Name"];
            tagObject[tagGroupName] = tagsArray.join(', ');

        }

        Object.assign(tempGroup, tagObject)


        // let groupLocationInfo;

        // if(relationships.location.data != null){
        //     let single_group_api_call = await pcoApiCall(`https://api.planningcenteronline.com/groups/v2/groups/${group.id}/location`, false, false, '')

        //     console.log(single_group_api_call)

        //     groupLocationInfo = {
        //         "Group Location": 'Physical',
        //     }
        // } else if (attributes.virtual_location_url != null){
        //     console.log('looks like a virtual group, boss')

        //     groupLocationInfo = {
        //         "Group Location": 'Physical',
        //     }
            
        // } else {
        //     groupLocationInfo = {
        //         "Group Location": 'No Location',
        //     }
        // }

        // Object.assign(tempGroup, groupLocationInfo)

        dataArray.push(tempGroup)
    }



    if (onlyUpdated) {
        return compareWithSpreadsheet(dataArray, "Group ID", tab)
    } else {
        return dataArray
    }

}