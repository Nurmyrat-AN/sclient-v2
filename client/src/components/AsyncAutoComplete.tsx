import { Autocomplete, AutocompleteRenderInputParams, TextField, TextFieldProps } from "@mui/material"

import React from "react"

export const AsyncAutoComplete = <T = any>({ getOptionsAsync, label, textFieldProps, ...props }: {
    label?: string
    initialOptions?: T[]
    getOptionsAsync: (query?: string) => Promise<T[]>
    getOptionsLabel?: (option: T) => string
    isOptionEqualToValue?: (option: T, value: T) => boolean;
    textFieldProps?: TextFieldProps | ((pr: AutocompleteRenderInputParams) => TextFieldProps)
    value?: any
    onChange?: (event: React.SyntheticEvent, value: T | null) => void
}) => {
    const [options, setOptions] = React.useState<T[]>(props.initialOptions || [])
    const [open, setOpen] = React.useState(false)
    const [loading, setLoading] = React.useState(false)
    const [inputValue, setInputValue] = React.useState('')
    React.useEffect(() => {
        if (open) {
            setLoading(true)
            const timer = setTimeout(async () => {
                try {
                    const result = await getOptionsAsync(inputValue)
                    setOptions(result)
                } catch (e) { }
                setLoading(false)
            }, 200)
            return () => {
                clearTimeout(timer)
            }
        }
    }, [open, inputValue, getOptionsAsync])

    return (
        <Autocomplete
            options={options}
            fullWidth
            open={open}
            onOpen={() => {
                setOpen(true);
            }}
            onClose={() => {
                setOpen(false);
            }}
            loading={loading}
            isOptionEqualToValue={props.isOptionEqualToValue}
            size="small"
            value={props.value}
            onChange={props.onChange}
            onInputChange={(e, value) => setInputValue(value)}
            getOptionLabel={props.getOptionsLabel}
            renderInput={pr => <TextField
                {...(typeof textFieldProps === 'function' ? textFieldProps(pr) : { ...textFieldProps || {}, ...pr })}
                label={label}
            />}
        />
    )
}