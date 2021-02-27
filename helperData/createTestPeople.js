function getToken() {
  let token = getOAuthService().getAccessToken();
  console.log(token)
}

function randomNumber(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min); //The maximum is inclusive and the minimum is inclusive
}

function memberType() {
  const memberTypes = ["Member", "Regular Attender", "Visitor", "Participant", "In Progress"]
  let number = randomNumber(0, 4)
  return memberTypes[number];

}

function firstNameFunction(gender) {

  if (gender = "Male") {
    let number = randomNumber(0, guyNames.length);
    return guyNames[number];

  }

  if (gender = "Female") {
    let number = randomNumber(0, femaleNames.length)
    let number2 = randomNumber(0, guyNames.length);
    return femaleNames[number];

  }


}

function lastNameFunction() {

  let number = randomNumber(0, lastNames.length);
  return lastNames[number];
}

function gender() {
  const genderTypes = ["Male", "Female"]

  let number = randomNumber(0, 1)

  return genderTypes[number];

}

function campusNumber() {
  const campusTotal = ["53272", "53273", "53276", "53277"]
  let number = randomNumber(0, 3)
  return campusTotal[number];

}

function paymentMethod() {
  const methods = ["cash", "check", "ach", "card"]
  let number = randomNumber(0, 3)
  return methods[number];
}

function paymentSource() {
  const source = ["11848", "11856", "11857"]
  let number = randomNumber(0, 2)
  return source[number];
}

function paymentLabel() {
  const label = ["112940", "112970", "112971", "112972"]
  let number = randomNumber(0, 3)
  return label[number];
}

function paymentFund() {
  const fund = ["175596", "175646", "175645", "175644"]
  let number = randomNumber(0, 3)
  return fund[number];
}

function personArray() {
  const spreadsheet = getDefaultSpreadsheetId();
  let ss = spreadsheet.getSheetByName('people_personTab');
  let data = ss.getRange(2, 1, ss.getLastRow(), 1).getValues();

  return data;

}

function personRandom(people){

  let number = randomNumber(0, people.length)
  return people[number][0];
}

function gifts(){
  addGiftsToPCO();
  addGiftsToPCO();

}


function addGiftsToPCO() {

  let people = personArray();

  for (let i = 0; i < 2000 ; i++) {

    let giftYear = randomNumber(2010, 2020);
    let giftMonth = randomNumber(1, 12);
    let giftDate = randomNumber(1, 31);
    let giftPaymentMethod = paymentMethod();
    let personID = personRandom(people);
    let giftPaymentSource = paymentSource();
    let label = paymentLabel();
    let amount = randomNumber(500, 85000);
    let fundID = paymentFund();

    let jsonObject = `{
                        "data": {
                          "type": "Donation",
                          "attributes": {
                            "payment_method": "${giftPaymentMethod}",
                            "received_at": "${giftYear}-${giftMonth}-${giftDate}"
                          },
                          "relationships": {
                            "person": {
                              "data": { "type": "Person", "id": "${personID}" }
                            },
                            "payment_source": {
                              "data": { "type": "PaymentSource", "id": "${giftPaymentSource}" }
                            },
                            "labels": {
                              "data": [
                                { "type": "Label", "id": "${label}" }
                              ]
                            }
                          }
                        },
                        "included": [
                          {
                            "type": "Designation",
                            "attributes": { "amount_cents": ${amount} },
                            "relationships": {
                              "fund": {
                                "data": { "type": "Fund", "id": "${fundID}" }
                              }
                            }
                          }
                        ]
                      }`

    let updateCall = pcoUpdateCall(jsonObject, "post");

    console.log(i);
    console.log(updateCall.Code);
    console.log(updateCall.Data);

  }

}

function addPeopleToPCO() {
  for (let i = 0; i < 7000; i++) {

    let birthYear = randomNumber(1960, 2020);
    let birthMonth = randomNumber(1, 12);
    let birthDate = randomNumber(1, 28);
    let campus = campusNumber();
    let member = memberType();
    let genderType = gender();
    let firstName = firstNameFunction(gender);
    let lastName = lastNameFunction();
    let grade = randomNumber(1, 12);;

    let jsonObject = `{ 
                        "data": {
                            "type": "person", 
                            "attributes": {
                                    "first_name": "${firstName}",
                                    "last_name": "${lastName}",
                                    "birthdate": "${birthYear}-${birthMonth}-${birthDate}",
                                    "primary_campus_id" : "${campus}",
                                    "gender": "${genderType}",
                                    "membership": "${member}",
                                    "grade": "${grade}"
                            } 
                          }
                      }`
    let updateCall = pcoUpdateCall(jsonObject, "post");

    console.log(i);
    console.log(updateCall.Code);
    console.log(updateCall.Data);

  }


}

function pcoUpdateCall(data, type) {
  var service = getOAuthService();
  if (service.hasAccess()) {
    let options = {
      headers: {
        Authorization: 'Bearer ' + service.getAccessToken(),
      },
      'method': type,
      'contentType': 'application/json',
      'payload': data
    }
    let url = "https://api.planningcenteronline.com/giving/v2/batches/4/donations";
    let response = UrlFetchApp.fetch(url, options);
    console.log(response);

    let responseData = {};
    responseData["Code"] = response.getResponseCode();
    responseData["Data"] = response;
    return responseData;
  }

}


