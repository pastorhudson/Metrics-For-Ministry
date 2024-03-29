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

    paymentSourceApiCall.forEach(paymentSource => {
        const { id, attributes: { name } } = paymentSource
        paymentSourceArray.push({ id, name });
    })

    return paymentSourceArray;
}



async function getGivingDonations(onlyUpdated, tab) {
    /**
     * @return {donationArray} - 
     * @description - 
     */

    let data = [];
    const id_attribute = "Designation ID"

    try {
        const timezone = getUserProperty('time_zone')
        const donationData = await pcoApiCall("https://api.planningcenteronline.com/giving/v2/donations", onlyUpdated, true, "&include=designations,labels");

        if (donationData.length == 0) {
            console.log('Giving --- Nothing to Sync')
        } else {
            const FUNDS = await getGivingFunds();
            const PAYMENT_SOURCES = await getGivingPaymentSources();


            const API_LABELS = donationData.included.filter((e) => e.type == "Label")
                .map(label => {
                    let { attributes: { slug }, id } = label
                    return { id, slug }
                })

            const DESIGNATIONS = donationData.included.filter((e) => e.type == "Designation")
                .map(designation => {
                    let { attributes: { amount_cents }, relationships: { fund }, id } = designation
                    return { id, amount_cents, fund_id: fund.data.id }
                })

            donationData.data.forEach(donation => {
                const { attributes, relationships, id: donationID } = donation

                const { amount_cents, fee_cents, amount_currency, received_at, refunded, payment_method_sub, payment_method, payment_status, payment_brand } = attributes
                let fee = fee_cents / 100;
                let amount = amount_cents / 100
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
                        'Designation ID' : designation.id,
                        'Person ID': (person.data != null) ? relationships.person.data.id : 'anon',
                        'Received At': received_at,
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
                        let { data } = labels
                        let labelArray = [];
                        data.forEach(label => {
                            labelArray.push(API_LABELS.find(o => o.id === label.id).slug)
                        })
                        Object.assign(donationElement, {
                            'Labels': (labelArray.length > 0) ? labelArray.join(', ') : undefined
                        })
                    }

                    addLabels(labels);
                    data.push(donationElement);
                })

            })


        }

    } catch (error) {
        return statusReturn(data, `Error: ${error}`, onlyUpdated, tab, id_attribute)
    }

    return statusReturn(data, `Sync Successful`, onlyUpdated, tab, id_attribute)


}
