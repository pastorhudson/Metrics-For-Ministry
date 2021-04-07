function doPost(e){
   let postContents = e.postData.contents;
    let data = JSON.parse(postContents);

    if(data.type === 'email'){
      emailSendHTML(subject,template,data)
    }

    console.log(data)
    return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(
            ContentService.MimeType.JSON);
}




