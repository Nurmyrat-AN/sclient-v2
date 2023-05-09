import { Button, FormControlLabel, InputAdornment, List, ListItem, Switch, TextField } from "@mui/material";

import { ActionType_TYPE_AutoComplete as ActionTypeTypeAutoComplete } from "../../../components/ActionType_TYPE_AutoComplete";
import { EDIT_ACTION_TYPE_PROPS } from "./types";
import React from "react";

export const Informations = (props: EDIT_ACTION_TYPE_PROPS) => {
    const { state, setState } = props
    return (
        <List>
            <ListItem>
                <TextField
                    size='small'
                    fullWidth
                    label='Ady'
                    InputProps={{
                        endAdornment: <InputAdornment position='end'>
                            <input
                                style={{ border: 'none' }}
                                type='color'
                                value={state.actionColor}
                                onChange={e => setState(state => ({ ...state, actionColor: e.target.value }))} />
                        </InputAdornment>
                    }}
                    value={state.name}
                    onChange={e => setState(state => ({ ...state, name: e.target.value }))}
                />
            </ListItem>
            <ListItem>
                <TextField
                    size='small'
                    fullWidth
                    label='KeyCode'
                    value={String.fromCharCode(state.keyCode)}
                    onKeyUp={e => setState(state => ({ ...state, keyCode: e.keyCode }))} />
            </ListItem>
            <ListItem>
                <TextField
                    size='small'
                    fullWidth
                    label='Habar bermeli iň uly möçber (Şu möçberden uly bolsa duýduryş çykýar)'
                    value={state.actionAlertAmount}
                    type='number'
                    onChange={e => setState(state => ({ ...state, actionAlertAmount: +e.target.value }))}
                />
            </ListItem>
            <ListItem>
                <TextField
                    size='small'
                    fullWidth
                    label='Tertip belgi'
                    value={state.tertip}
                    type='number'
                    onChange={e => setState(state => ({ ...state, tertip: +e.target.value }))}
                />
            </ListItem>
            {!state.id && <ListItem>
                <ActionTypeTypeAutoComplete
                    value={state.action_type}
                    onChange={action_type => setState(state => ({ ...state, action_type: action_type || 'NONE' }))}
                />
            </ListItem>}
            <ListItem>
                <FormControlLabel style={{ flexGrow: 1 }} label='Global (kassalarda hereket edilip biliner)' control={<Switch checked={state.isGlobal} onChange={() => setState(state => ({ ...state, isGlobal: !state.isGlobal }))} />} />
            </ListItem>
            <ListItem>
                <FormControlLabel style={{ flexGrow: 1 }} label='Direct menus (Müşdera hereket gosuljak wagty menýuda cykýar)' control={<Switch checked={state.isMenuOption} onChange={() => setState(state => ({ ...state, isMenuOption: !state.isMenuOption }))} />} />
            </ListItem>
            <ListItem>
                <FormControlLabel style={{ flexGrow: 1 }} label='Herekediň sms habar bar' control={<Switch checked={state.hasMessage} onChange={() => setState(state => ({ ...state, hasMessage: !state.hasMessage }))} />} />
            </ListItem>
            {state.hasMessage && <EditMessage
                message={state.message}
                setMessage={message => setState(state => ({ ...state, message }))}
            />}
        </List>
    )
}

type MESSAGE_PATTERNS_TYPE = '{date}' | '{client}' | '{balance}' | '{amount}' | '{res}' | '{aish_balance}' | '{note}' | '{code}' | '{total_sum_before_discount}'
const EditMessage = ({ message, setMessage }: { message: string, setMessage: (message: string) => void }) => {
    const [selectionIndex, setSelectionIndex] = React.useState(message.length)

    const handleAddPattern = (pattern: MESSAGE_PATTERNS_TYPE) => {
        setMessage(`${message.slice(0, selectionIndex)}${pattern}${message.slice(selectionIndex)}`)
        setSelectionIndex(idx => idx + pattern.length)
    }

    return (
        <>
            <ListItem>
                <TextField
                    size='small'
                    fullWidth
                    label='Herekediň sms ýazgysy'
                    multiline
                    rows={5}
                    value={message}
                    onChange={e => setMessage(e.target.value)}
                    InputProps={{
                        rows: 5,
                        onBlur: e => setSelectionIndex(e.target.selectionStart || message.length)
                    }}
                />
            </ListItem>
            <ListItem style={{ alignItems: 'stretch', justifyContent: 'start', paddingTop: 0, marginTop: 0, flexWrap: 'wrap' }}>
                <Button onClick={() => handleAddPattern(`{date}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Sene</Button>
                <Button onClick={() => handleAddPattern(`{client}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Müşderi</Button>
                <Button onClick={() => handleAddPattern(`{balance}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Galyndy</Button>
                <Button onClick={() => handleAddPattern(`{amount}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Möçber</Button>
                <Button onClick={() => handleAddPattern(`{res}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Netije</Button>
                <Button onClick={() => handleAddPattern(`{aish_balance}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Aish Balance</Button>
                <Button onClick={() => handleAddPattern(`{note}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Bellik</Button>
                <Button onClick={() => handleAddPattern(`{code}`)} size='small' style={{ zoom: 0.9, margin: 2, lineHeight: 1, opacity: 0.5 }} color='inherit' variant='outlined'>Faktura kody</Button>
            </ListItem>
        </>
    )
}