async function getGivingFunds() {
    /**
    * @return {fundArray} - filtered array of Fund Data.
    */

    const fundApiCall = await pcoApiCall("https://api.planningcenteronline.com/giving/v2/funds", false, false, '');
    let fundArray = [];

    for (const fund of fundApiCall) {
        let attributes = fund.attributes;
        let fundElement = {}
        fundElement.id = fund.id;
        fundElement.name = attributes.name;
        fundElement.ledgerCode = attributes.ledger_code;
        fundElement.createdAt = attributes.created_at;
        fundElement.color = attributes.color;
        fundArray.push(fundElement);
    }
    console.log(fundArray)
    return fundArray;
}

async function getGivingLabels() {
    /**
    * @return {getGivingLabels} - filtered array of label Data.
    */

    const labelApiCall = await pcoApiCall("https://api.planningcenteronline.com/giving/v2/labels", false, false, '');
    let labelArray = [];

    //console.log(labelApiCall)

    for (const label of labelApiCall) {
        let attributes = label.attributes;
        let labelElement = {}
        labelElement.id = label.id;
        labelElement.name = attributes.slug;
        labelArray.push(labelElement);
    }
    console.log(labelArray)

    return labelArray;
}

async function getGivingPaymentSources() {
    /**
    * @return {paymentSourceArray} - filtered array of payment source Data.
    */

    const paymentSourceApiCall = await pcoApiCall("https://api.planningcenteronline.com/giving/v2/payment_sources", false, false, '');
    let paymentSourceArray = [];

    //console.log(labelApiCall)

    for (const paymentSource of paymentSourceApiCall) {
        let attributes = paymentSource.attributes;
        let sourceElement = {}
        sourceElement.id = paymentSource.id;
        sourceElement.name = attributes.name;
        paymentSourceArray.push(sourceElement);
    }
    console.log(paymentSourceArray)

    return paymentSourceArray;
}



async function getGivingDonations(onlyUpdated, tab) {
    /**
     * @return {donationArray} - 
     * @description - 
     */

    const timezone = getUserProperty('time_zone')


    const donationData = await pcoApiCall("https://api.planningcenteronline.com/giving/v2/donations", onlyUpdated,  true, "&include=designations");
    const funds = await getGivingFunds();
    const labels = await getGivingLabels();
    const paymentSources = await getGivingPaymentSources();

    let donationArray = [];

    let designationArray = donationData.included;



    for (const donation of donationData.data) {
        let attributes = donation.attributes;
        let relationships = donation.relationships;

        let fee = attributes.fee_cents / 100;
        let amount = attributes.amount_cents / 100
        let currency = attributes.amount_currency;
        let designations = relationships.designations.data;

        for (const designation of designations) {

            let donationElement = {}

            // this will not be unique if the donation is split.
            donationElement['Donation ID'] = donation.id;

            // this is our primary key to link the databases.
            donationElement['Person ID'] = (relationships.person.data != null) ? relationships.person.data.id : 'anon';

            // when the donation has been received & last updated. This will be for later so we don't sync the entire database again.

            // Removing update at to not configure people on which date metric to use.
            //donationElement.updatedAt = attributes.updated_at;
            donationElement['Recieved At'] = attributes.received_at;
            donationElement['Date'] = Utilities.formatDate(new Date(attributes.received_at), timezone, "yyyy-MM-dd");

            // true/false if it's been refunded or not.
            donationElement['Refunded'] = attributes.refunded;

            // basic payment information.
            donationElement['Payment Method'] = attributes.payment_method;

            // showing credit/debit
            donationElement['Payment Method Type'] = attributes.payment_method_sub;

            if(relationships.batch.data == null){
                donationElement['Payment Channel'] = "stripe"
            } else {
                donationElement['Payment Channel'] = "batch"
            }
            

            // this what we'd expect to update.
            donationElement['Status'] = attributes.payment_status;
            donationElement['Card Brand'] = attributes.payment_brand;
            
            //donationElement.paymentSourceId = relationships.payment_source.data.id;

            let paymentSource = paymentSources.find(source => source.id === relationships.payment_source.data.id);
            donationElement['Source'] = paymentSource.name;


            if (relationships.labels.data != null) {
                let labelArray = [];
                for (const labelItem of relationships.labels.data) {
                    let labelId = labelItem.id;
                    let label = labels.find(o => o.id === labelId);
                    labelArray.push(label.name)
                }

                donationElement['Labels'] = labelArray.join(', ');

            } else {
                donationElement['Labels'] = undefined;
            }

            let designationId = designation.id;
            let designationData = designationArray.find(data => data.id === designationId && data.type == "Designation");

            let fundId = designationData.relationships.fund.data.id;
            let subFund = funds.find(source => source.id === fundId);

            let subFee = +(((fee / amount) * designationData.attributes.amount_cents) / 100).toFixed(2);
            let subAmount = designationData.attributes.amount_cents / 100


            donationElement['Fund Name'] = subFund.name;
            donationElement['Ledger Code'] = subFund.ledgerCode;
            donationElement['Amount'] = subAmount;
            donationElement['Fee'] = subFee;
            donationElement['Net Amount'] = (subAmount + subFee);

            donationArray.push(donationElement);

        }

    }

    console.log(donationArray[0])

        // parsing the data from the sheet if we are requesting only updated info.
        if(onlyUpdated){
            return compareWithSpreadsheet(donationArray, "Donation ID", tab)
        } else {
            return donationArray
        }

    //console.log(donationArray[100]);
    //console.log(donationArray)
    //return donationArray;

}


function test(){
    const tabs = tabNamesReturn();
    getGivingDonations(true, tabs.giving.donationsTab)

   // setUserProperty('syncStatus', "ready");
}