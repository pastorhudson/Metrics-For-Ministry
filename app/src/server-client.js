function postToServer(payload) {

    let serverClientURL = 'https://script.google.com/macros/s/AKfycbz7kJA0rimZWc2nUWUUHyrn0-h0yS5FQE9dyEmccjkA9Mb-nuo7/exec'
    console.log(payload)

    // todo - need to implement an access token stored in the script properties that's read when sending.
    let response = UrlFetchApp.fetch(serverClientURL, {
        headers: {
        },
        'method' : 'POST',
        'payload': JSON.stringify(payload),
        'contentType' : 'text/plain'
    });
    return response
}


async function testPost(){
    const emailAddress = 'coltoneshaw@gmail.com'
    const userData = userData();
    let postData = {
        "people": {
            "people": {
                "api_status": "Sync Successful",
                "sheet_status": "sync successful",
                "type": "Full Sync",
                "total_length": 2282
            },
            "lists": {
                "api_status": "Sync Successful",
                "sheet_status": "sync successful",
                "type": "Full Sync",
                "total_length": 139
            },
            "listPeople": {
                "api_status": "Error: Exception: The coordinates of the range are outside the dimensions of the sheet.",
                "sheet_status": "sync successful",
                "type": "Full Sync",
                "total_length": 0
            }
        },
        "giving": {
            "donations": {
                "api_status": "Sync Successful",
                "sheet_status": "sync successful",
                "type": "Full Sync",
                "total_length": 9935
            }
        },
        "checkins": {
            "headcounts": {
                "api_status": "Sync Successful",
                "sheet_status": "sync successful",
                "type": "Full Sync",
                "total_length": 898
            },
            "checkins": {
                "api_status": "Sync Successful",
                "sheet_status": "sync successful",
                "type": "Full Sync",
                "total_length": 25917
            }
        },
        "groups": {
            "groups": {
                "api_status": "Sync Successful",
                "sheet_status": "sync successful",
                "type": "Full Sync",
                "total_length": 50
            }
        }
    }

    let data = {
        "type": "email",
        "userData": userData,
        "data": postData
    }
   
    let test = await postToServer(data)

    console.log(test.getResponseCode())
    console.log(test.getContentText())
}



