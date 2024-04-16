import { Autocomplete, CircularProgress, IconButton, InputAdornment, List, ListItem, ListItemSecondaryAction, ListItemText, TextField } from "@mui/material"
import { CheckOutlined, DeleteOutlined, EditOutlined } from "@mui/icons-material"

import $ from 'jquery'
import { ACTION_TYPE_MODEL, CUSTOMER_MODEL } from "../../types"
import { QueryListContainer } from "../../containers/querylist.container"
import React from "react"
import { _axios } from "../../config/request"
import { AsyncAutoComplete } from "../../components/AsyncAutoComplete"

type SETTINGS_TYPE = {
    'default-action-type-id'?: string
    'compare-customer-id'?: string
    'device-app-key'?: string
    'main-app-key'?: string
    '_sequence_number'?: string
    'bridgeKey'?: string
    '_transaction_sequence_number'?: string
    '_host_url'?: string
    '_request_interval'?: string
}

const _defaultSettings: SETTINGS_TYPE = {
    '_host_url': 'http://127.0.0.1:5959/aish5/api/v1',
    '_request_interval': '5000',
}

export const SettingsPage = () => {
    return (
        <QueryListContainer<{}, {}, { settings: SETTINGS_TYPE, actionTypes: ACTION_TYPE_MODEL[], customers: CUSTOMER_MODEL[] }>
            initialFilter={{}}
            url="/settings"
            renderList={({ data: { extras = { settings: {}, actionTypes: [] } }, error, filter, loading, refresh, setFilter }) => <List>
                {loading || error ?
                    loading ?
                        <ListItem style={{ justifyContent: 'center' }}>
                            <CircularProgress size={20} />
                        </ListItem> : <ListItem button onClick={refresh} style={{ justifyContent: 'center' }}>
                            {error}
                        </ListItem>
                    : <>
                        <StringTableCell _key="_host_url" label="Server address" extras={extras?.settings || {}} refresh={refresh} />
                        <StringTableCell _key="device-app-key" label="Gizlin kod" extras={extras?.settings || {}} refresh={refresh} />
                        <StringTableCell _key="main-app-key" label="Esasy gizlin kod" extras={extras?.settings || {}} refresh={refresh} />
                        {/* <StringTableCell _key="bridgeKey" label="Köpri gizlin kody" defaultValue="???" extras={extras?.settings || {}} refresh={refresh} /> */}
                        <StringTableCell _key="_request_interval" label="Maglumat alyş-çalyş interwaly" type='number' extras={extras?.settings || {}} refresh={refresh} />
                        {/* <StringTableCell _key="_transaction_sequence_number" label="Hereket sequence number" type='number' defaultValue="---" extras={extras?.settings || {}} refresh={refresh} />
                        <StringTableCell _key="_sequence_number" label="Maglumat sequence number" type='number' defaultValue="---" extras={extras?.settings || {}} refresh={refresh} /> */}
                        <StringTableCell
                            _key="default-action-type-id"
                            label="Ilkibaşdaky hereket görnüşi"
                            getOptionsLabel={value => extras.actionTypes.find(aType => aType.id.toString() === value?.trim())?.name || '???'}
                            customEditor={({ handleClose, handleOpen, handleSave, loading, value, setValue }) => <Autocomplete
                                options={extras.actionTypes || []}
                                getOptionLabel={option => option.name}
                                size='small'
                                fullWidth
                                value={extras.actionTypes.find(aType => aType.id.toString() === value?.trim()) || null}
                                renderInput={pr => <TextField
                                    {...pr}
                                    label="Ilkibaşdaky hereket görnüşi"
                                    autoFocus
                                    onBlur={handleClose}
                                    onKeyUp={e => {
                                        if (e.keyCode === 27) {
                                            handleClose()
                                        }
                                        if (e.keyCode === 13) {
                                            handleSave()
                                        }
                                    }}
                                    InputProps={{
                                        ...pr.InputProps,
                                        id: `editdefault-action-type-id`,
                                        endAdornment: <InputAdornment position='end'>
                                            {loading ? <CircularProgress size={20} /> : <CheckOutlined fontSize="small" />}
                                            {pr.InputProps.endAdornment}
                                        </InputAdornment>
                                    }}
                                />}
                                onChange={(e, value) => setValue((value?.id || 0).toString())}
                            />}
                            extras={extras.settings || {}}
                            refresh={refresh} />
                        <EditCustomer
                            _key="compare-customer-id"
                            label="Ilkibaşdaky hereket görnüşi"
                            customers={extras.customers || []}
                            getOptionsLabel={value => extras.actionTypes.find(aType => aType.id.toString() === value?.trim())?.name || '???'}
                            extras={extras.settings || {}}
                            refresh={refresh}
                        />
                    </>}
            </List>}
        />
    )
}

const StringTableCell = ({ _key, extras, label, refresh, type = 'string', customEditor, defaultValue = '', getOptionsLabel = value => value }: {
    extras: SETTINGS_TYPE,
    _key: keyof SETTINGS_TYPE,
    getOptionsLabel?: (value: string) => any
    label: string,
    defaultValue?: string,
    refresh: () => void,
    type?: 'number' | 'string',
    customEditor?: (props: {
        handleClose: () => void
        handleOpen: () => void
        handleSave: () => Promise<void>
        loading: boolean
        value: string
        setValue: React.Dispatch<React.SetStateAction<string>>
    }) => React.ReactElement
}) => {
    const [edit, setEdit] = React.useState<string | null>(null)
    const [loading, setLoading] = React.useState(false)
    const _value = { ..._defaultSettings, ...extras, }[_key] || '' as string
    const id = `edit${_key}`
    const handleClose = () => setEdit(null)
    const handleOpen = () => edit === null ? setEdit(_value) : null
    const handleSave = async () => {
        if (loading) return;
        if (type === 'number' && (isNaN(parseFloat(edit || '')) || parseFloat(edit || '') < 0)) return;
        setLoading(true)
        try {
            await _axios.put('/settings', { _key, _value: type === 'number' ? parseFloat(edit || '') : edit })
            setEdit(null)
            refresh()
        } catch (e) { }
        setLoading(false)
    }

    React.useEffect(() => {
        if (!loading) {
            $(`#${id}`)?.focus()
        }
    }, [loading, id])

    const handleDelete = async () => {
        if (loading) return;
        setLoading(true)
        try {
            await _axios.put('/settings', { _key, _value: type === 'number' ? parseFloat(edit || '') : edit, delete: true })
            setEdit(null)
            refresh()
        } catch (e) { }
        setLoading(false)
    }

    React.useEffect(() => {
        if (!loading) {
            $(`#${id}`)?.focus()
        }
    }, [loading, id])

    return (
        <ListItem className="tr" onDoubleClick={handleOpen}>
            {edit === null ?
                <ListItemText primary={label} secondary={getOptionsLabel(_value || defaultValue)} />
                : customEditor ? customEditor({
                    handleClose,
                    handleOpen,
                    handleSave,
                    loading,
                    value: edit,
                    // @ts-ignore
                    setValue: setEdit
                }) : <TextField
                    disabled={loading}
                    size='small'
                    fullWidth
                    autoFocus
                    onBlur={handleClose}
                    onKeyUp={e => {
                        if (e.keyCode === 27) {
                            handleClose()
                        }
                        if (e.keyCode === 13) {
                            handleSave()
                        }
                    }}
                    InputProps={{
                        id,
                        endAdornment: <InputAdornment position='end'>
                            {loading ? <CircularProgress size={20} /> : <CheckOutlined fontSize="small" />}
                        </InputAdornment>
                    }}
                    label={label}
                    value={edit}
                    onChange={e => setEdit(e.target.value)}
                />}
            {edit === null && <ListItemSecondaryAction>
                <IconButton size='small' onClick={handleOpen}>
                    <EditOutlined fontSize="small" />
                </IconButton>
                <IconButton size='small' onClick={handleDelete}>
                    <DeleteOutlined fontSize="small" />
                </IconButton>
            </ListItemSecondaryAction>}
        </ListItem>
    )
}



let controllerCustomer = new AbortController()
const EditCustomer = ({ _key, extras, label, refresh, type = 'string', defaultValue = '', getOptionsLabel = value => value, customers }: {
    extras: SETTINGS_TYPE,
    _key: keyof SETTINGS_TYPE,
    getOptionsLabel?: (value: string) => any
    label: string,
    defaultValue?: string,
    refresh: () => void,
    type?: 'number' | 'string'
    customers: CUSTOMER_MODEL[]
}) => {
    const getCustomers: (query?: string) => Promise<CUSTOMER_MODEL[]> = async query => {
        controllerCustomer.abort()
        controllerCustomer = new AbortController()
        const { data: { rows } } = await _axios.post(`/customers`, { name: query, limit: 100 }, { signal: controllerCustomer.signal })
        return rows
    }
    return (
        <StringTableCell
            _key="compare-customer-id"
            label="Deňeşdirilmeli müşderi"
            getOptionsLabel={value => customers.find(c => c._id === value)?.name || '???'}
            customEditor={({ handleClose, handleOpen, handleSave, loading, value, setValue }) =>
                <AsyncAutoComplete<CUSTOMER_MODEL>
                    initialOptions={customers}
                    label={`Müşderi saýla`}
                    getOptionsAsync={getCustomers}
                    getOptionsLabel={option => option.name}
                    isOptionEqualToValue={(option, value) => option._id === value._id}
                    value={customers.find(c => c._id === extras["compare-customer-id"]) || null}
                    onChange={(e, value) => setValue(value?._id || '???')}
                    textFieldProps={pr => ({
                        ...pr,
                        label: "Deňeşdirilmeli muşderi",
                        autoFocus: true,
                        fullWidth: true,
                        onBlur: handleClose,
                        onKeyUp: e => {
                            if (e.keyCode === 27) {
                                handleClose()
                            }
                            if (e.keyCode === 13) {
                                handleSave()
                            }
                        },
                        InputProps: {
                            ...pr.InputProps,
                            id: `editcompare-customer-id`,
                            endAdornment: <InputAdornment position='end'>
                                {loading ? <CircularProgress size={20} /> : <CheckOutlined fontSize="small" />}
                                {pr.InputProps.endAdornment}
                            </InputAdornment>
                        },
                    })}
                />}
            extras={extras}
            refresh={refresh} />
    )
}