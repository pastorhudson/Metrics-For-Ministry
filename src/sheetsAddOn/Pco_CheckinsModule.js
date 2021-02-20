// cannot do an updatedAt call.
async function getHeadcounts() {

    /**
     * @return {dataArray} - filtered array of the headcount data
     */

    const apiCall = await pcoApiCall("https://api.planningcenteronline.com/check-ins/v2/headcounts", false, true, "&include=attendance_type");
    let dataArray = [];
    let data = apiCall.data;
    let included = apiCall.included;

    for (const headcount of data) {
        let attributes = headcount.attributes;
        let relationships = headcount.relationships;

        let attendanceTypeData = included.find(type => type.id === relationships.attendance_type.data.id);

        let elementHeadcount = {}
        elementHeadcount.id = headcount.id; // foreign key
        elementHeadcount.attendanceTypeID = relationships.attendance_type.data.id; //
        elementHeadcount.eventTimeID = relationships.event_time.data.id; // primary key
        elementHeadcount.attendanceTypeName = attendanceTypeData.attributes.name;
        elementHeadcount.totalCount = attributes.total;
        dataArray.push(elementHeadcount);
    }

    //console.log(dataArray[0])

    return dataArray;
}

async function getEvents() {

    /**
     * @return {dataArray} - filtered array of the event data
     */

    const apiCall = await pcoApiCall("https://api.planningcenteronline.com/check-ins/v2/events", false, false, '');
    let dataArray = [];


    for (const event of apiCall) {
        let attributes = event.attributes;
        let relationships = event.relationships;

        let elementEvent = {}
        elementEvent.id = event.id; // primary key
        elementEvent.archived_at = attributes.archived_at;
        elementEvent.frequency = attributes.frequency;
        elementEvent.name = attributes.name;


        dataArray.push(elementEvent);
    }


    return dataArray;
}


async function getHeadcountsJoinedData(onlyUpdated, tab) {
    const timezone = getUserProperty('time_zone')

    /**
     * @return {dataArray} - filtered array of the event data
     */

    onlyUpdated = false;

    const apiCall = await pcoApiCall("https://api.planningcenteronline.com/check-ins/v2/event_times", onlyUpdated, true, "&include=event,headcounts");
    const headcountsData = await getHeadcounts();
    const eventsData = await getEvents();

    let dataArray = [];

    for (const eventTime of apiCall.data) {
        let attributes = eventTime.attributes;
        let relationships = eventTime.relationships;
        let headcounts = relationships.headcounts.data;
        let eventID = relationships.event.data.id;
        let event = eventsData.find(event => event.id === eventID);

        let counts = {
            "guest_count": attributes.guest_count,
            "regular_count": attributes.regular_count,
            "volunteer_count": attributes.volunteer_count
        }

        if (headcounts != null) {
            for (const element of headcounts) {

                let headcountId = element.id // foreign key
                //elementEventTime.headcountID = headcountId;
                let head = headcountsData.find(elm => elm.id === headcountId);
                counts[head.attendanceTypeName] = head.totalCount;
            }
        }

        for (const count in counts) {
            let amount = counts[count]
            if (amount > 0) {
                let elementEventTime = {}
                elementEventTime['EventTime ID'] = eventTime.id; // primary key
                elementEventTime['Event ID'] = eventID;
                elementEventTime['Event Name'] = event.name;
                elementEventTime['Archived At'] = event.archived_at;
                elementEventTime['Event Frequency'] = event.frequency;
                elementEventTime['Event Time Name'] = (attributes.name == null || attributes.name == "") ? Utilities.formatDate(new Date(attributes.starts_at), timezone, "HH:mm a") : attributes.name;
                //elementEventTime.date = Utilities.formatDate(new Date(attributes.starts_at), timezone, "yyyy-MM-dd");
                // elementEventTime.time = Utilities.formatDate(new Date(attributes.starts_at), "EST", "HH:mm a");
                elementEventTime['Starts'] = Utilities.formatDate(new Date(attributes.starts_at), "UTC", "yyyy-MM-dd'T'HH:mm:ss'Z'");
                elementEventTime['Count Type'] = count;
                elementEventTime['Count'] = counts[count]
                dataArray.push(elementEventTime);

            }

        }
    }


    // parsing the data from the sheet if we are requesting only updated info.
    if (onlyUpdated) {
        return compareWithSpreadsheet(dataArray, "EventTime ID", tab)
    } else {
        return dataArray
    }

}


async function getCheckIns(onlyUpdated, tab) {
    const timezone = getUserProperty('time_zone')
    /**
     * @return {dataArray} - filtered array of the headcount data
     */

    const apiCall = await pcoApiCall("https://api.planningcenteronline.com/check-ins/v2/check_ins", onlyUpdated, true, "&include=event,locations,person,event_times,check_in_times");
    let dataArray = []
    const CHECK_INS = apiCall.data;
    const LOCATIONS = apiCall.included.filter((e) => { if (e.type == "Location") { return e } });
    const EVENT_TIMES = apiCall.included.filter((e) => { if (e.type == "EventTime") { return e } });
    const EVENTS = apiCall.included.filter((e) => { if (e.type == "Event") { return e } });
    const CHECK_IN_TIMES = apiCall.included.filter((e) => { if (e.type == "CheckInTime") { return e } });


    for (checkInTime of CHECK_IN_TIMES) {

        // checkins to check_in_times is a one to one relationship
        let checkin = CHECK_INS.find((e) => checkInTime.relationships.check_in.data.id == e.id)

        let relationships = checkin.relationships;
        //let attributes = checkin.attributes;

        let personID = (relationships.person.data != null) ? relationships.person.data.id : undefined;


        let subElement = {
            "Checkin ID": checkin.id,
            "Person ID": personID,
        }


        // checkins to events is a one to one relationship. Not accounting for multiple returned.
        //  using the checkin data and NOT check_in_times because event data is not stored in the check_in_times.
        if (relationships.event.data != null) {
            let eventData = EVENTS.find((event) => event.id == relationships.event.data.id);

            // console.log(eventData)

            subEvent = {
                "Event ID": eventData.id,
                "Event Name": eventData.attributes.name,
                "Archived At": eventData.attributes.archived_at,
                "Event Frequency": eventData.attributes.frequency
            }

            Object.assign(subElement, subEvent)
        } else {
            subEvent = {
                "Event Name": null,
                "Archived At": null,
                "Event Frequency": null
            }

            Object.assign(subElement, subEvent)
        }

        // one to one relationship from event_Time to check_in_times.
        if (checkInTime.relationships.event_time.data != null) {

            let eventTimeData = EVENT_TIMES.find((event_time) => event_time.id == checkInTime.relationships.event_time.data.id);
            let eventTimeName = (eventTimeData.attributes.name == null || eventTimeData.attributes.name == "") ? Utilities.formatDate(new Date(eventTimeData.attributes.starts_at), timezone, "HH:mm a") : eventTimeData.attributes.name;
            let starts = Utilities.formatDate(new Date(eventTimeData.attributes.starts_at), "UTC", "yyyy-MM-dd'T'HH:mm:ss'Z'");

            // console.log(eventTimeData)

            subEventTime = {
                "Event Time ID": eventTimeData.id,
                "Event Time Name": eventTimeName,
                "Starts": starts,
            }

            Object.assign(subElement, subEventTime)
        }

        // one to one relationship from event_Time to location.
        if (checkInTime.relationships.location.data != null) {
            let locationData = LOCATIONS.find((location) => location.id == checkInTime.relationships.location.data.id);

            subLocation = {
                "Location ID": locationData.id,
                "Location Name": locationData.attributes.name,
            }

            Object.assign(subElement, subLocation);


            /**
             * DO NOT DELETE
             */

            // // current location parents are not included on the includes.
            // if (locationData.relationships.parent.data != null) {
            //     //let locationParent = LOCATIONS.find((parent) => parent.id == locationData.relationships.parent.data.id);

            //     // console.log(locationParent)
            //     subLocationParent = {
            //         "Location Parent ID": "parent ID",
            //         "Location Parent Name": "parent name",
            //     }

            //     Object.assign(subElement, subLocationParent);
            // } else {
            //     subLocationParent = {
            //         "Location Parent ID": null,
            //         "Location Parent Name": null,
            //     }

            //     Object.assign(subElement, subLocationParent);
            // }
        } else {
            subLocation = {
                "Location ID": null,
                "Location Name": null,
                // "Location Parent ID": null,
                // "Location Parent Name": null,
            }

            Object.assign(subElement, subLocation);
        }

        dataArray.push(subElement)
    }

    if (onlyUpdated) {
        return compareWithSpreadsheet(dataArray, "Checkin ID", tab)
    } else {
        return dataArray
    }

}
