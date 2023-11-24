import { ACTION_MODEL, ACTION_TYPE_MODEL } from '../../types'
import { AccessTimeOutlined, CheckOutlined, DeleteOutline } from '@mui/icons-material'
import { Autocomplete, Avatar, Button, CircularProgress, IconButton, List, ListItem, ListItemIcon, ListItemText, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Typography, Zoom } from "@mui/material"

import { CustomContextMenu } from "../../components/CustomContextMenu"
import { CustomTablePagination } from "../../components/CustomTablePagination"
import { DateCell } from '../../components/DateCell'
import { QueryListContainer } from "../../containers/querylist.container"
import React from 'react'
import { _axios } from '../../config/request'
import moment from "moment"
import { useGlobalLoading } from '../../context/globalloading'
import { useSearchParams } from "react-router-dom"

type Filter = {
    customer: string
    owner: string
    note: string
    amount: string
    res: string
    percent: string
    balance: string
    aish_balance: string
    actionTypeId?: string
    startdate?: string
    enddate?: string
    offset: number
    limit: number
    isSent: string
    customerId?: number
    hideDeleted: boolean
}
export const ActionsPage = (props: {
    customerId?: number
    startdate?: string
    enddate?: string
}) => {
    const [actionType, setActionType] = React.useState<ACTION_TYPE_MODEL | null>(null)
    const [query] = useSearchParams()
    return (
        <QueryListContainer<ACTION_MODEL, Filter>
            onNewData={data => {
                if (actionType == null)
                    setActionType(data.extras.actionType)
            }}
            initialFilter={{
                customer: query.get('customer') || '',
                isSent: query.get('isSent') || 'undefined',
                owner: query.get('owner') || '',
                note: query.get('note') || '',
                amount: query.get('amount') || '',
                res: query.get('res') || '',
                percent: query.get('percent') || '',
                balance: query.get('balance') || '',
                aish_balance: query.get('aish_balance') || '',
                actionTypeId: query.get('actionTypeId') || undefined,
                startdate: query.get('startdate') || props.startdate || moment(new Date()).format('YYYY-MM-DD'),
                enddate: query.get('enddate') || props.enddate || moment(new Date()).format('YYYY-MM-DD'),
                offset: parseInt(query.get('offset') || '0'),
                limit: parseInt(query.get('limit') || '10'),
                customerId: props.customerId,
                hideDeleted: true
            }}
            dynamicFilter={{
                customerId: props.customerId
            }}
            notSaveToUrl={Boolean(props.customerId)}
            url="/actions"
            renderList={({ data: { count, rows, extras }, error, filter, loading, refresh, setFilter }) => <Table size='small' stickyHeader>
                <TableHead>
                    <TableRow>
                        <TableCell>
                            <div style={{ display: 'flex', alignItems: 'center' }}>
                                <IconButton onClick={() => setFilter(filter => ({ ...filter, offset: 0, hideDeleted: !filter.hideDeleted }))}>
                                    <DeleteOutline color={filter.hideDeleted ? 'inherit' : 'error'} fontSize='small' />
                                </IconButton>
                                <div className='MuiButtonBase-root MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium MuiButton-root MuiButton-text MuiButton-textPrimary MuiButton-sizeMedium MuiButton-textSizeMedium css-1e6y48t-MuiButtonBase-root-MuiButton-root' onClick={() => setFilter(filter => ({
                                    ...filter,
                                    isSent: filter.isSent === 'false' ? 'undefined' : filter.isSent === 'undefined' ? 'undefined' : 'false',
                                    offset: 0
                                }))} style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
                                    <Typography variant='caption'>Habar</Typography>
                                    <div style={{ display: 'flex', alignItems: 'center', width: 40, borderRadius: 50, border: '1px solid grey', padding: 1 }}>
                                        <Button onClick={(e: any) => { e.stopPropagation(); setFilter(filter => ({ ...filter, isSent: 'false', offset: 0 })) }} style={{ opacity: filter.isSent === 'false' ? 1 : 0.2, minWidth: 0, padding: 6, background: 'red', boxSizing: 'content-box', borderRadius: '50px 0 0 50px' }}></Button>
                                        <Button onClick={(e: any) => { e.stopPropagation(); setFilter(filter => ({ ...filter, isSent: 'undefined', offset: 0 })) }} style={{ opacity: filter.isSent === 'undefined' || !filter.isSent ? 1 : 0.2, minWidth: 0, padding: 6, background: 'grey', boxSizing: 'content-box', borderRadius: 0 }}></Button>
                                        <Button onClick={(e: any) => { e.stopPropagation(); setFilter(filter => ({ ...filter, isSent: 'true', offset: 0 })) }} style={{ opacity: filter.isSent === 'true' ? 1 : 0.2, minWidth: 0, padding: 6, background: 'green', boxSizing: 'content-box', borderRadius: '0 50px 50px 0' }}></Button>
                                    </div>
                                </div>
                            </div>
                        </TableCell>
                        <TableCell><TextField size="small" fullWidth value={filter.customer} label='Ady' onChange={e => setFilter(filter => ({ ...filter, customer: e.target.value, offset: 0 }))} /></TableCell>
                        <TableCell>
                            <Autocomplete
                                fullWidth
                                getOptionLabel={o => o.name}
                                value={actionType}
                                onChange={(e, v) => {
                                    setActionType(v)
                                    setFilter(filter => ({ ...filter, actionTypeId: v?.id ? v.id.toString() : undefined, offset: 0 }))
                                }}
                                size='small'
                                options={extras?.actionTypes || []}
                                renderInput={pr => <TextField {...pr} label='Hereket görnüşi' />}
                            />
                        </TableCell>
                        <DateCell query={filter} onChange={({ date1, date2 }) => setFilter(filter => ({ ...filter, startdate: date1, enddate: date2, offset: 0 }))} />
                        <TableCell><TextField size="small" fullWidth value={filter.amount} label='Möçber' onChange={e => setFilter(filter => ({ ...filter, amount: e.target.value, offset: 0 }))} /></TableCell>
                        <TableCell><TextField size="small" fullWidth value={filter.res} label='Hasaplanan' onChange={e => setFilter(filter => ({ ...filter, res: e.target.value, offset: 0 }))} /></TableCell>
                        <TableCell><TextField size="small" fullWidth value={filter.percent} label='Göterim' onChange={e => setFilter(filter => ({ ...filter, percent: e.target.value, offset: 0 }))} /></TableCell>
                        <TableCell><TextField size="small" fullWidth value={filter.balance} label='Galyndy' onChange={e => setFilter(filter => ({ ...filter, balance: e.target.value, offset: 0 }))} /></TableCell>
                        <TableCell><TextField size="small" fullWidth value={filter.aish_balance} label='Aish balance' onChange={e => setFilter(filter => ({ ...filter, aish_balance: e.target.value, offset: 0 }))} /></TableCell>
                        <TableCell><TextField size="small" fullWidth value={filter.note} label='Bellik' onChange={e => setFilter(filter => ({ ...filter, note: e.target.value, offset: 0 }))} /></TableCell>
                        <TableCell><TextField size="small" fullWidth value={filter.owner} label='Ýerine ýetiren' onChange={e => setFilter(filter => ({ ...filter, owner: e.target.value, offset: 0 }))} /></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {loading && <TableRow><TableCell align="center" colSpan={11}><CircularProgress size={20} /></TableCell></TableRow>}
                    {error && <TableRow><TableCell align="center" colSpan={11}><Button onClick={refresh} size='small'>{error}</Button></TableCell></TableRow>}
                    {!error && !loading && count === 0 && <TableRow><TableCell align="center" colSpan={11}>Tapylmady!</TableCell></TableRow>}
                    {rows.map(data => <ActionItem key={data.id} action={data} extras={extras} refresh={refresh} />)}
                </TableBody>
                <CustomTablePagination
                    colSpan={11}
                    count={count}
                    designedBalance={<TableRow>
                        <TableCell />
                        <TableCell />
                        <TableCell />
                        <TableCell />
                        <TableCell align="right"><Typography variant="body2">{`${extras?.amountSum || 0} TMT`}</Typography></TableCell>
                        <TableCell align="right"><Typography variant="body2">{`${extras?.resSum || 0} TMT`}</Typography></TableCell>
                        <TableCell />
                        <TableCell />
                        <TableCell align="right"><Typography variant="body2">{`${extras?.aishSum || 0} TMT`}</Typography></TableCell>
                        <TableCell />
                        <TableCell />
                    </TableRow>}
                    page={filter.offset / filter.limit}
                    rowsPerPage={filter.limit}
                    setPage={page => setFilter(filter => ({ ...filter, offset: page * filter.limit }))}
                    setRowsPerPage={limit => setFilter(filter => ({ ...filter, limit, offset: 0 }))}
                />
            </Table>}
        />
    )
}

const ActionItem = ({ action: data, extras, refresh }: { action: ACTION_MODEL, extras: any, refresh: () => void }) => {
    const [openTooltip, setOpenToolTip] = React.useState(false)
    const { endLoading, startLoading } = useGlobalLoading()
    const handleDelete = async (id: number) => {
        startLoading()
        try {
            const note = window.prompt('Herekedi pozmaklygyň sebäbi')
            if (!note) throw new Error('Access denied!')
            await _axios.put(`/actions/delete`, { id, note })
            refresh()
        } catch (e) { }
        endLoading()
    }
    return (
        <CustomContextMenu
            key={data.id}
            options={[{
                label: 'Poz',
                onClick: () => handleDelete(data.id)
            }]}>
            <Tooltip open={openTooltip} onClose={() => setOpenToolTip(false)} followCursor TransitionComponent={Zoom} TransitionProps={{ timeout: 600 }} title={<List style={{ padding: 0 }} >
                <ListItem>
                    <ListItemIcon>
                        <Avatar style={{ backgroundColor: 'white', height: 32, width: 32 }}>
                            {data.messageId || !data.hasMessage ? <CheckOutlined fontSize='small' color="success" /> : <AccessTimeOutlined color="error" fontSize="small" />}
                        </Avatar>
                    </ListItemIcon>
                    <ListItemText><Typography variant='caption'>{data.message?.message || data.actionType.message || '***'}</Typography></ListItemText>
                </ListItem>
            </List>}>
                <TableRow onClick={() => setOpenToolTip(!openTooltip)}>
                    <TableCell align='center'>{data.messageId || !data.hasMessage ? <CheckOutlined fontSize='small' color="success" /> : <AccessTimeOutlined color="error" fontSize="small" />}</TableCell>
                    <TableCell><ListItemText style={{ color: data.deletedAt ? 'red' : undefined }} primary={data.customer.name} secondary={data.customer.phone_number} /></TableCell>
                    <TableCell style={{ color: data.actionType.actionColor, textShadow: '1px 1px 4px gray' }}>{data.actionType.name}</TableCell>
                    <TableCell align='center'>
                        {data.deletedAt ? <ListItemText style={{ color: 'red' }} secondary={moment(data.createdAt).format('DD.MM.YYYY HH:mm:ss')} primary={`DeletedAt: ${moment(data.deletedAt).format('DD.MM.YYYY HH:mm:ss')}`} />
                            : moment(data.createdAt).format('DD.MM.YYYY HH:mm:ss')}
                    </TableCell>
                    <TableCell align='right'>{`${data.amount} TMT`}</TableCell>
                    <TableCell align='right'>{`${data.res} TMT`}</TableCell>
                    <TableCell align='right'>{`${data.percent} %`}</TableCell>
                    <TableCell align='right'>{`${data.balance} TMT`}</TableCell>
                    <TableCell align='right'>{`${data.aish_balance || '???'} ${extras.mainCurrency || 'TMT'}`}</TableCell>
                    <TableCell align='right'>{`${data.note || ''}`}</TableCell>
                    <TableCell align='right'>{`${data.owner}`}</TableCell>
                </TableRow>
            </Tooltip>
        </CustomContextMenu>
    )
}
