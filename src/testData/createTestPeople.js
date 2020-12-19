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
    let url = "https://api.planningcenteronline.com/people/v2/people";
    let response = UrlFetchApp.fetch(url, options);
    console.log(response);

    let responseData = {};
    responseData["Code"] = response.getResponseCode();
    responseData["Data"] = response;
    return responseData;
  }

}


// function authorizeURL(url) {
//   const makeService = getOAuthService();
//   const personData = UrlFetchApp.fetch(url, {
//     headers: {
//       Authorization: 'Bearer ' + makeService.getAccessToken()
//     }
//   }
//   );

//   const content = personData.getContentText();
//   const json = JSON.parse(content);
//   return json;
// }

