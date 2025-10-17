export const transactionTypes: {
    transactionType: string
    paymentTypes: string[]
}[] = [
        {
            transactionType: "Book to book transfer",
            paymentTypes: []
        },
        {
            transactionType: "Outbound/Sale",
            paymentTypes: [
                "On credit",
                "In cash",
                "Partial payment"
            ]
        },
        {
            transactionType: "Inbound/Payment",
            paymentTypes: []
        },
        {
            transactionType: "Inbound/Purchase",
            paymentTypes: [
                "On credit"
            ]
        },
        {
            transactionType: "Customer to customer transfer",
            paymentTypes: []
        },
        {
            transactionType: "Outbound/Payment",
            paymentTypes: []
        },
        {
            transactionType: "Inbound/Other",
            paymentTypes: [
                "On credit"
            ]
        },
        {
            transactionType: "Service provided (sold)",
            paymentTypes: []
        },
        {
            transactionType: "Outbound/Expense",
            paymentTypes: []
        },
        {
            transactionType: "Outbound/Loss",
            paymentTypes: [
                "On credit"
            ]
        },
        {
            transactionType: "Outbound/Return",
            paymentTypes: [
                "On credit"
            ]
        },
        {
            transactionType: "Outbound/Other",
            paymentTypes: [
                "On credit"
            ]
        },
        {
            transactionType: "Service received (bought)",
            paymentTypes: []
        },
        {
            transactionType: "Outbound/Loan",
            paymentTypes: []
        },
        {
            transactionType: 'Outbound product cheapened',
            paymentTypes: []
        }
    ]