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


    // this can be improved to use the includes instead.
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

        let { relationships } = checkInTime;

        let { check_in, event_time, location } = relationships

        let subElement = {}

        const checkIn = (check_in) => {

            // checkins to check_in_times is a one to one relationship
            let checkin = CHECK_INS.find((e) => check_in.data.id == e.id)

            let { relationships } = checkin

            let { event } = relationships
            //let attributes = checkin.attributes;
            let personID = (relationships.person.data != null) ? relationships.person.data.id : undefined;
            let checkinElement = {
                "Checkin ID": checkin.id,
                "Person ID": personID,
            }

            Object.assign(subElement, checkinElement)

            // checkins to events is a one to one relationship. Not accounting for multiple returned.
            //  using the checkin data and NOT check_in_times because event data is not stored in the check_in_times.

            const eventData = (event) => {
                let subEvent;
                if (event.data != null) {
                    let eventData = EVENTS.find(e => e.id == event.data.id)
                    //console.log(eventData, EVENTS)
                    let { attributes, id } = eventData
                    let { name, archived_at, frequency } = attributes

                    subEvent = {
                        "Event ID": id,
                        "Event Name": name,
                        "Archived At": archived_at,
                        "Event Frequency": frequency
                    }
                } else {
                    subEvent = {
                        "Event Name": null,
                        "Archived At": null,
                        "Event Frequency": null
                    }
                }

                return subEvent
            }

            Object.assign(subElement, eventData(event))

        }

        const eventTime = (event_time) => {
            let { data } = event_time
            if (data != null) {

                let eventTimeData = EVENT_TIMES.find(e => e.id == data.id);

                let { attributes: { name, starts_at }, id } = eventTimeData;

                let eventTimeName = (name == null || name == "") ? Utilities.formatDate(new Date(starts_at), timezone, "HH:mm a") : name;
                let starts = Utilities.formatDate(new Date(starts_at), "UTC", "yyyy-MM-dd'T'HH:mm:ss'Z'");

                // console.log(eventTimeData)

                subEventTime = {
                    "Event Time ID": id,
                    "Event Time Name": eventTimeName,
                    "Starts": starts,
                }

                Object.assign(subElement, subEventTime)
            }

        }

        const locationData = (location) => {
            // one to one relationship from event_Time to location.

            let {data} = location

            if (data != null) {
                let locationData = LOCATIONS.find((location) => location.id == data.id);

                let {id, attributes: {name}} = locationData

                subLocation = {
                    "Location ID": id,
                    "Location Name": name,
                }

            } else {
                subLocation = {
                    "Location ID": null,
                    "Location Name": null,
                }
            }
            Object.assign(subElement, subLocation);


        }

        checkIn(check_in)
        eventTime(event_time)
        locationData(location)
        dataArray.push(subElement)
    }


    if (onlyUpdated) {
        return compareWithSpreadsheet(dataArray, "Checkin ID", tab)
    } else {
        return dataArray
    }

}
