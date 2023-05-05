import { Autocomplete, TextField } from "@mui/material"

import { ACTION_TYPE_MODEL } from "../types"

const options: { value: ACTION_TYPE_MODEL['action_type'], label: string }[] = [
    {
        value: 'NONE',
        label: 'Hereketsiz habar'
    }, {
        value: 'ADD',
        label: 'Möçber goş (balans köpelýär)'
    }, {
        value: 'ADD_PERCENT',
        label: 'Göterim goş (balans köpelýär)'
    }, {
        value: 'REMOVE',
        label: 'Möçber aýyr (balans azalýar)'
    }, {
        value: 'REMOVE_PERCENT',
        label: 'Göterim aýyr (balans azalýar)'
    }
]

export const getActionType_TYPE = (value: ACTION_TYPE_MODEL['action_type'] | null) => value ? options.find(o => o.value === value) : null

export const ActionType_TYPE_AutoComplete = ({ value, onChange, disabled }: { disabled?: boolean, value: ACTION_TYPE_MODEL['action_type'] | null, onChange: (type: ACTION_TYPE_MODEL['action_type'] | null) => void }) => {
    return (
        <Autocomplete
            options={options}
            getOptionLabel={o => o.label}
            value={getActionType_TYPE(value)}
            onChange={(e, v) => onChange(v?.value || null)}
            fullWidth
            size='small'
            disabled={disabled}
            renderInput={pr => <TextField {...pr} label='Herekediň görnüşi' />}
        />
    )
}