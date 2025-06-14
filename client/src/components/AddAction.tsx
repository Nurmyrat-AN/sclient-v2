import { ACTION_TYPE_MODEL, CUSTOMER_MODEL } from "../types"
import { Autocomplete, Button, CircularProgress, Collapse, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, TextField, Typography } from "@mui/material"
import { KeyboardArrowDown, KeyboardArrowUp } from "@mui/icons-material"

import $ from 'jquery'
import React from "react"
import { _axios } from "../config/request"
import { confirmAlert } from "react-confirm-alert"
import { useSearchParams } from "react-router-dom"

export type ADD_ACTION_PROPS = {
    customers: number[]
    barcodes?: string
    actionTypeId?: number
}

type Props = {
    onClose: () => void
    onSave: () => void
    actionProps: ADD_ACTION_PROPS
}
type State = {
    customers: CUSTOMER_MODEL[]
    barcode?: string
    initialActionType: ACTION_TYPE_MODEL | null
    actionTypes: ACTION_TYPE_MODEL[]
    note?: string
}

export const AddAction = ({ actionProps, onClose: closeProps, onSave }: Props) => {
    const [loadingStatus, setLoadingStatus] = React.useState<{ loading: boolean, error?: boolean, errorText?: string }>({ error: false, loading: true })
    const [saveStatus, setSaveStatus] = React.useState<{ loading: boolean, error?: boolean, errorText?: string }>({ error: false, loading: false })
    const [refresh, setRefresh] = React.useState(false)
    const [confirmState, setConfirmState] = React.useState(false)
    const [state, setState] = React.useState<State | null>(null)

    const [searchParams, setSearchParams] = useSearchParams()

    React.useEffect(() => {
        const controller = new AbortController()
        setLoadingStatus({ loading: true })
        const timer = setTimeout(async () => {
            try {
                const { data } = await _axios.post<State>('/actions/datas', actionProps, { signal: controller.signal })
                setState(data)
                setLoadingStatus({ loading: false })
            } catch (e: any) {
                setLoadingStatus({ loading: false, error: true, errorText: e.message })
            }
        }, 200)
        if (!searchParams.has('addactionopened')) {
            searchParams.set('addactionopened', "true")
            setSearchParams(searchParams)
        }
        return () => {
            clearTimeout(timer)
            controller.abort()
        }
    }, [actionProps, setLoadingStatus, refresh])
    
    const onClose = () => {

        if (searchParams.has('addactionopened')) {
            searchParams.delete('addactionopened')
            setSearchParams(searchParams)
        }
        closeProps()
    }

    const handleSubmit = (e: any) => {
        e.preventDefault()
        if (confirmState) return;
        if (loadingStatus.loading) return;
        if (!state?.initialActionType) return;

        const actionType = state.initialActionType
        // @ts-ignore
        const amount: number = parseFloat($('#actionValue')?.[0].value || '0')

        if (actionType.action_type !== 'NONE' && amount <= 0) return;

        if (actionType.action_type === 'REMOVE' && state.customers.find(c => c.balance < amount)) return;

        if (actionType.action_type === 'REMOVE_PERCENT' && state.customers.find(c => c.balance < amount * (c.percent * 0.01))) return;


        const handleSave = async ({ actionType, amount, customers, note }: { amount: number, actionType: ACTION_TYPE_MODEL, customers: CUSTOMER_MODEL[], note?: string }) => {
            console.log('save')
            setConfirmState(false)
            setSaveStatus({ loading: true })
            try {
                await _axios.put('/actions', { customers, actionType, amount, note })
                setSaveStatus({ loading: false })
                onSave()
                onClose()
            } catch (e: any) {
                setSaveStatus({ loading: false, error: true, errorText: e.message })
            }
        }

        if (actionType.actionAlertAmount > 0 && actionType.actionAlertAmount <= amount) {
            setConfirmState(true)
            confirmAlert({
                title: 'Herekedi tassyklamak',
                message: `Girizen möçberiňiz bellenilen möçberden (${actionType.actionAlertAmount} TMT) ýokary. Ýatda saklansynmy?`,
                buttons: [
                    {
                        label: 'Hawa',
                        onClick: () => handleSave({ amount, actionType, customers: state.customers, note: state.note })
                    },
                    {
                        label: 'Ýok',
                        onClick: () => setConfirmState(false)
                    }
                ],
                closeOnClickOutside: false,
                closeOnEscape: false
            })
        } else {
            handleSave({ amount, actionType, customers: state.customers, note: state.note })
        }

    }
    return (
        <Dialog
            // @ts-ignore
            component={loadingStatus.error ? undefined : 'form'}
            onSubmit={handleSubmit}
            open
            onClose={confirmState ? undefined : onClose}>
            {((state?.customers || []).length === actionProps.customers.length || (state?.customers || []).length === 1) && <Header customers={state?.customers ?? []} />}
            <DialogContent style={{ minWidth: 600, backgroundColor: state?.initialActionType?.actionColor, padding: 16 }}>
                {loadingStatus.loading || loadingStatus.error ?
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {loadingStatus.loading ? <CircularProgress size={20} /> : <Button onClick={() => setRefresh(!refresh)}>{loadingStatus.errorText}</Button>}
                    </div> : (state?.customers ?? []).length === 0 ?
                        <div style={{ display: 'flex', justifyContent: 'center' }}><Typography color='red'>Tapylmady!</Typography></div>
                        : ((state?.customers || []).length !== actionProps.customers.length && (state?.customers || []).length > 1) ?
                            <List>
                                {(state?.customers || []).map(c => <ListItem button onClick={() => setState(state => !state ? state : ({ ...state, customers: [c] }))}>
                                    <ListItemText primary={c.name} secondary={c.phone_number} />
                                    <ListItemSecondaryAction>{`${c.balance} TMT`}</ListItemSecondaryAction>
                                </ListItem>)}
                            </List>
                            : <List style={{ backgroundColor: 'white' }}>
                                <ListItem>
                                    <Autocomplete
                                        fullWidth
                                        disabled={saveStatus.loading}
                                        getOptionLabel={o => o.name}
                                        value={state?.initialActionType || null}
                                        onChange={(e, v) => setState(state => !state ? state : ({ ...state, initialActionType: v || state.actionTypes[0] || null }))}
                                        size='small'
                                        options={state?.actionTypes || []}
                                        renderInput={pr => <TextField {...pr} label='Hereket görnüşi' />}
                                    />
                                </ListItem>
                                <ListItem>
                                    <TextField
                                        fullWidth
                                        label='Möçberi'
                                        disabled={saveStatus.loading}
                                        size='small'
                                        autoFocus
                                        autoComplete='off'
                                        inputProps={{
                                            step: '0.01',
                                            id: 'actionValue'

                                        }}
                                        onKeyUp={e => {
                                            const found = state?.actionTypes.find(aType => aType.keyCode === e.keyCode)
                                            if (found) {
                                                setState(state => !state ? state : ({ ...state, initialActionType: found || state?.actionTypes[0] || null }))
                                            }
                                        }}
                                        type='number' />
                                </ListItem>
                                <ListItem>
                                    <TextField
                                        size='small'
                                        label='Bellik'
                                        fullWidth
                                        disabled={saveStatus.loading}
                                        value={state?.note || ''}
                                        onChange={e => setState(state => !state ? state : ({ ...state, note: e.target.value }))}
                                    />
                                </ListItem>
                            </List>}
            </DialogContent>
            {!loadingStatus.error &&
                (state?.customers || []).length > 0 &&
                ((state?.customers || []).length === actionProps.customers.length || (state?.customers || []).length === 1)
                && <DialogActions>
                    <Button type='submit' size='small' variant='contained' color='primary' disabled={saveStatus.loading}>Ýatda sakla</Button>
                </DialogActions>}
        </Dialog>
    )
}

const Header = (props: { customers: CUSTOMER_MODEL[] }) => {
    const [open, setOpen] = React.useState(false)

    if (props.customers.length === 0) {
        return (
            <DialogTitle>
                <div>???</div>
            </DialogTitle>
        )
    }

    if (props.customers.length === 1) {
        return (
            <DialogTitle>
                <div style={{ position: 'relative' }} className="MuiListItem-container css-oyakqy-MuiListItem-container">
                    <ListItemText primary={props.customers[0].name} secondary={props.customers[0].phone_number} />
                    <ListItemSecondaryAction><Typography variant="button">{`${props.customers[0].balance} TMT`}</Typography></ListItemSecondaryAction>
                </div>
            </DialogTitle>
        )
    }
    return (
        <DialogTitle>
            <List>
                <ListItem button onClick={() => setOpen(!open)}>
                    {`Saýlanan: ${props.customers.length}`}
                    <ListItemSecondaryAction>
                        <IconButton size='small' onClick={() => setOpen(!open)}>
                            {open ? <KeyboardArrowDown fontSize='small' /> : <KeyboardArrowUp fontSize="small" />}
                        </IconButton>
                    </ListItemSecondaryAction>
                </ListItem>
                <Collapse in={open} component={ListItem}>
                    <List>
                        {props.customers.map(c => <ListItem key={c.id}>
                            <ListItemText primary={c.name} secondary={c.phone_number} />
                            <ListItemSecondaryAction><Typography variant="button">{`${c.balance} TMT`}</Typography></ListItemSecondaryAction>
                        </ListItem>)}
                    </List>
                </Collapse>
            </List>
        </DialogTitle>
    )
}