// cannot do an updatedAt call.
async function getHeadcounts() {

    /**
     * @return {dataArray} - filtered array of the headcount data
     */

    const apiCall = await pcoApiCall("https://api.planningcenteronline.com/check-ins/v2/headcounts", false, true, "&include=attendance_type");
    let dataArray = [];

    const { data, included } = apiCall

    data.forEach(headcount => {
        const { attributes: { total }, relationships: { attendance_type, event_time }, id } = headcount

        let elementHeadcount = {
            id,
            attendanceTypeID: attendance_type.data.id,
            eventTimeID: event_time.data.id,
            attendanceTypeName: included.find(type => type.id === attendance_type.data.id).attributes.name,
            totalCount: total
        }
        dataArray.push(elementHeadcount);

    })

    console.log(dataArray)
    return dataArray;
}

async function getEvents() {

    /**
     * @return {dataArray} - filtered array of the event data
     */

    const apiCall = await pcoApiCall("https://api.planningcenteronline.com/check-ins/v2/events", false, false, '');
    let dataArray = [];

    apiCall.forEach(event => {
        const { attributes: { archived_at, frequency, name }, id } = event
        dataArray.push({ id, archived_at, frequency, name });
    });

    return dataArray;
}


async function getHeadcountsJoinedData(onlyUpdated, tab) {
    const timezone = getUserProperty('time_zone')

    /**
     * @return {dataArray} - filtered array of the event data
     */

    // headcounts now supports the updatedAt parameter.
    //onlyUpdated = false;

    const apiCall = await pcoApiCall("https://api.planningcenteronline.com/check-ins/v2/event_times", onlyUpdated, true, "&include=event,headcounts");

    const EVENTS = apiCall.included.filter((e) => { if (e.type == "Event") { return e } });
    const HEADCOUNT_API = apiCall.included.filter((e) => { if (e.type == "Headcount") { return e } });

    let dataArray = [];

    apiCall.data.forEach(eventTime => {
        const { attributes, relationships, id: EventTimeID } = eventTime
        const { guest_count, regular_count, volunteer_count, name, starts_at } = attributes
        const { headcounts, event } = relationships


        let eventData = EVENTS.find(e => e.id === event.data.id);

        let counts = { guest_count, regular_count, volunteer_count }

        const headcount = (headcounts, headcountObject = {}) => {
            let { data } = headcounts
            //let headcountObject = {}
            if (data.length > 0) {
                for (const headcount of data) {
                    let head = HEADCOUNT_API.find(head => head.id === headcount.id)
                    let { attendanceTypeName, totalCount } = head
                    headcountObject[attendanceTypeName] = totalCount
                }
            }
            Object.assign(counts, headcountObject)
        }

        const dataPushFunction = () => {
            // takes the count object and creates an object for each then pushes this to the array.
            // no input required here.
            const { id: EventID, attributes: { name: EventName, archived_at, frequency } } = eventData

            for (const count in counts) {
                let amount = counts[count]
                if (amount > 0) {
                    let elementEventTime = {
                        'EventTime ID': EventTimeID,
                        'Event ID': EventID,
                        'Event Name': EventName,
                        'Archived At': archived_at,
                        'Event Frequency': frequency,
                        'Event Time Name': (name == null || name == "") ? Utilities.formatDate(new Date(starts_at), timezone, "HH:mm a") : name,
                        'Starts': Utilities.formatDate(new Date(starts_at), "UTC", "yyyy-MM-dd'T'HH:mm:ss'Z'"),
                        'Count Type': count,
                        'Count': amount
                    }

                    dataArray.push(elementEventTime);

                }

            }
        }

        headcount(headcounts)
        dataPushFunction()
    })

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

            let { data } = location

            if (data != null) {
                let locationData = LOCATIONS.find((location) => location.id == data.id);

                let { id, attributes: { name } } = locationData

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
