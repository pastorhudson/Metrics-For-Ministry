async function getGroups_tagGroups(onlyNames) {
    const apiCall = await pcoApiCall('https://api.planningcenteronline.com/groups/v2/tag_groups', false, false, '')

    let dataArray = []
    apiCall.forEach(tagGroup => {
        const { attributes: { name }, id } = tagGroup

        let tempTagGroup = {
            "Tag ID": id,
            "Tag Group Name": name
        }

        dataArray.push(tempTagGroup)
    })

    if (onlyNames) { return dataArray.map(name => name["Tag Group Name"]) }
    return dataArray
}


async function getGroups(onlyUpdated, tab) {
    const timezone = getUserProperty('time_zone')
    /**
     * @return {dataArray} - filtered array of the headcount data
     */

    // currently not supported for updated_at syncs.
    onlyUpdated = false;

    let data = []
    const id_attribute = "Group ID"


    try {

        const apiCall = await pcoApiCall("https://api.planningcenteronline.com/groups/v2/groups", onlyUpdated, true, "&include=group_type&where[archive_status]=include");


        if (apiCall.length == 0) {
            console.log('Groups --- Nothing to Sync')
        } else {
            const GROUPS = apiCall.data;

            const GROUP_TYPES = apiCall.included.filter((e) => { if (e.type == "GroupType" && apiCall.included.findIndex(t => (e.id === t.id)) == apiCall.included.indexOf(e)) { return e } })

            //console.log(GROUP_TYPES.length)
            const TAG_GROUPS = await getGroups_tagGroups();

            let groupTagURLs = [];

            GROUPS.forEach(group => groupTagURLs.push(`https://api.planningcenteronline.com/groups/v2/groups/${group.id}/tags`))


            const groupTagsAPICall = await groups_pcoApiCall(groupTagURLs)

            // if the tag groups don't match what we have stored, then we need to regenerate the groups.


            for (group of GROUPS) {

                const { attributes, relationships, id } = group
                const { group_type } = relationships
                const { name, memberships_count, location_type_preference, created_at, archived_at, enrollment_open, enrollment_strategy } = attributes
                const groupType = GROUP_TYPES.find((e) => e.id == group_type.data.id);
                const { id: typeID, attributes: { name: typeName } } = groupType

                let tempGroup = {
                    "Group ID": id,
                    "Group Name": name,
                    "Membership Count": memberships_count,
                    "Type ID": typeID,
                    "Type Name": typeName,
                    "Group Location Type": location_type_preference,
                    "Created At": Utilities.formatDate(new Date(created_at), timezone, "yyyy-MM-dd"),
                    "Archived At": (archived_at != null) ? Utilities.formatDate(new Date(archived_at), timezone, "yyyy-MM-dd") : null,
                    "Enrollment Open": enrollment_open,
                    "Enrollment Strategy": enrollment_strategy

                }

                let tagObject = {}

                // need to refactor this code to grab an Array of URLs then push them out and remove this await.
                // let groupTags = await pcoApiCall(`https://api.planningcenteronline.com/groups/v2/groups/${group.id}/tags`, false, false, '')

                let groupTags = groupTagsAPICall.find(e => e.meta.parent.id == group.id).data

                for (tagGroup of TAG_GROUPS) {

                    let tags = groupTags.filter((tag) => tag.relationships.tag_group.data.id == tagGroup["Tag ID"]);

                    let tagsArray = [];
                    for (tag of tags) { tagsArray.push(tag.attributes.name) }

                    let tagGroupName = tagGroup["Tag Group Name"];
                    tagObject[tagGroupName] = tagsArray.join(', ');

                }

                Object.assign(tempGroup, tagObject)
                data.push(tempGroup)
            }


        }



    } catch (error) {
        return statusReturn(data, `Error: ${error}`, onlyUpdated, tab, id_attribute)
    }

    return statusReturn(data, `Sync Successful`, onlyUpdated, tab, id_attribute)




}