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

    console.log(dataArray[0])

    return dataArray;
}

function test3(){
    const tabs = tabNamesReturn();
    getCheckInsData(true, tabs.check_ins.headcountsTab)

   // setUserProperty('syncStatus', "ready");
}

async function getCheckInsData(onlyUpdated, tab) {
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
        if(onlyUpdated){
            return compareWithSpreadsheet(dataArray, "EventTime ID", tab)
        } else {
            return dataArray
        }

}
