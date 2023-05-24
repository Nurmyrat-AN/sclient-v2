import { TableCell, TableFooter, TablePagination, TableRow } from "@mui/material"

export const CustomTablePagination = ({ count, page, rowsPerPage, setPage, setRowsPerPage, colSpan, designedBalance }: {
    count: number
    page: number
    rowsPerPage: number
    setPage: (page: number) => void
    setRowsPerPage: (page: number) => void
    colSpan?: number
    designedBalance?: React.ReactElement
}) => {
    return (
        <TableFooter style={{ position: 'sticky', bottom: 0, backgroundColor: 'white', height: '100%' }}>
            <TableRow style={{ height: '100%' }} />
            {designedBalance}
            <TableRow>
                <TableCell colSpan={colSpan || 8}>
                    <TablePagination
                        count={count}
                        page={page * rowsPerPage > count ? 0 : page}
                        rowsPerPage={rowsPerPage}
                        labelRowsPerPage={'Bir sahypadaky sany'}
                        component={'div'}
                        onPageChange={(e, page) => setPage(page >= 0 ? page : 0)}
                        onRowsPerPageChange={e => setRowsPerPage(parseInt(e.target.value))}
                    />
                </TableCell>
            </TableRow>
        </TableFooter>
    )
}