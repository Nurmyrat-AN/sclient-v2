import { Avatar, Button, CircularProgress, IconButton, List, ListItem, ListItemIcon, ListItemSecondaryAction, ListItemText, Table, TableBody, TableCell, TableHead, TableRow, TextField, Tooltip, Zoom } from "@mui/material"
import { useNavigate, useSearchParams } from "react-router-dom"

import { ACTION_TYPE_MODEL } from "../../types"
import { CustomTablePagination } from "../../components/CustomTablePagination"
import { DateCell } from "../../components/DateCell"
import { QueryListContainer } from "../../containers/querylist.container"
import { SearchOutlined } from "@mui/icons-material"
import moment from "moment"
import React from "react"

type DATA_TYPE = ACTION_TYPE_MODEL & {
    count: number
    sumBalance: number
    sumAmount: number
    grouppedActions: {
        owner: string,
        count: number,
        sumBalance: number,
        sumAmount: number
    }[]
}

type FILTER_TYPE = {
    name: string
    offset: number
    limit: number
    startdate?: string
    enddate?: string
}

export const ReportsPage = () => {
    const [query] = useSearchParams()
    return (
        <QueryListContainer<DATA_TYPE, FILTER_TYPE>
            initialFilter={{
                name: query.get('name') || '',
                offset: parseInt(query.get('offset') || '0'),
                limit: parseInt(query.get('limit') || '10'),
                startdate: query.get('startdate') || moment(new Date()).format('YYYY-MM-DD'),
                enddate: query.get('enddate') || moment(new Date()).format('YYYY-MM-DD'),
            }}
            url="/actions/reports"
            renderList={({ data: { count, rows }, error, filter, loading, refresh, setFilter }) => <Table size='small' stickyHeader>
                <TableHead>
                    <TableCell width={'100%'} colSpan={2}><TextField size="small" fullWidth value={filter.name} label='Ady' onChange={e => setFilter(filter => ({ ...filter, name: e.target.value, offset: 0 }))} /></TableCell>
                    <DateCell colSpan={3} query={filter} onChange={({ date1, date2 }) => setFilter(filter => ({ ...filter, startdate: date1, enddate: date2, offset: 0 }))} />
                </TableHead>
                <TableBody>
                    {loading && <TableRow><TableCell align="center" colSpan={5}><CircularProgress size={20} /></TableCell></TableRow>}
                    {error && <TableRow><TableCell align="center" colSpan={5}><Button onClick={refresh} size='small'>{error}</Button></TableCell></TableRow>}
                    {!error && !loading && count === 0 && <TableRow><TableCell align="center" colSpan={5}>Tapylmady!</TableCell></TableRow>}
                    {rows.map(data => <ReportItem key={data.id} data={data} filter={filter} />)}
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

const ReportItem = ({ data, filter }: { data: DATA_TYPE, filter: FILTER_TYPE }) => {
    const [openTooltip, setOpenToolTip] = React.useState(false)
    const navigate = useNavigate()
    return (
        <Tooltip open={openTooltip} onClose={() => setOpenToolTip(false)} followCursor TransitionComponent={Zoom} TransitionProps={{ timeout: 600 }} title={<List style={{ padding: 0 }}>
            {data.grouppedActions.map(gAction => <ListItem key={gAction.owner}>
                <ListItemIcon>
                    <Avatar>{gAction.count || 0}</Avatar>
                </ListItemIcon>
                <ListItemText primary={gAction.owner} secondary={`${gAction.sumAmount || 0} TMT`} />
                <ListItemSecondaryAction>
                    {`${gAction.sumBalance || 0} TMT`}
                </ListItemSecondaryAction>
            </ListItem>)}
        </List>}>
            <TableRow onClick={() => setOpenToolTip(!openTooltip)}>
                <TableCell width={10}><IconButton onClick={() => navigate(`/cpanel/actions?actionTypeId=${data.id}&startdate=${filter.startdate}&enddate=${filter.enddate}`)}><SearchOutlined fontSize="small" /></IconButton></TableCell>
                <TableCell width={'100%'}>{data.name}</TableCell>
                <TableCell width={10} align="right" style={{ whiteSpace: 'nowrap' }}>{`${data.count || '0.00'} sany`}</TableCell>
                <TableCell width={10} align="right" style={{ whiteSpace: 'nowrap' }}>{`${data.sumAmount || '0.00'} TMT`}</TableCell>
                <TableCell width={10} align="right" style={{ whiteSpace: 'nowrap' }}>{`${data.sumBalance || '0.00'} TMT`}</TableCell>
            </TableRow>
        </Tooltip>
    )
}