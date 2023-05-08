import { ACTION_TYPE_MODEL, CUSTOMER_GROUP_MODEL, CUSTOMER_MODEL } from "../../types"
import { ADD_ACTION_PROPS, AddAction } from "../../components/AddAction"
import { AppBar, Avatar, Button, Checkbox, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, InputAdornment, ListItemIcon, ListItemSecondaryAction, ListItemText, Menu, MenuItem, Table, TableBody, TableCell, TableHead, TableRow, TextField, Toolbar, Typography } from "@mui/material"
import { CalendarMonthOutlined, CheckBoxOutlineBlankOutlined, IndeterminateCheckBoxOutlined, SearchOutlined } from "@mui/icons-material"

import $ from 'jquery'
import { ActionsPage } from "./actions"
import { AishBalance } from "../../context/aishbalance"
import { AsyncAutoComplete } from "../../components/AsyncAutoComplete"
import { CustomContextMenu } from "../../components/CustomContextMenu"
import { CustomTablePagination } from "../../components/CustomTablePagination"
import { QueryListContainer } from "../../containers/querylist.container"
import React from "react"
import { _axios } from "../../config/request"
import { confirmAlert } from "react-confirm-alert"
import moment from 'moment'
import { useGlobalLoading } from "../../context/globalloading"
import { useSearchParams } from 'react-router-dom'

type Filter = {
    name: string
    barcodes: string
    percent: string
    balance: string
    enddate?: string
    offset: number
    limit: number
    groupId?: number
}
let controllerCustomerGroups = new AbortController()
export const CustomersPage = (props: { groupId?: number }) => {
    const [group, setGroup] = React.useState<CUSTOMER_GROUP_MODEL | null>(null)
    const [query] = useSearchParams()
    const [selected, setSelected] = React.useState<number[]>([])
    const [addToGroupCustomers, setAddToGroupCustomers] = React.useState<number[]>([])
    const [removeFromGroupCustomers, setRemoveFromGroupCustomers] = React.useState<number[]>([])
    const [addAction, setAddAction] = React.useState<ADD_ACTION_PROPS | null>(null)
    const getCustomerGroups = async (query?: string) => {
        controllerCustomerGroups.abort()
        controllerCustomerGroups = new AbortController()
        const { data: { rows } } = await _axios.post(`/customer-groups`, { name: query, limit: 100 }, { signal: controllerCustomerGroups.signal })
        return rows
    }

    return (
        <QueryListContainer<CUSTOMER_MODEL, Filter>
            onNewData={data => {
                if (group == null)
                    setGroup(data.extras.group)
            }}
            url='/customers'
            initialFilter={{
                name: query.get('name') || '',
                barcodes: query.get('barcodes') || '',
                percent: query.get('percent') || '',
                balance: query.get('balance') || '',
                offset: parseInt(query.get('offset') || '0'),
                limit: parseInt(query.get('limit') || '10'),
                groupId: group?.id || props.groupId || (query.get('groupId') ? parseInt(query.get('groupId') || '0') : undefined)
            }}
            dynamicFilter={{
                groupId: group?.id || props.groupId
            }}
            notSaveToUrl={Boolean(props.groupId)}
            renderList={({ data: { rows, count, extras }, filter, setFilter, loading, error, refresh }) => {
                const options: (customers: number[]) => {
                    onClick?: (...args: any) => void;
                    label?: string | undefined;
                    customTitle?: any;
                }[] = (customers) => [{
                    onClick: () => setAddAction({ customers }),
                    label: 'Hereket goş'
                }, {
                    customTitle: <div style={{ flexGrow: 1 }}><Divider /></div>
                }, {
                    onClick: () => setAddToGroupCustomers(customers),
                    label: 'Topara goş'
                }, {
                    onClick: () => setRemoveFromGroupCustomers(customers),
                    label: 'Topardan aýyr'
                }, {
                    customTitle: <div style={{ flexGrow: 1 }}><Divider /></div>
                },
                ...extras.directLinks.map((link: ACTION_TYPE_MODEL) => ({
                    onClick: () => setAddAction({ customers, actionTypeId: link.id }),
                    label: link.name
                }))
                ]
                return (
                    <>
                        <Table stickyHeader size='small'>
                            <TableHead>
                                <TableRow>
                                    <SelectionBtn refresh={refresh} options={options} selected={selected} setSelected={setSelected} filter={filter} customers={rows} />
                                    <TableCell><TextField size="small" fullWidth value={filter.name} label='Ady' onChange={e => setFilter(filter => ({ ...filter, name: e.target.value, offset: 0 }))} /></TableCell>
                                    <TableCell><TextField size="small" fullWidth value={filter.barcodes} label='Ştrihkod' onChange={e => setFilter(filter => ({ ...filter, barcodes: e.target.value, offset: 0 }))} /></TableCell>
                                    {!props.groupId && <TableCell>
                                        <AsyncAutoComplete<CUSTOMER_GROUP_MODEL>
                                            getOptionsAsync={getCustomerGroups}
                                            label="Toparlar"
                                            getOptionsLabel={option => option.name}
                                            isOptionEqualToValue={(option, value) => option.id === value.id}
                                            value={group}
                                            onChange={(e, value) => setGroup(value)}
                                        />
                                    </TableCell>}
                                    <TableCell><TextField size="small" fullWidth value={filter.percent} label='Göterim' onChange={e => setFilter(filter => ({ ...filter, percent: e.target.value, offset: 0 }))} /></TableCell>
                                    <TableCell><TextField InputProps={{
                                        endAdornment: <InputAdornment position='end'>
                                            <div style={{ position: 'relative' }}>
                                                <IconButton onClick={() => {
                                                    // @ts-ignore
                                                    $('#datePicker')[0].showPicker()
                                                }} size='small'><CalendarMonthOutlined fontSize="small" /></IconButton>
                                                <input
                                                    onChange={e => {
                                                        const date = new Date(e.target.value)
                                                        date.setMilliseconds(999)
                                                        date.setHours(23)
                                                        date.setMinutes(59)
                                                        date.setSeconds(59)
                                                        setFilter(filter => ({ ...filter, enddate: date.toJSON() }))
                                                    }}
                                                    value={moment(filter.enddate || new Date()).format('YYYY-MM-DD')}
                                                    type='date'
                                                    style={{ opacity: 0, position: 'absolute', top: 0, right: 0, maxHeight: 0, maxWidth: 0 }}
                                                    id="datePicker" />
                                            </div>
                                        </InputAdornment>
                                    }} size="small" fullWidth value={filter.balance} label={`Galyndy ${moment(filter.enddate || new Date()).format('DD.MM.YYYY')}`} onChange={e => setFilter(filter => ({ ...filter, balance: e.target.value, offset: 0 }))} /></TableCell>
                                    <TableCell className="noPrint">IşKömekçi</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {loading && <TableRow><TableCell align="center" colSpan={props.groupId ? 8 : 7}><CircularProgress size={20} /></TableCell></TableRow>}
                                {error && <TableRow><TableCell align="center" colSpan={props.groupId ? 8 : 7}><Button onClick={refresh} size='small'>{error}</Button></TableCell></TableRow>}
                                {!error && !loading && count === 0 && <TableRow><TableCell align="center" colSpan={props.groupId ? 8 : 7}>Tapylmady!</TableCell></TableRow>}
                                {rows.map(data => <ActionsOfCustomer
                                    key={data.id}
                                    customer={data}
                                    setSelected={setSelected}
                                    selected={selected}
                                    refresh={refresh}
                                    groupId={props.groupId}
                                    options={options} />)}
                            </TableBody>
                            <CustomTablePagination
                                count={count}
                                designedBalance={<TableRow>
                                    <TableCell />
                                    <TableCell />
                                    <TableCell />
                                    <TableCell />
                                    {!props.groupId && <TableCell />}
                                    <TableCell align="right"><Typography variant="body2">{`${extras?.balance || 0} TMT`}</Typography></TableCell>
                                    <TableCell />
                                </TableRow>}
                                page={filter.offset / filter.limit}
                                rowsPerPage={filter.limit}
                                setPage={page => setFilter(filter => ({ ...filter, offset: page * filter.limit }))}
                                setRowsPerPage={limit => setFilter(filter => ({ ...filter, limit, offset: 0 }))}
                            />
                        </Table>
                        <AddCustomersToGroup
                            onSave={() => {
                                if (selected.length === addToGroupCustomers.length || selected.length === removeFromGroupCustomers.length) {
                                    setSelected([])
                                }
                                refresh()
                            }}
                            addToGroupCustomers={addToGroupCustomers.length > 0 ? addToGroupCustomers : removeFromGroupCustomers}
                            onClose={() => {
                                setAddToGroupCustomers([])
                                setRemoveFromGroupCustomers([])
                            }}
                            action={addToGroupCustomers.length > 0 ? 'add' : 'remove'}
                            getCustomerGroups={getCustomerGroups} />
                        {addAction && <AddAction
                            onClose={() => setAddAction(null)}
                            onSave={() => {
                                if (selected.length === addAction?.customers.length) {
                                    setSelected([])
                                }
                                refresh()
                            }}
                            actionProps={addAction}
                        />}
                    </>
                )
            }}
        />
    )
}

const SelectionBtn = ({ selected, setSelected, customers, filter, options, refresh }: {
    options: (customers: number[]) => {
        onClick?: (...args: any) => void;
        label?: string | undefined
        customTitle?: any
    }[],
    refresh: () => void, filter: Filter, customers: CUSTOMER_MODEL[], selected: number[], setSelected: React.Dispatch<React.SetStateAction<number[]>>
}) => {
    const [anchorEl, setAnchorEl] = React.useState<any>(null)
    const [globalPercent, setGlobalPercent] = React.useState<string | null>(null)
    const [confirmState, setConfirmState] = React.useState(false)
    const { endLoading, startLoading } = useGlobalLoading()
    const customSelect: (action: 'all_by_filter' | 'all_in_list' | 'reverse_in_list' | 'reverse_by_filter' | 'clear') => Promise<void> = async (action) => {
        setAnchorEl(null)
        switch (action) {
            case 'clear':
                setSelected([])
                break
            case 'all_in_list':
                setSelected(selected => [...selected, ...customers.filter(c => !selected.includes(c.id)).map(c => c.id)])
                break
            case 'reverse_in_list':
                setSelected(selected => [...selected.filter(id => !customers.find(c => c.id === id)), ...customers.filter(c => !selected.includes(c.id)).map(c => c.id)])
                break
            case 'all_by_filter':
                startLoading()
                try {
                    const { data: ids } = await _axios.post<number[]>('/customers?ids=true', filter)
                    setSelected(selected => [...selected.filter(id => !ids.includes(id)), ...ids])
                } catch (e) {
                    console.log(e)
                }
                endLoading()
                break
            case 'reverse_by_filter':
                startLoading()
                try {
                    const { data: ids } = await _axios.post<number[]>('/customers?ids=true', filter)
                    setSelected(selected => ids.filter(id => !selected.includes(id)))
                } catch (e) {
                    console.log(e)
                }
                endLoading()
                break
        }
    }

    const handleChangeGlobalPercent = () => {
        setConfirmState(true)
        confirmAlert({
            title: 'Herekedi tassyklamak',
            message: `Bu hereketden soňra müşderileriň oňki göterimlerine getirmek automatiki mümkin däldir. Ýatda saklansynmy?`,
            buttons: [{
                label: 'Hawa',
                onClick: async () => {
                    startLoading()
                    try {
                        await _axios.put('/customers/global', { customers: selected, percent: globalPercent })
                        setSelected([])
                        setGlobalPercent(null)
                        refresh()
                    } catch (e) { }
                    setConfirmState(false)
                    endLoading()
                }
            }, {
                label: 'Ýok',
                onClick: () => setConfirmState(false)
            }],
            closeOnClickOutside: false,
            closeOnEscape: false
        })
    }

    return (
        <TableCell align='center'>
            <CustomContextMenu
                options={selected.length > 0 ? [...options(selected), {
                    customTitle: <div style={{ flexGrow: 1 }}><Divider /></div>
                }, {
                    label: 'Göterim üýtget',
                    onClick: () => setGlobalPercent('0')
                }] : []}>
                <Button
                    onClick={e => setAnchorEl(e.currentTarget)}
                    startIcon={
                        selected.length > 0 ?
                            <IndeterminateCheckBoxOutlined fontSize='small' /> :
                            <CheckBoxOutlineBlankOutlined fontSize='small' />
                    }
                    size='small'
                    style={{ minWidth: 0 }}
                    fullWidth
                    variant='contained'>
                    <Typography variant='caption' style={{ whiteSpace: 'nowrap', fontWeight: 'bold' }}>{selected.length}</Typography>
                </Button>
            </CustomContextMenu>
            {globalPercent !== null && <Dialog open onClose={() => confirmState ? null : setGlobalPercent(null)}>
                <DialogTitle>{`Saýlanan: ${selected.length}`}</DialogTitle>
                <DialogContent style={{ paddingTop: 16 }}>
                    <TextField
                        label={'Göterimleri toparlaýyn üýtget'}
                        size='small'
                        type='number'
                        autoFocus
                        value={globalPercent}
                        onChange={e => setGlobalPercent(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleChangeGlobalPercent} variant='contained' size='small' fullWidth disabled={isNaN(parseFloat(globalPercent))}>Ýatda sakla</Button>
                </DialogActions>
            </Dialog>}
            <Menu
                open={Boolean(anchorEl)}
                anchorEl={anchorEl}
                onClose={() => setAnchorEl(null)}
            >
                <MenuItem onClick={() => customSelect('all_by_filter')}>Select all by filter</MenuItem>
                <MenuItem onClick={() => customSelect('all_in_list')}>Select all in list</MenuItem>
                <MenuItem onClick={() => customSelect('reverse_in_list')}>Reverse selection in list</MenuItem>
                <MenuItem onClick={() => customSelect('reverse_by_filter')}>Reverse selection by filter</MenuItem>
                <MenuItem onClick={() => customSelect('clear')}>Clear all</MenuItem>
            </Menu>
        </TableCell>
    )
}

const EditPercent = (props: { customer: CUSTOMER_MODEL, refresh: () => void }) => {
    const [edit, setEdit] = React.useState<boolean>(false)
    const [removeEdit, setRemoveEdit] = React.useState<boolean>(false)
    const { endLoading, startLoading } = useGlobalLoading()

    React.useEffect(() => {
        if (!removeEdit) return () => { }
        const timer = setTimeout(() => {
            setEdit(false)
        }, 1000)
        return () => {
            clearTimeout(timer)
        }
    }, [removeEdit])

    const handleSave = async (percent: number) => {
        startLoading()
        try {
            await _axios.put(`/customers/${props.customer.id}`, {
                percent
            })
            props.refresh()
        } catch (e) {
        }
        endLoading()
    }

    return (
        <TableCell>
            {edit ? <TextField
                size='small'
                defaultValue={props.customer.percent.toString()}
                type="number"
                label='Goterim'
                onBlur={() => setRemoveEdit(true)}
                onFocus={() => setRemoveEdit(false)}
                autoFocus
                inputProps={{
                    step: 0.01,
                    onKeyUp: e => {
                        if (e.keyCode === 27) {
                            setEdit(false)
                        } else if (e.keyCode === 13) {
                            // @ts-ignore
                            handleSave(e.target.value)
                        }
                    },
                    style: {
                        padding: '0 4px'
                    }
                }}
            /> : <Button fullWidth size='small' onDoubleClick={() => setEdit(true)}>
                {`${props.customer.percent} %`}
            </Button>}
        </TableCell>
    )
}

const AddCustomersToGroup = ({ addToGroupCustomers, onClose, getCustomerGroups, onSave, action }: { action: 'add' | 'remove', addToGroupCustomers: number[], onClose: () => void, onSave: () => void, getCustomerGroups: (query?: string | undefined) => Promise<CUSTOMER_GROUP_MODEL[]> }) => {
    const [group, setGroup] = React.useState<CUSTOMER_GROUP_MODEL | null>(null)
    const { endLoading, startLoading } = useGlobalLoading()
    const handleSave = async () => {
        if (!group) return;
        startLoading()
        try {
            await _axios.put('/customer-groups/customers', { customerIds: addToGroupCustomers, groupId: group?.id, action })
            onSave()
            onClose()
        } catch (e) { }
        endLoading()
    }

    return (
        <Dialog
            open={addToGroupCustomers.length > 0}
            onClose={onClose}
        >
            <DialogTitle>
                {`Müşderiler: ${addToGroupCustomers.length}`}
            </DialogTitle>
            <DialogContent style={{ minWidth: 400 }}>
                <AsyncAutoComplete<CUSTOMER_GROUP_MODEL>
                    getOptionsAsync={getCustomerGroups}
                    label={`Toparlar (${action === 'add' ? 'Goşmak' : 'Aýyrmak'})`}
                    getOptionsLabel={option => option.name}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    value={group}
                    onChange={(e, value) => setGroup(value)}
                />
            </DialogContent>
            <DialogActions>
                <Button size='small' disabled={group === null} onClick={handleSave}>Ýatda sakla</Button>
            </DialogActions>
        </Dialog>
    )
}

const ActionsOfCustomer = ({ customer: data, options, setSelected, selected, refresh, groupId }: {
    customer: CUSTOMER_MODEL,
    groupId?: number
    selected: number[]
    refresh: () => void
    setSelected: React.Dispatch<React.SetStateAction<number[]>>
    options: (customers: number[]) => {
        onClick?: ((...args: any) => void) | undefined;
        label?: string | undefined;
        customTitle?: any;
    }[]
}) => {
    const [open, setOpen] = React.useState(false)
    return (
        <>
            <CustomContextMenu key={data.id} options={options([data.id])}>
                <TableRow>
                    <TableCell>
                        <Checkbox
                            onChange={() => setSelected(selected => selected.includes(data.id) ? selected.filter(id => id !== data.id) : [...selected, data.id]
                            )}
                            size='small'
                            checked={selected.includes(data.id)}
                        />
                    </TableCell>
                    <TableCell>
                        <ListItemText primary={<span style={{ whiteSpace: 'nowrap' }}>{data.name}</span>} secondary={data.phone_number} />
                    </TableCell>
                    <TableCell>
                        <div>{`[${data.barcodes.reduce((res, c) => `${res}${res ? ',' : ''} ${c}`, ``)} ]`}</div>
                    </TableCell>
                    {!groupId && <TableCell>
                        <div>{`[${data.groups.reduce((res, c) => `${res}${res ? ',' : ''} ${c.name}`, ``)} ]`}</div>
                    </TableCell>}
                    <EditPercent customer={data} refresh={refresh} />
                    <TableCell align="right">
                        <Button onClick={() => setOpen(true)} endIcon={<SearchOutlined fontSize="small" />} color="inherit">{`${data.balance} TMT`}</Button>
                    </TableCell>
                    <AishBalance id={data.id} />
                </TableRow>
            </CustomContextMenu>
            <Dialog open={open} onClose={() => setOpen(false)} fullScreen maxWidth='xl'>
                <AppBar position="sticky">
                    <Toolbar>
                        <ListItemIcon><Avatar /></ListItemIcon>
                        <ListItemText primary={data.name} secondary={data.phone_number} />
                        <ListItemSecondaryAction><b>{`${data.balance} TMT`}</b></ListItemSecondaryAction>
                    </Toolbar>
                </AppBar>
                <DialogContent style={{ height: '80vh', margin: 16, padding: 0 }}>
                    {open && <ActionsPage customerId={data.id} startdate={moment(new Date()).format('YYYY-01-01')} enddate={moment(new Date()).format('YYYY-12-31')} />}
                </DialogContent>
            </Dialog>
        </>
    )
}