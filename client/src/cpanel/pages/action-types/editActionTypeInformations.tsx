import { Autocomplete, Button, Card, FormControl, FormControlLabel, FormLabel, IconButton, InputAdornment, List, ListItem, ListItemSecondaryAction, Radio, RadioGroup, Switch, TextField } from "@mui/material";
import { CUSTOMER_GROUP_MODEL, CUSTOMER_MODEL } from "../../../types";

import { ActionType_TYPE_AutoComplete as ActionTypeTypeAutoComplete } from "../../../components/ActionType_TYPE_AutoComplete";
import { AsyncAutoComplete } from "../../../components/AsyncAutoComplete";
import { DeleteOutlined } from "@mui/icons-material";
import { EDIT_ACTION_TYPE_PROPS } from "./types";
import React from "react";
import { _axios } from "../../../config/request";
import { transactionTypes } from "../../../types/transactions";

let controllerCustomers = new AbortController()
let controllerCustomerGroups = new AbortController()
export const Informations = (props: EDIT_ACTION_TYPE_PROPS) => {
    const { state, setState } = props
    const getCustomers: (query?: string) => Promise<CUSTOMER_MODEL[]> = async query => {
        controllerCustomers.abort()
        controllerCustomers = new AbortController()
        const { data: { rows } } = await _axios.post(`/customers`, { name: query, limit: 100 }, { signal: controllerCustomers.signal })
        return rows
    }
    const getCustomerGroups = async (query?: string) => {
        controllerCustomerGroups.abort()
        controllerCustomerGroups = new AbortController()
        const { data: { rows } } = await _axios.post(`/customer-groups`, { name: query, limit: 100 }, { signal: controllerCustomerGroups.signal })
        return rows
    }
    return (
        <List>
            <ListItem>
                <TextField
                    size='small'
                    fullWidth
                    label='Ady'
                    InputProps={{
                        endAdornment: <InputAdornment position='end'>
                            <input
                                style={{ border: 'none' }}
                                type='color'
                                value={state.actionColor}
                                onChange={e => setState(state => ({ ...state, actionColor: e.target.value }))} />
                        </InputAdornment>
                    }}
                    value={state.name}
                    onChange={e => setState(state => ({ ...state, name: e.target.value }))}
                />
            </ListItem>
            <ListItem>
                <TextField
                    size='small'
                    fullWidth
                    label='KeyCode'
                    value={String.fromCharCode(state.keyCode)}
                    onKeyUp={e => setState(state => ({ ...state, keyCode: e.keyCode }))} />
            </ListItem>
            <ListItem>
                <TextField
                    size='small'
                    fullWidth
                    label='Habar bermeli iň uly möçber (Şu möçberden uly bolsa duýduryş çykýar)'
                    value={state.actionAlertAmount}
                    type='number'
                    onChange={e => setState(state => ({ ...state, actionAlertAmount: +e.target.value }))}
                />
            </ListItem>
            <ListItem>
                <TextField
                    size='small'
                    fullWidth
                    label='Tertip belgi'
                    value={state.tertip}
                    type='number'
                    onChange={e => setState(state => ({ ...state, tertip: +e.target.value }))}
                />
            </ListItem>
            {!state.id && <ListItem>
                <ActionTypeTypeAutoComplete
                    value={state.action_type}
                    onChange={action_type => setState(state => ({ ...state, action_type: action_type || 'NONE' }))}
                />
            </ListItem>}
            <ListItem>
                <FormControlLabel style={{ flexGrow: 1 }} label='Global (kassalarda hereket edilip biliner)' control={<Switch checked={state.isGlobal} onChange={() => setState(state => ({ ...state, isGlobal: !state.isGlobal }))} />} />
            </ListItem>
            <ListItem>
                <FormControlLabel style={{ flexGrow: 1 }} label='Direct menus (Müşdera hereket gosuljak wagty menýuda cykýar)' control={<Switch checked={state.isMenuOption} onChange={() => setState(state => ({ ...state, isMenuOption: !state.isMenuOption }))} />} />
            </ListItem>
            <ListItem>
                <FormControlLabel style={{ flexGrow: 1 }} label='Herekediň sms habar bar' control={<Switch checked={state.hasMessage} onChange={() => setState(state => ({ ...state, hasMessage: !state.hasMessage }))} />} />
            </ListItem>
            {state.hasMessage && <EditMessage
                message={state.message}
                setMessage={message => setState(state => ({ ...state, message }))}
            />}
            <ListItem>
                <FormControlLabel style={{ flexGrow: 1 }} label='Automatic transaction' control={<Switch checked={state.isAutomatic} onChange={() => setState(state => ({ ...state, isAutomatic: !state.isAutomatic, transactionType: null, paymentTypes: [], mainCustomer: null, secondCustomer: null, customer: null }))} />} />
            </ListItem>
            {state.isAutomatic && <ListItem>
                <Autocomplete
                    options={transactionTypes}
                    fullWidth
                    size='small'
                    getOptionLabel={option => option.transactionType}
                    renderInput={props => <TextField {...props} label='Hereket görnüşi' />}
                    value={transactionTypes.find(tr => tr.transactionType === state.transactionType) || null}
                    onChange={(e, value) => setState(state => ({ ...state, transactionType: value?.transactionType || null, paymentTypes: value?.paymentTypes || [] }))}
                />
            </ListItem>}
            {state.transactionType && <ListItem>
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
            {state.isAutomatic && <ListItem>
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
            </ListItem>}
            {state.isAutomatic && <ListItem>
                <AsyncAutoComplete<CUSTOMER_MODEL>
                    label='Beýleki müşderi'
                    initialOptions={state.customer ? [state.customer] : []}
                    getOptionsAsync={getCustomers}
                    getOptionsLabel={option => option.name}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    value={state.customer}
                    onChange={(e, value) => setState(state => ({ ...state, secondCustomer: value?._id || null, customer: value }))}
                />
            </ListItem>}
            {state.isAutomatic && <ListItem>
                <FormControlLabel style={{ flexGrow: 1 }} label='Ähli müşderilere degişli' control={<Switch checked={state.attachToAllCustomers} onChange={() => setState(state => ({ ...state, attachToAllCustomers: !state.attachToAllCustomers, attachedGroups: [] }))} />} />
            </ListItem>}
            {state.isAutomatic && !state.attachToAllCustomers && <ListItem>
                <Card style={{ flexGrow: 1 }}>
                    <List>
                        <ListItem>
                            <AsyncAutoComplete<CUSTOMER_GROUP_MODEL>
                                getOptionsAsync={getCustomerGroups}
                                label="Toparlar"
                                getOptionsLabel={option => option.name}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                value={null}
                                onChange={(e, value) => !value || state.attachedGroups.find(g => g.id === value.id) ? null : setState(state => ({ ...state, attachedGroups: [...state.attachedGroups, value] }))}
                            />
                        </ListItem>
                        <ListItem>
                            <Card style={{ flexGrow: 1, height: 350, overflow: 'auto' }}>
                                <List>
                                    {state.attachedGroups.map(group => <ListItem key={group.id}>
                                        {group.name}
                                        <ListItemSecondaryAction>
                                            <IconButton onClick={() => setState(state => ({ ...state, attachedGroups: state.attachedGroups.filter(g => g.id !== group.id) }))} size='small'><DeleteOutlined fontSize="small" /></IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>)}
                                </List>
                            </Card>
                        </ListItem>
                    </List>
                </Card>
            </ListItem>}
        </List>
    )
}

type MESSAGE_PATTERNS_TYPE = '{date}' | '{client}' | '{balance}' | '{amount}' | '{res}' | '{aish_balance}' | '{note}'
const EditMessage = ({ message, setMessage }: { message: string, setMessage: (message: string) => void }) => {
    const [selectionIndex, setSelectionIndex] = React.useState(message.length)

    const handleAddPattern = (pattern: MESSAGE_PATTERNS_TYPE) => {
        setMessage(`${message.slice(0, selectionIndex)}${pattern}${message.slice(selectionIndex)}`)
        setSelectionIndex(idx => idx + pattern.length)
    }

    return (
        <>
            <ListItem>
                <TextField
                    size='small'
                    fullWidth
                    label='Herekediň sms ýazgysy'
                    multiline
                    rows={5}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    InputProps={{
                        rows: 5,
                        onBlur: e => setSelectionIndex(e.target.selectionStart || message.length)
                    }}
                />
            </ListItem>
            <ListItem style={{ alignItems: 'stretch', justifyContent: 'space-between', paddingTop: 0, marginTop: 0 }}>
                <Button onClick={() => handleAddPattern(`{date}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Sene</Button>
                <Button onClick={() => handleAddPattern(`{client}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Müşderi</Button>
                <Button onClick={() => handleAddPattern(`{balance}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Galyndy</Button>
                <Button onClick={() => handleAddPattern(`{amount}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Möçber</Button>
                <Button onClick={() => handleAddPattern(`{res}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Netije</Button>
                <Button onClick={() => handleAddPattern(`{aish_balance}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Aish Balance</Button>
                <Button onClick={() => handleAddPattern(`{note}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Bellik</Button>
            </ListItem>
        </>
    )
}