import { ActionTypesAutoComplete, CustomerGroupsAutoComplete, SelectCustomerGroups } from "./components";
import { AddOutlined, EditOutlined, KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material";
import { Autocomplete, Avatar, Button, Card, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormControlLabel, FormLabel, IconButton, InputAdornment, List, ListItem, ListItemAvatar, ListItemSecondaryAction, ListItemText, ListSubheader, Radio, RadioGroup, Switch, TextField } from "@mui/material";
import { EDIT_TRIGGER_TYPE, TRIGGER_ACTION_TYPE, TRIGGER_TYPE } from "../../../types";

import { EDIT_ACTION_TYPE_PROPS } from "./types";
import { QueryListContainer } from "../../../containers/querylist.container";
import React from "react";
import { _axios } from "../../../config/request";
import { AsyncAutoComplete } from "../../../components/AsyncAutoComplete";


let controllerProducts = new AbortController()
export const ExceptedProducts = (props: EDIT_ACTION_TYPE_PROPS) => {
    const id = props.state.id
    if (!id) return null;

    const getProducts: (query?: string) => Promise<any[]> = async query => {
        controllerProducts.abort()
        controllerProducts = new AbortController()
        const { data: { rows } } = await _axios.post(`/products`, { name: query, limit: 100 }, { signal: controllerProducts.signal })
        return rows
    }
    return (
        <QueryListContainer<TRIGGER_TYPE, {}>
            initialFilter={{}}
            renderList={({ data: { rows }, error, loading, refresh }) =>
                <List component={Card} style={{ margin: 5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <ListItem component={Card}>
                        <ListItemText
                            primary={
                                <AsyncAutoComplete 
                                    label={'Harytlar'}
                                    getOptionsAsync={getProducts}
                                    isOptionEqualToValue={(t, v) => t.name.contains(v)}
                                />
                            }
                        />
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
                                    <ListItemAvatar><Avatar>{(data.actions || []).length}</Avatar></ListItemAvatar>
                                    <ListItemText primary={`${data.onAction} (${data.attachToAllCustomers ? 'ALL' : (data.attachedGroups || []).reduce((res, g) => `${res}${res ? '; ' : ''}${g.name}`, '')})`} secondary={
                                        data.minAmount !== 0 && data.maxAmount !== 0
                                            ? `${data.minAmount} <= amount <= ${data.maxAmount}` :
                                            data.minAmount !== 0 ? `${data.minAmount} <= amount` :
                                                data.maxAmount !== 0 ? `amount <= ${data.maxAmount}` : `∞ <= amount <= ∞`

                                    } />
                                    <ListItemSecondaryAction><IconButton onClick={() => onEdit(data)} size='small'><EditOutlined fontSize="small" /></IconButton></ListItemSecondaryAction>
                                </ListItem>} />)}
                        </List>
                        </div>
                    </ListItem>
                </List>}
            url={`/action-types/${id}/triggers`}
        />
    )
}

const EditOrAddTriggerContainer = (props: {
    refresh: () => void,
    renderData: (props: { onEdit: (data?: EDIT_TRIGGER_TYPE) => void }) => React.ReactElement
    label: string
    id: number
}) => {
    const [editData, setEditData] = React.useState<EDIT_TRIGGER_TYPE | null>(null)
    return (
        <>
            {props.renderData({ onEdit: data => setEditData(data || { attachToAllCustomers: true, onAction: 'onInsert', maxAmount: 0, minAmount: 0, actions: [] }) })}
            {editData && <EditTriggerDialog
                id={props.id}
                label={props.label}
                initialData={editData}
                onClose={() => setEditData(null)}
                onSave={props.refresh} />}
        </>
    )
}

const EditTriggerDialog = (props: {
    initialData: EDIT_TRIGGER_TYPE
    onClose: () => void
    onSave: () => void
    label: string
    id: number
}) => {
    const [state, setState] = React.useState(props.initialData)
    const [loading, setLoading] = React.useState(false)
    const [windowState, setWindowState] = React.useState<'INFORMATIONS' | 'ACTIONS'>('INFORMATIONS')

    const handleSave = async () => {
        if (loading) return;
        setLoading(true)
        try {
            await _axios.put(`/action-types/${props.id}/triggers`, state)
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
            await _axios.delete(`/action-types/${props.id}/triggers/${state.id}`)
            props.onClose()
            props.onSave()
        } catch (e) {
            setLoading(false)
        }
    }

    return (
        <Dialog open onClose={props.onClose}>
            <DialogTitle>{props.label}</DialogTitle>
            <DialogContent style={{ width: 450 }}>
                <List subheader={<ListSubheader>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <Button onClick={() => setWindowState('INFORMATIONS')} color={windowState === 'INFORMATIONS' ? 'primary' : 'inherit'} size='small'>Esasy maglumatlar</Button>
                        <div style={{ margin: 10 }}>/</div>
                        <Button onClick={() => setWindowState('ACTIONS')} color={windowState === 'ACTIONS' ? 'primary' : 'inherit'} size='small'>Hereketler</Button>
                    </div>
                </ListSubheader>}>
                    {windowState === 'INFORMATIONS' ? <>
                        <ListItem>
                            <FormControl disabled={loading}>
                                <FormLabel>Gender</FormLabel>
                                <RadioGroup
                                    style={{ flexDirection: 'row' }}
                                    value={state.onAction}
                                    onChange={(e, v) => setState(state => ({ ...state, onAction: v as EDIT_TRIGGER_TYPE['onAction'] }))}
                                >
                                    <FormControlLabel value="onInsert" control={<Radio />} label="Döredilenden soňra" />
                                    <FormControlLabel value="onDelete" control={<Radio />} label="Pozulandan soňra" />
                                </RadioGroup>
                            </FormControl>
                        </ListItem>
                        <LTextField disabled={loading} state={state} setState={setState} label="Min" stateKey="minAmount" />
                        <LTextField disabled={loading} state={state} setState={setState} label="Max" stateKey="maxAmount" />
                        <ListItem>
                            <FormControlLabel style={{ flexGrow: 1 }} label='Ähli müşderilere degişli' control={<Switch checked={state.attachToAllCustomers} onChange={() => setState(state => ({ ...state, attachToAllCustomers: !state.attachToAllCustomers, attachedGroups: [] }))} />} />
                        </ListItem>
                        {!state.attachToAllCustomers && <SelectCustomerGroups attachedGroups={state.attachedGroups || []} onChange={attachedGroups => setState(state => ({ ...state, attachedGroups }))} />}
                    </> : <ListItem>
                        <Card style={{ flexGrow: 1 }}>
                            <List>
                                <ListItem>
                                    Hereketler
                                    <ListItemSecondaryAction>
                                        <AddOrEditTriggerActionContainer
                                            state={state} setState={setState}
                                            renderComponent={({ onClick }) => <IconButton onClick={() => onClick()} size='small'>
                                                <AddOutlined fontSize="small" />
                                            </IconButton>}
                                        />
                                    </ListItemSecondaryAction>
                                </ListItem>
                                <ListItem>
                                    <Card style={{ flexGrow: 1, height: 350, overflow: 'auto' }}>
                                        <List>
                                            {(state.actions || []).map((action, idx) => <AddOrEditTriggerActionContainer
                                                state={state} setState={setState}
                                                renderComponent={({ onClick }) => <ListItem button onClick={() => onClick({ ...action, idx })}>
                                                    <ListItemText
                                                        primary={action.type}
                                                        secondary={`${action.customerGroup?.name || action.actionType?.name || '???'} (${action.actionAmountCalculation})`} />
                                                    <ListItemSecondaryAction><IconButton size='small' onClick={() => onClick({ ...action, idx })}><EditOutlined fontSize="small" /></IconButton></ListItemSecondaryAction>
                                                </ListItem>} key={idx} />)}
                                        </List>
                                    </Card>
                                </ListItem>
                            </List>
                        </Card>
                    </ListItem>}
                </List>
            </DialogContent>
            <DialogActions>
                <Button disabled={loading || !state.id} variant='contained' style={{ marginLeft: 10 }} color='error' size='small' onClick={handleDelete}>Poz</Button>
                <Button disabled={loading} variant='contained' style={{ marginLeft: 10 }} size='small' onClick={handleSave}>Ýatda sakla</Button>
            </DialogActions>
        </Dialog>
    )
}

const LTextField = ({ stateKey, setState, label, state, disabled }: { disabled?: boolean, state: EDIT_TRIGGER_TYPE, setState: React.Dispatch<React.SetStateAction<EDIT_TRIGGER_TYPE>>, label: string, stateKey: keyof EDIT_TRIGGER_TYPE }) => (
    <ListItem>
        <TextField
            size='small'
            fullWidth
            type='number'
            label={label}
            disabled={disabled}
            value={state[stateKey]}
            onChange={e => setState(state => ({ ...state, [stateKey]: e.target.value }))}
        />
    </ListItem>
)

const AddOrEditTriggerActionContainer = (props: {
    renderComponent: (props: { onClick: (data?: TRIGGER_ACTION_TYPE & { idx?: number }) => void }) => React.ReactElement,
    state: EDIT_TRIGGER_TYPE
    setState: React.Dispatch<React.SetStateAction<EDIT_TRIGGER_TYPE>>
}) => {
    const [editData, setEditData] = React.useState<TRIGGER_ACTION_TYPE & { idx?: number } | null>(null)

    return (
        <>
            {props.renderComponent({ onClick: (data) => setEditData(data || { actionAmountCalculation: '', type: 'ADD_TO_GROUP' }) })}
            {editData && <AddOrEditTriggerAction initialData={editData} onClose={() => setEditData(null)} onSave={(data, remove) => {
                const { idx, ...newData } = data
                if (remove && data.idx !== undefined) {
                    props.setState(state => ({
                        ...state,
                        actions: (state.actions || []).filter((a, idx) => idx !== data.idx)
                    }))
                } else if (data.idx !== undefined) {
                    props.setState(state => ({
                        ...state,
                        actions: (state.actions || []).map((a, idx) => idx !== data.idx ? a : newData)
                    }))
                } else {
                    props.setState(state => ({
                        ...state,
                        actions: [...(state.actions || []), newData]
                    }))
                }
                setEditData(null)
            }} />}
        </>
    )
}

const AddOrEditTriggerAction = (props: {
    initialData: TRIGGER_ACTION_TYPE & { idx?: number }
    onClose: () => void
    onSave: (data: TRIGGER_ACTION_TYPE & { idx?: number }, remove?: boolean) => void
}) => {
    const [state, setState] = React.useState(props.initialData)

    const handleSave = () => props.onSave(state)
    const handleDelete = () => props.onSave(state, true)

    return (
        <Dialog open onClose={props.onClose}>
            <DialogTitle>Hereket</DialogTitle>
            <DialogContent style={{ minWidth: 350 }}>
                <List>
                    <ListItem>
                        <Autocomplete
                            options={['ADD_TO_GROUP', 'REMOVE_FROM_GROUP', 'CREATE_ACTION'] as TRIGGER_ACTION_TYPE['type'][]}
                            size='small'
                            fullWidth
                            value={state.type}
                            onChange={(e, type) => setState(state => ({ ...state, type: type || state.type }))}
                            renderInput={pr => <TextField {...pr} label='Işiň görnüşi' />}
                        />
                    </ListItem>
                    <TestCalculation state={state} setState={setState} />
                    {state.type === 'CREATE_ACTION' ?
                        <ActionTypesAutoComplete
                            value={state.actionType || null}
                            onChange={v => setState(state => ({ ...state, actionType: v, actionTypeId: v?.id }))}
                        /> :
                        <CustomerGroupsAutoComplete
                            value={state.customerGroup || null}
                            onChange={v => setState(state => ({ ...state, customerGroup: v, customerGroupId: v?.id }))}
                        />}
                </List>
            </DialogContent>
            <DialogActions>
                <Button disabled={state.idx === undefined} variant='contained' style={{ marginLeft: 10 }} color='error' size='small' onClick={handleDelete}>Poz</Button>
                <Button variant='contained' style={{ marginLeft: 10 }} size='small' onClick={handleSave}>Ýatda sakla</Button>
            </DialogActions>
        </Dialog>
    )
}

const TestCalculation = (props: { state: TRIGGER_ACTION_TYPE, setState: React.Dispatch<React.SetStateAction<TRIGGER_ACTION_TYPE>> }) => {
    const [state, setState] = React.useState({ amount: '', res: '' })
    const [isExpanded, setExpanded] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const handleTest = async () => {
        setLoading(true)
        try {
            const { data } = await _axios.post(`/action-types/0/triggers/testcalculation`, { action: state, actionAmountCalculation: props.state.actionAmountCalculation })
            alert(data)
        } catch (e: any) {
            alert(`Error calculation: ${e.message}`)
        }
        setLoading(false)
    }
    return (
        <>
            <ListItem>
                <TextField
                    size='small'
                    disabled={loading}
                    fullWidth
                    label='Hasaplaýyş mysaly'
                    helperText='a -> Herekediň moçberi; r -> Herekediň soňundaky balansy'
                    value={props.state.actionAmountCalculation}
                    onChange={e => props.setState(state => ({ ...state, actionAmountCalculation: e.target.value }))}
                    InputProps={{
                        endAdornment: <InputAdornment position='end'>
                            <IconButton size='small' onClick={() => setExpanded(!isExpanded)}>{isExpanded ? <KeyboardArrowUp fontSize="small" /> : <KeyboardArrowDown fontSize="small" />}</IconButton>
                        </InputAdornment>
                    }}
                />
            </ListItem>
            <Collapse in={isExpanded}>
                <ListItem>
                    <Card style={{ flexGrow: 1, padding: 8 }}>
                        <List subheader={<ListSubheader>Test calculation</ListSubheader>}>
                            <ListItem>
                                <TextField
                                    size='small'
                                    disabled={loading}
                                    fullWidth
                                    label='Hereket möçberi'
                                    value={state.amount}
                                    onChange={e => setState(state => ({ ...state, amount: e.target.value }))}
                                />
                            </ListItem>
                            <ListItem>
                                <TextField
                                    size='small'
                                    disabled={loading}
                                    fullWidth
                                    label='Hereket galyndysy'
                                    value={state.res}
                                    onChange={e => setState(state => ({ ...state, res: e.target.value }))}
                                />
                            </ListItem>
                            <ListItem style={{ justifyContent: 'flex-end' }}>
                                <Button onClick={handleTest} disabled={loading} size='small'>Test</Button>
                            </ListItem>
                        </List>
                    </Card>
                </ListItem>
            </Collapse>
        </>
    )
}