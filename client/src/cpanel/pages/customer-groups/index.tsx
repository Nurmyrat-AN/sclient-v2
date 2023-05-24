import { AddOutlined, EditOutlined } from "@mui/icons-material"
import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material"
import { CUSTOMER_GROUP_MODEL, CUSTOMER_MODEL, EDIT_CUSTOMER_GROUP_MODEL } from "../../../types"

import { AsyncAutoComplete } from "../../../components/AsyncAutoComplete"
import { CustomTablePagination } from "../../../components/CustomTablePagination"
import { CustomersPage } from "../customers"
import { QueryListContainer } from "../../../containers/querylist.container"
import React from "react"
import { _axios } from "../../../config/request"
import { useGlobalLoading } from "../../../context/globalloading"
import { useSearchParams } from "react-router-dom"

export const CustomerGroups = () => {
    const [query] = useSearchParams()
    return (
        <QueryListContainer<CUSTOMER_GROUP_MODEL, {
            name: string
            offset: number
            limit: number
        }>
            url="/customer-groups"
            initialFilter={{
                name: query.get('name') || '',
                offset: parseInt(query.get('offset') || '0'),
                limit: parseInt(query.get('limit') || '10')
            }}
            renderList={({ data: { count, rows }, filter, setFilter, refresh, error, loading }) => <Table stickyHeader size='small'>
                <TableHead>
                    <TableRow>
                        <TableCell><TextField size="small" fullWidth value={filter.name} label='Ady' onChange={e => setFilter(filter => ({ ...filter, name: e.target.value, offset: 0 }))} /></TableCell>
                        <TableCell align="center">Müşderi sany</TableCell>
                        <EditOrAdd refresh={refresh} />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading && <TableRow><TableCell align="center" colSpan={6}><CircularProgress size={20} /></TableCell></TableRow>}
                    {error && <TableRow><TableCell align="center" colSpan={6}><Button onClick={refresh} size='small'>{error}</Button></TableCell></TableRow>}
                    {!error && !loading && count === 0 && <TableRow><TableCell align="center" colSpan={6}>Tapylmady!</TableCell></TableRow>}
                    {rows.map(data => <TableRow key={data.id}>
                        <TableCell>{data.name}</TableCell>
                        <CustomerCount data={data} refresh={refresh} />
                        <EditOrAdd refresh={refresh} actionType={data} />
                    </TableRow>)}
                </TableBody>
                <CustomTablePagination
                    count={count}
                    page={filter.offset / filter.limit}
                    rowsPerPage={filter.limit}
                    setPage={page => setFilter(filter => ({ ...filter, offset: page * filter.limit }))}
                    setRowsPerPage={limit => setFilter(filter => ({ ...filter, limit, offset: 0 }))}
                />
            </Table>}
        />
    )
}


const EditOrAdd = (props: { actionType?: CUSTOMER_GROUP_MODEL, refresh: () => void }) => {
    const [edit, setEdit] = React.useState<EDIT_CUSTOMER_GROUP_MODEL | null>(null)
    return (
        <TableCell width={10}>
            <IconButton size='small' onClick={() => setEdit(props.actionType || {
                name: ''
            })}>
                {props.actionType ? <EditOutlined fontSize='small' /> : <AddOutlined fontSize="small" />}
            </IconButton>
            {edit && <EditCustomerGroup
                state={edit}
                // @ts-ignore
                setState={setEdit}
                onClose={() => setEdit(null)}
                refresh={props.refresh}
            />}
        </TableCell>
    )
}


const EditCustomerGroup = (props: {
    state: EDIT_CUSTOMER_GROUP_MODEL
    setState: React.Dispatch<React.SetStateAction<EDIT_CUSTOMER_GROUP_MODEL>>
    refresh: () => void
    onClose: () => void
}) => {
    const { onClose, refresh, setState, state } = props
    const { endLoading, startLoading } = useGlobalLoading()

    const handleSave = async () => {
        startLoading()
        try {
            await _axios.put('/customer-groups', state)
            refresh()
            onClose()
        } catch (e) { }
        endLoading()
    }
    const handleDelete = async () => {
        startLoading()
        try {
            await _axios.delete(`/customer-groups/${state.id}`)
            refresh()
            onClose()
        } catch (e) { }
        endLoading()
    }
    return (
        <Dialog open onClose={onClose}>
            <DialogTitle>
                {state.id ? state.name : 'Täze topar'}
            </DialogTitle>
            <DialogContent style={{ width: 600, position: 'relative' }}>
                <List>
                    <ListItem>
                        <TextField
                            size='small'
                            fullWidth
                            label='Ady'
                            value={state.name}
                            onChange={e => setState(state => ({ ...state, name: e.target.value }))}
                        />
                    </ListItem>
                </List>
            </DialogContent>
            <DialogActions>
                <Button variant='contained' style={{ marginLeft: 10 }} disabled={!state.id} color='error' size='small' onClick={handleDelete}>Poz</Button>
                <Button variant='contained' style={{ marginLeft: 10 }} disabled={!state.name} size='small' onClick={handleSave}>Ýatda sakla</Button>
            </DialogActions>
        </Dialog>
    )
}

let controllerCustomer = new AbortController()
const CustomerCount = ({ data, ...props }: { data: CUSTOMER_GROUP_MODEL, refresh: () => void }) => {
    const [changed, setChanged] = React.useState(false)
    const [open, setOpened] = React.useState(false)
    const [refresh, setRefresh] = React.useState(true)
    const [selectedCustomer, setSelectedCustomer] = React.useState<CUSTOMER_MODEL | null>(null)
    const { endLoading, startLoading } = useGlobalLoading()


    const getCustomers: (query?: string) => Promise<CUSTOMER_MODEL[]> = async query => {
        controllerCustomer.abort()
        controllerCustomer = new AbortController()
        const { data: { rows } } = await _axios.post(`/customers`, { name: query, limit: 100 }, { signal: controllerCustomer.signal })
        return rows
    }

    const handleAdd = async () => {
        if (selectedCustomer == null) return;
        startLoading()
        setRefresh(false)
        try {
            await _axios.put(`/customer-groups/customers`, { groupId: data.id, customerIds: [selectedCustomer.id] })
            setSelectedCustomer(null)
            if (!changed) setChanged(true)
        } catch (e) { }
        setRefresh(true)
        endLoading()
    }

    const handleClear = async () => {
        startLoading()
        setRefresh(false)
        try {
            await _axios.put(`/customer-groups/customers`, { groupId: data.id, clearAll: true })
            setSelectedCustomer(null)
            if (!changed) setChanged(true)
        } catch (e) { }
        setRefresh(true)
        endLoading()
    }

    return (
        <TableCell align="center">
            <Button onClick={() => setOpened(!open)}>{data.customerCount}</Button>
            <Dialog open={open} onClose={() => {
                if (changed) {
                    props.refresh()
                }
                setOpened(false)
            }} fullWidth maxWidth='xl'>
                <DialogTitle>
                    <List>
                        <ListItem>
                            {data.name}
                        </ListItem>
                        <ListItem>
                            <ListItemText style={selectedCustomer ? { marginRight: 10 } : {}}>
                                <AsyncAutoComplete<CUSTOMER_MODEL>
                                    label={`Müşderi goş (${data.name})`}
                                    getOptionsAsync={getCustomers}
                                    getOptionsLabel={option => option.name}
                                    isOptionEqualToValue={(option, value) => option._id === value._id}
                                    value={selectedCustomer}
                                    onChange={(e, value) => setSelectedCustomer(value)}
                                />
                            </ListItemText>
                            {selectedCustomer &&
                                <ListItemSecondaryAction>
                                    <IconButton onClick={handleAdd} ><AddOutlined fontSize="small" /></IconButton>
                                </ListItemSecondaryAction>}
                        </ListItem>
                    </List>
                </DialogTitle>
                <DialogContent style={{ height: '80vh' }}>
                    {open && refresh && <CustomersPage groupId={data.id} />}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClear} variant="outlined" size='small'>Arassala</Button>
                </DialogActions>
            </Dialog>
        </TableCell>
    )
}