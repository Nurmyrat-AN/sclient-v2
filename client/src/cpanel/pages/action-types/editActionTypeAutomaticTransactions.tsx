import { AddOutlined, EditOutlined } from "@mui/icons-material";
import { Autocomplete, Button, Card, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Radio, RadioGroup, Switch, TextField } from "@mui/material";
import { CUSTOMER_MODEL, EDIT_ACTION_TYPE_TRANSACTION_TYPE } from "../../../types";

import { AsyncAutoComplete } from "../../../components/AsyncAutoComplete";
import { EDIT_ACTION_TYPE_PROPS } from "./types";
import { QueryListContainer } from "../../../containers/querylist.container";
import React from "react";
import { SelectCustomerGroups } from "./components";
import { _axios } from "../../../config/request";
import { transactionTypes } from "../../../types/transactions";

export const AutomaticTransactions = (props: EDIT_ACTION_TYPE_PROPS) => {
    const id = props.state.id
    if (!id) return null;

    return (
        <QueryListContainer<EDIT_ACTION_TYPE_TRANSACTION_TYPE, {}>
            initialFilter={{}}
            renderList={({ data: { rows }, error, loading, refresh }) =>
                <List component={Card} style={{ margin: 5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <ListItem component={Card}>
                        <ListItemText>Automatic transactions</ListItemText>
                        <ListItemSecondaryAction>
                            <EditOrAddTriggerContainer
                                id={id}
                                label={props.state.name}
                                renderData={({ onEdit }) => <IconButton onClick={() => onEdit()}><AddOutlined fontSize='small' /></IconButton>}
                                refresh={refresh}
                            />
                        </ListItemSecondaryAction>
                    </ListItem>
                    <ListItem style={{ flexGrow: 1, position: 'relative' }}>
                        <div style={{ overflow: 'auto', position: 'absolute', top: 6, left: 0, right: 0, bottom: 0 }}><List>
                            {loading && <ListItem style={{ justifyContent: 'center' }}><CircularProgress size={20} /></ListItem>}
                            {error && <ListItem button onClick={refresh} style={{ justifyContent: 'center' }}>{error}</ListItem>}
                            {rows.map(data => <EditOrAddTriggerContainer
                                key={data.id}
                                id={id}
                                label={props.state.name}
                                refresh={refresh}
                                renderData={({ onEdit }) => <ListItem button onClick={() => onEdit(data)}>
                                    <ListItemText primary={`${data.transactionType} (${(data.paymentTypes || []).reduce((res, p) => `${res}${res ? '; ' : ''}${p}`, '')})`} secondary={data.attachToAllCustomers ? 'All customers' : (data.attachedGroups || []).reduce((res, g) => `${res}${res ? '; ' : ''}${g.name}`, '')} />
                                    <ListItemSecondaryAction><IconButton onClick={() => onEdit(data)} size='small'><EditOutlined fontSize="small" /></IconButton></ListItemSecondaryAction>
                                </ListItem>
                                } />)}
                        </List>
                        </div>
                    </ListItem>
                </List>}
            url={`/action-types/${id}/automatictransactions`}
        />
    )
}

const EditOrAddTriggerContainer = (props: {
    refresh: () => void,
    renderData: (props: { onEdit: (data?: EDIT_ACTION_TYPE_TRANSACTION_TYPE) => void }) => React.ReactElement
    label: string
    id: number
}) => {
    const [editData, setEditData] = React.useState<EDIT_ACTION_TYPE_TRANSACTION_TYPE | null>(null)
    return (
        <>
            {props.renderData({ onEdit: data => setEditData(data || { attachedGroups: [], attachToAllCustomers: true, hasParentInvoice: false, paymentTypes: [], transactionType: null }) })}
            {editData && <EditTriggerDialog
                id={props.id}
                label={props.label}
                initialData={editData}
                onClose={() => setEditData(null)}
                onSave={props.refresh} />}
        </>
    )
}

let controllerCustomers = new AbortController()
const EditTriggerDialog = (props: {
    initialData: EDIT_ACTION_TYPE_TRANSACTION_TYPE
    onClose: () => void
    onSave: () => void
    label: string
    id: number
}) => {
    const [state, setState] = React.useState(props.initialData)
    const [loading, setLoading] = React.useState(false)

    const handleSave = async () => {
        if (loading) return;
        setLoading(true)
        try {
            await _axios.put(`/action-types/${props.id}/automatictransactions`, state)
            props.onClose()
            props.onSave()
        } catch (e) {
            setLoading(false)
        }
    }

    const handleDelete = async () => {
        if (loading) return;
        setLoading(true)
        try {
            await _axios.delete(`/action-types/${props.id}/automatictransactions/${state.id}`)
            props.onClose()
            props.onSave()
        } catch (e) {
            setLoading(false)
        }
    }
    const getCustomers: (query?: string) => Promise<CUSTOMER_MODEL[]> = async query => {
        controllerCustomers.abort()
        controllerCustomers = new AbortController()
        const { data: { rows } } = await _axios.post(`/customers`, { name: query, limit: 100 }, { signal: controllerCustomers.signal })
        return rows
    }

    return (
        <Dialog open onClose={props.onClose}>
            <DialogTitle>{props.label}</DialogTitle>
            <DialogContent style={{ width: 550 }}>
                <List>
                    <ListItem>
                        <Autocomplete
                            options={transactionTypes}
                            fullWidth
                            size='small'
                            getOptionLabel={option => option.transactionType}
                            renderInput={props => <TextField {...props} label='Hereket görnüşi' />}
                            value={transactionTypes.find(tr => tr.transactionType === state.transactionType) || null}
                            onChange={(e, value) => setState(state => ({ ...state, transactionType: value?.transactionType || null, paymentTypes: value?.paymentTypes || [] }))}
                        />
                    </ListItem>
                    {state.transactionType && (transactionTypes.find(tr => tr.transactionType === state.transactionType)?.paymentTypes || []).length > 0 && <ListItem>
                        <Autocomplete
                            options={transactionTypes.find(tr => tr.transactionType === state.transactionType)?.paymentTypes || []}
                            fullWidth
                            multiple
                            size='small'
                            renderInput={props => <TextField {...props} label='Töleg görnüşi' />}
                            value={state.paymentTypes}
                            onChange={(e, values) => setState(state => ({ ...state, paymentTypes: values }))}
                        />
                    </ListItem>}
                    <ListItem>
                        <Autocomplete
                            options={['total_sum', 'sum_received', 'difference'] as EDIT_ACTION_TYPE_TRANSACTION_TYPE['amountType'][]}
                            fullWidth
                            size='small'
                            renderInput={props => <TextField {...props} label='Töleg görnüşi' />}
                            value={state.amountType || 'total_sum'}
                            onChange={(e, value) => setState(state => ({ ...state, amountType: value || 'total_sum' }))}
                        />
                    </ListItem>
                    <ListItem>
                        <FormControlLabel style={{ flexGrow: 1 }} label='Ene fakturasy bolmaly (Mysal üçin Giriş/Töleg [Faktura tölegi we Özbaşdak hereket)' control={<Switch checked={state.hasParentInvoice} onChange={() => setState(state => ({ ...state, hasParentInvoice: !state.hasParentInvoice }))} />} />
                    </ListItem>
                    <ListItem>
                        <FormControl>
                            <FormLabel>Esasy müşderi</FormLabel>
                            <RadioGroup
                                value={(state.mainCustomer || 1).toString()}
                                onChange={(e, value) => setState(state => ({ ...state, mainCustomer: parseInt(value) }))}
                                style={{ flexDirection: 'row' }}
                            >
                                <FormControlLabel value={'1'} control={<Radio />} label="1-nji müşderi" />
                                <FormControlLabel value={'2'} control={<Radio />} label="2-nji müşderi" />
                            </RadioGroup>
                        </FormControl>
                    </ListItem>
                    <ListItem>
                        <AsyncAutoComplete<CUSTOMER_MODEL>
                            label='Beýleki müşderi'
                            initialOptions={state.customer ? [state.customer] : []}
                            getOptionsAsync={getCustomers}
                            getOptionsLabel={option => option.name}
                            isOptionEqualToValue={(option, value) => option._id === value._id}
                            value={state.customer}
                            onChange={(e, value) => setState(state => ({ ...state, secondCustomer: value?._id || null, customer: value }))}
                        />
                    </ListItem>
                    <ListItem>
                        <FormControlLabel style={{ flexGrow: 1 }} label='Ähli müşderilere degişli' control={<Switch checked={state.attachToAllCustomers} onChange={() => setState(state => ({ ...state, attachToAllCustomers: !state.attachToAllCustomers, attachedGroups: [] }))} />} />
                    </ListItem>
                    {!state.attachToAllCustomers && <SelectCustomerGroups attachedGroups={state.attachedGroups} onChange={attachedGroups => setState(state => ({ ...state, attachedGroups }))} />}
                </List>
            </DialogContent>
            <DialogActions>
                <Button disabled={loading || !state.id} variant='contained' style={{ marginLeft: 10 }} color='error' size='small' onClick={handleDelete}>Poz</Button>
                <Button disabled={loading} variant='contained' style={{ marginLeft: 10 }} size='small' onClick={handleSave}>Ýatda sakla</Button>
            </DialogActions>
        </Dialog>
    )
}