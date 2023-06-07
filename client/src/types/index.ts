export type QUERY_TYPE<T extends { [x: string]: any } = {}> = { [x in keyof T]?: T[x] } & { page?: number, rowsperpage?: number }

export type CUSTOMER_MODEL = {
    id: number
    _id?: string
    name: string
    phone_number: string
    barcodes: string[]
    percent: number
    balance: number
    groups: CUSTOMER_GROUP_MODEL[]
}

export type EDIT_ACTION_TYPE_MODEL = {
    id?: number
    name: string
    keyCode: number
    message: string
    actionColor: string
    actionAlertAmount: number
    isGlobal: boolean
    hasMessage: boolean
    isMenuOption: boolean
    tertip: number
    action_type: 'NONE' | 'REMOVE' | 'ADD' | 'REMOVE_PERCENT' | 'ADD_PERCENT'
    deletedAt?: null | string
}

export type EDIT_ACTION_TYPE_TRANSACTION_TYPE = {
    id?: number
    attachToAllCustomers: boolean
    hasParentInvoice?: 'has' | 'no' | 'any'
    transactionType: string | null
    paymentTypes: string[]
    mainCustomer?: number | null
    secondCustomer?: string | null
    customer?: CUSTOMER_MODEL | null
    amountType?: 'sum_received' | 'total_sum' | 'difference'
    attachedGroups: CUSTOMER_GROUP_MODEL[]
}

export type ACTION_TYPE_TRANSACTION_TYPE = EDIT_ACTION_TYPE_TRANSACTION_TYPE & { id: number }

export type ACTION_TYPE_MODEL = { id: number, } & EDIT_ACTION_TYPE_MODEL

export type EDIT_CUSTOMER_GROUP_MODEL = {
    id?: number
    name: string
}
export type CUSTOMER_GROUP_MODEL = { id: number, customerCount: number } & EDIT_CUSTOMER_GROUP_MODEL

export type ACTION_MODEL = {
    id: number
    customer: CUSTOMER_MODEL
    actionType: ACTION_TYPE_MODEL
    createdAt: string
    amount: number
    res: number
    percent: number
    balance: number
    aish_balance: number
    owner: string
    note: string
    parentAction: ACTION_MODEL | null
    messageId: number | null
    hasMessage: boolean
    deletedAt?: string
    message?: { message: string } | null
    transaction?: TRANSACTION_TYPE
}

type TRANSACTION_TYPE = {
    _id: string,
    _isactive: string,
    book_1: string,
    book_2: string,
    code: string,
    customer_1: string,
    customer_2: string,
    discount_direction: string,
    lastediton: string,
    markedasinvalid_note: string,
    note: string,
    payment_type: string,
    transaction_date: string,
    transaction_type: string,
    warehouse_1: string,
    warehouse_2: string,
    conversion_rate: number,
    discount_percent: number,
    sum_received: number,
    total_sum_before_discount: number,
    total_sum: number,
}

export type EDIT_TRIGGER_TYPE = {
    id?: number
    onAction: 'onDelete' | 'onInsert'
    minAmount: number
    maxAmount: number
    attachToAllCustomers: boolean
    attachedGroups?: CUSTOMER_GROUP_MODEL[]
    actions: TRIGGER_ACTION_TYPE[]
}

export type TRIGGER_ACTION_TYPE = {
    type: 'CREATE_ACTION' | 'ADD_TO_GROUP' | 'REMOVE_FROM_GROUP'
    actionAmountCalculation: string
    customerGroupId?: number | null
    actionTypeId?: number | null
    customerGroup?: CUSTOMER_GROUP_MODEL | null
    actionType?: ACTION_TYPE_MODEL | null
}

export type TRIGGER_TYPE = EDIT_TRIGGER_TYPE & { id: number }