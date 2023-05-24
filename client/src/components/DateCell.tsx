import { DateContainer, today1, today2 } from "./DateContainer"
import { TableCell, TextField, Typography } from "@mui/material"

import React from "react"

export const DateCell = ({ query, homePage, colSpan = 1, onChange }: { query: any, homePage?: boolean, colSpan?: number, onChange?: (props: { date1: string, date2: string }) => void }) => {
    const startDateRef = React.useRef<HTMLInputElement>() as React.RefObject<HTMLInputElement>
    const endDateRef = React.useRef<HTMLInputElement>() as React.RefObject<HTMLInputElement>
    const handleChange = () => {
        if (!startDateRef?.current?.value || !endDateRef?.current?.value) return;
        onChange?.({ date1: startDateRef?.current?.value, date2: endDateRef?.current?.value })
    }
    return (
        <DateContainer onChange={({ date1, date2 }) => {
            if (startDateRef.current) startDateRef.current.value = date1
            if (endDateRef.current) endDateRef.current.value = date2
            onChange?.({ date1, date2 })
        }}>
            <TableCell colSpan={colSpan} align='center'>
                <div style={{ display: 'flex', whiteSpace: 'nowrap', alignItems: 'center', justifyContent: 'center' }}>
                    <TextField onChange={handleChange} style={{ width: 140 }} size='small' inputRef={startDateRef} defaultValue={homePage ? undefined : query.startdate || today1} name='startdate' type='date' />
                    <Typography variant='button' style={{ margin: '0 4px' }}>-</Typography>
                    <TextField onChange={handleChange} style={{ width: 140 }} size='small' inputRef={endDateRef} defaultValue={homePage ? undefined : query.enddate || today2} name='enddate' type='date' />
                </div>
            </TableCell>
        </DateContainer>

    )
}
