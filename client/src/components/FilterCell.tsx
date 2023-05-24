import { TableCell, TextField, TextFieldProps } from "@mui/material"

import { QUERY_TYPE } from "../types"

export const FilterCell = <T extends { [x: string]: any }>({ label, name, query, width, textFieldProps }: { textFieldProps?: TextFieldProps, width?: number, name: keyof QUERY_TYPE<T>, label: string, query: URLSearchParams }) => {

    return (
        <TableCell width={width}>
            <TextField
                {...textFieldProps || {}}
                size='small'
                fullWidth
                defaultValue={query.get(name.toString()) || ''}
                name={name.toString()}
                label={label}
            />
        </TableCell>
    )

}