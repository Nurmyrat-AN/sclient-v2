import { ACTION_TYPE_MODEL, EDIT_ACTION_TYPE_MODEL } from '../../../types'
import { ActionType_TYPE_AutoComplete as ActionTypeTypeAutoComplete, getActionType_TYPE } from '../../../components/ActionType_TYPE_AutoComplete'
import { AddOutlined, CheckOutlined, DeleteOutline, EditOutlined, VisibilityOffOutlined } from '@mui/icons-material'
import { Autocomplete, Button, CircularProgress, IconButton, InputAdornment, ListItemText, Table, TableBody, TableCell, TableHead, TableRow, TextField } from '@mui/material'

import { CustomTablePagination } from '../../../components/CustomTablePagination'
import { EditActionType } from './editActionType'
import { QueryListContainer } from "../../../containers/querylist.container"
import React from 'react'
import moment from 'moment'
import { useSearchParams } from 'react-router-dom'

type Filter = {
    isGlobal?: boolean
    name: string
    message: string
    action_type: ACTION_TYPE_MODEL['action_type'] | null
    limit: number
    offset: number
    hideDeleted: boolean
}

export const ActionTypesPage = () => {
    const [query] = useSearchParams()

    return (
        <QueryListContainer<ACTION_TYPE_MODEL, Filter>
            url="/action-types"
            initialFilter={{
                isGlobal: query.get('isGlobal') === 'true' ? true : query.get('isGlobal') === 'false' ? false : undefined,
                name: query.get('name') || '',
                message: query.get('message') || '',
                action_type: (query.get('action_type') || null) as Filter['action_type'],
                offset: parseInt(query.get('offset') || '0'),
                limit: parseInt(query.get('limit') || '10'),
                hideDeleted: true
            }}
            renderList={({ data: { count, rows }, error, filter, loading, refresh, setFilter }) => <Table size='small' stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <Autocomplete
                                size='small'
                                fullWidth
                                value={filter.isGlobal === undefined ? null : filter.isGlobal}
                                onChange={(e, value) => setFilter(filter => {
                                    const { isGlobal, ...rest } = filter
                                    if (value === null) {
                                        return rest
                                    } else {
                                        return {
                                            ...rest,
                                            isGlobal: value
                                        }
                                    }
                                })}
                                options={[true, false]}
                                getOptionLabel={option => option ? 'Global' : 'Local'}
                                renderInput={props => <TextField {...props} InputProps={{
                                    ...props.InputProps,
                                    startAdornment: <InputAdornment position='start'>
                                        <IconButton onClick={() => setFilter(filter => ({ ...filter, offset: 0, hideDeleted: !filter.hideDeleted }))}>
                                            <DeleteOutline color={filter.hideDeleted ? 'inherit' : 'error'} fontSize='small' />
                                        </IconButton>
                                    </InputAdornment>
                                }} />}
                            />
                        </TableCell>
                        <TableCell>
                            <TextField
                                size='small'
                                fullWidth
                                label='Ady'
                                value={filter.name}
                                onChange={e => setFilter(filter => ({ ...filter, offset: 0, name: e.target.value }))}
                            />
                        </TableCell>
                        <TableCell>
                            <ActionTypeTypeAutoComplete
                                value={filter.action_type}
                                onChange={(action_type) => setFilter(filter => ({ ...filter, offset: 0, action_type }))}
                            />
                        </TableCell>
                        <TableCell>
                            <TextField
                                size='small'
                                fullWidth
                                label='Habar'
                                value={filter.message}
                                onChange={e => setFilter(filter => ({ ...filter, offset: 0, message: e.target.value }))}
                            />
                        </TableCell>
                        <EditOrAdd refresh={refresh} />
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading && <TableRow><TableCell align="center" colSpan={6}><CircularProgress size={20} /></TableCell></TableRow>}
                    {error && <TableRow><TableCell align="center" colSpan={6}><Button onClick={refresh} size='small'>{error}</Button></TableCell></TableRow>}
                    {!error && !loading && count === 0 && <TableRow><TableCell align="center" colSpan={6}>Tapylmady!</TableCell></TableRow>}
                    {rows.map(data => <TableRow key={data.id}>
                        <TableCell>
                            <IconButton style={{ backgroundColor: data.actionColor }}>
                                <IconButton component='div' size='small' style={{ padding: 1, backgroundColor: 'white' }}>
                                    {data.isGlobal ? <CheckOutlined fontSize='small' color="success" /> : <VisibilityOffOutlined fontSize='small' />}
                                </IconButton>
                            </IconButton>
                        </TableCell>
                        <TableCell>
                            <ListItemText style={{ color: data.deletedAt ? 'red' : undefined }} primary={data.name} secondary={data.deletedAt ? moment(data.deletedAt).format('DD.MM.YYYY HH:mm:ss') : ''} />
                        </TableCell>
                        <TableCell>{getActionType_TYPE(data.action_type)?.label}</TableCell>
                        <TableCell>
                            {data.hasMessage ? <div style={{ maxWidth: 300 }} dangerouslySetInnerHTML={{ __html: data.message?.replaceAll('\n', '<br/>') }} /> : '***'}
                        </TableCell>
                        <EditOrAdd actionType={data} refresh={refresh} />
                    </TableRow>)}
                </TableBody>
                <CustomTablePagination
                    count={count}
                    page={filter.offset / filter.limit}
                    rowsPerPage={filter.limit}
                    setPage={page => setFilter(filter => ({ ...filter, offset: page * filter.limit }))}
                    setRowsPerPage={limit => setFilter(filter => ({ ...filter, limit, offset: 0 }))}
                />
            </Table >}
        />
    )
}

const EditOrAdd = (props: { actionType?: ACTION_TYPE_MODEL, refresh: () => void }) => {
    const [edit, setEdit] = React.useState<EDIT_ACTION_TYPE_MODEL | null>(null)
    return (
        <TableCell width={10}>
            <IconButton size='small' onClick={() => setEdit(props.actionType || {
                isAutomatic: false,
                action_type: 'NONE',
                actionAlertAmount: 0,
                actionColor: '#ffffff',
                hasMessage: false,
                isGlobal: false,
                isMenuOption: false,
                keyCode: 0,
                message: '',
                name: '',
                paymentTypes: [],
                transactionType: null,
                tertip: 0,
                attachedGroups: [],
                attachToAllCustomers: true
            })}>
                {props.actionType ? <EditOutlined fontSize='small' /> : <AddOutlined fontSize="small" />}
            </IconButton>
            {edit && <EditActionType
                state={edit}
                // @ts-ignore
                setState={setEdit}
                onClose={() => setEdit(null)}
                refresh={props.refresh}
            />}
        </TableCell>
    )
}
