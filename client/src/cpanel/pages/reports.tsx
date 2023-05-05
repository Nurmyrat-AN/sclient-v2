import { Button, CircularProgress, IconButton, Table, TableBody, TableCell, TableHead, TableRow, TextField } from "@mui/material"
import { useNavigate, useSearchParams } from "react-router-dom"

import { ACTION_TYPE_MODEL } from "../../types"
import { CustomTablePagination } from "../../components/CustomTablePagination"
import { DateCell } from "../../components/DateCell"
import { QueryListContainer } from "../../containers/querylist.container"
import { SearchOutlined } from "@mui/icons-material"
import moment from "moment"

export const ReportsPage = () => {
    const [query] = useSearchParams()
    const navigate = useNavigate()
    return (
        <QueryListContainer<ACTION_TYPE_MODEL & {
            count: number
            sumBalance: number
            sumAmount: number
        }, {
            name: string
            offset: number
            limit: number
            startdate?: string
            enddate?: string
        }>
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
                    {rows.map(data => <TableRow key={data.id}>
                        <TableCell width={10}><IconButton onClick={() => navigate(`/cpanel/actions?actionTypeId=${data.id}&startdate=${filter.startdate}&enddate=${filter.enddate}`)}><SearchOutlined fontSize="small" /></IconButton></TableCell>
                        <TableCell width={'100%'}>{data.name}</TableCell>
                        <TableCell width={10} align="right" style={{ whiteSpace: 'nowrap' }}>{`${data.count || '0.00'} sany`}</TableCell>
                        <TableCell width={10} align="right" style={{ whiteSpace: 'nowrap' }}>{`${data.sumAmount || '0.00'} TMT`}</TableCell>
                        <TableCell width={10} align="right" style={{ whiteSpace: 'nowrap' }}>{`${data.sumBalance || '0.00'} TMT`}</TableCell>
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