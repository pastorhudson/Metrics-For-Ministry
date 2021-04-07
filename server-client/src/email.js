function emailSendHTML(subject,template,data) {
    const html = HtmlService.createTemplateFromFile(`emailTemplates/${template}`);

    html.people = data.people;
    html.giving = data.giving;
    html.checkins = data.checkins;
    html.groups = data.groups;

    var message = html.evaluate().getContent();
    let recipient = data.email;
  
  GmailApp.sendEmail(recipient, subject, "", { from: "hello@giftswap.online", name: "Gift Swap Online", htmlBody: message});
}