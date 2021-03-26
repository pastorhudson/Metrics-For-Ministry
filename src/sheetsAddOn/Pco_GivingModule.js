async function getGivingFunds() {
    /**
    * @return {fundArray} - filtered array of Fund Data.
    */

    const fundApiCall = await pcoApiCall("https://api.planningcenteronline.com/giving/v2/funds", false, false, '');
    let fundArray = [];

    fundApiCall.forEach(fund => {
        const { id, attributes: { name, created_at, ledger_code, color } } = fund
        fundArray.push({ id, name, created_at, ledger_code, color });
    });

    return fundArray;
}

async function getGivingLabels() {
    /**
    * @return {getGivingLabels} - filtered array of label Data.
    */
    let labelArray = [];

    const labelApiCall = await pcoApiCall("https://api.planningcenteronline.com/giving/v2/labels", false, false, '');

    return labelApiCall.map(label => {
        let { attributes: { slug }, id } = label
        return { id, slug }
    });

}




async function getGivingPaymentSources() {
    /**
    * @return {paymentSourceArray} - filtered array of payment source Data.
    */

    const paymentSourceApiCall = await pcoApiCall("https://api.planningcenteronline.com/giving/v2/payment_sources", false, false, '');
    let paymentSourceArray = [];
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

    const FUNDS = await getGivingFunds();
    const PAYMENT_SOURCES = await getGivingPaymentSources();

    const donationData = await pcoApiCall("https://api.planningcenteronline.com/giving/v2/donations", onlyUpdated, true, "&include=designations,labels");

    const includedArray = Array.from(new Set(donationData.included.map(a => a.id)))
        .map(id => donationData.included.find(a => a.id === id))

    const API_LABELS = includedArray.filter((e) => e.type == "Label")
        .map(label => {
            let { attributes: { slug }, id } = label
            return { id, slug }
        })

    const DESIGNATIONS = includedArray.filter((e) => e.type == "Designation")
        .map(designation => {
            let { attributes: { amount_cents }, relationships: { fund }, id } = designation
            return { id, amount_cents, fund_id: fund.data.id }
        })

    let donationArray = [];

    donationData.data.forEach(donation => {
        const { attributes, relationships, id: donationID } = donation

        const { amount_cents, fee_cents, amount_currency, received_at, refunded, payment_method_sub, payment_method, payment_status, payment_brand } = attributes
        let fee = fee_cents / 100;
        let amount = amount_cents / 100
        //let currency = amount_currency;

        const { designations, person, payment_source, labels } = relationships

        designations.data.forEach(designation => {

            // this might need to be looked at
            let designationData = DESIGNATIONS.find(e => e.id === designation.id)
            let subFee = +(((fee / amount) * designationData.amount_cents) / 100).toFixed(2);
            let subAmount = designationData.amount_cents / 100


            const subFund = FUNDS.find(source => source.id === designationData.fund_id);

            const { name: fundName, ledger_code } = subFund

            let donationElement = {
                'Donation ID': donationID,
                'Person ID': (person.data != null) ? relationships.person.data.id : 'anon',
                'Recieved At': received_at,
                'Date': Utilities.formatDate(new Date(received_at), timezone, "yyyy-MM-dd"),

                // true / false if refunded.
                'Refunded': refunded,

                // cash / card / check
                'Payment Method': payment_method,

                // credit / debit
                'Payment Method Type': payment_method_sub,
                'Payment Channel': (relationships.batch.data == null) ? "stripe" : "batch",
                'Status': payment_status,
                'Card Brand': payment_brand,

                // Required attribute
                'Source': PAYMENT_SOURCES.find(source => source.id === payment_source.data.id).name,
                'Fund Name': fundName,
                'Ledger Code': ledger_code,
                'Amount': subAmount,
                'Fee': subFee,
                'Net Amount': (subAmount + subFee)
            }

            const addLabels = (labels) => {
                let {data} = labels
                let labelArray = [];
                data.forEach(label => {
                    labelArray.push(API_LABELS.find(o => o.id === label.id).slug)
                })
                Object.assign(donationElement, {
                    'Labels': (labelArray.length > 0) ? labelArray.join(', ') : undefined
                })
            }

            addLabels(labels);
            donationArray.push(donationElement);

        })

    })

    console.log(`The Giving data is ${donationArray.length} long`)

    // parsing the data from the sheet if we are requesting only updated info.
    if (onlyUpdated) {
        return compareWithSpreadsheet(donationArray, "Donation ID", tab)
    } else {
        return donationArray
    }


}
