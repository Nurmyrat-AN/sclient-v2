import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, ListItemText } from "@mui/material";

import { EDIT_ACTION_TYPE_PROPS } from "./types";
import { Informations } from "./editActionTypeInformations";
import React from "react";
import { Triggers } from "./editActionTypeTriggers";
import { _axios } from "../../../config/request";
import { getActionType_TYPE } from "../../../components/ActionType_TYPE_AutoComplete";
import { useGlobalLoading } from "../../../context/globalloading";

export const EditActionType = (props: EDIT_ACTION_TYPE_PROPS) => {
    const { state, refresh, onClose } = props
    const [windowState, setWindowState] = React.useState<'INFORMATIONS' | 'TRIGGERS'>('INFORMATIONS')
    const { endLoading, startLoading } = useGlobalLoading()

    const handleSave = async () => {
        startLoading()
        try {
            await _axios.put('/action-types', state)
            refresh()
            onClose()
        } catch (e) { }
        endLoading()
    }

    const handleDelete = async () => {
        startLoading()
        try {
            await _axios.delete(`/action-types/${state.id}`)
            refresh()
            onClose()
        } catch (e) { }
        endLoading()
    }
    return (
        <Dialog
            open
            onClose={onClose}
        >
            <DialogTitle>
                <ListItemText primary={state.id ? state.name : 'Täze hereket görnüşi'} secondary={getActionType_TYPE(state.action_type)?.label} />
            </DialogTitle>
            <DialogContent style={{ width: 600, position: 'relative' }}>
                {state.id && <>
                    <div style={{ display: 'flex', flexGrow: 1 }}>
                        <Button onClick={() => setWindowState('INFORMATIONS')} size='small' color={windowState === 'INFORMATIONS' ? 'primary' : 'inherit'}>Esasy maglumatlar</Button>
                        <Button size='small' disabled style={{ margin: '0 5px', minWidth: 0 }}>/</Button>
                        <Button onClick={() => setWindowState('TRIGGERS')} size='small' color={windowState === 'TRIGGERS' ? 'primary' : 'inherit'}>Triggers</Button>
                    </div>
                    <Divider />
                </>}
                <div style={{ display: 'flex', overflow: 'hidden', alignItems: 'stretch' }}>
                    <div style={{ minWidth: '100%', maxWidth: '100%', transition: 'all ease-in 0.1s', marginLeft: windowState === 'INFORMATIONS' ? '0' : '-100%' }}>
                        <Informations {...props} />
                    </div>
                    <div style={{ minWidth: '100%', maxWidth: '100%', transition: 'all ease-in 0.1s', display: 'flex', flexDirection: 'column' }}>
                        <Triggers {...props} />
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button variant='contained' style={{ marginLeft: 10 }} disabled={!state.id} color='error' size='small' onClick={handleDelete}>Poz</Button>
                <Button variant='contained' style={{ marginLeft: 10 }} disabled={!state.name} size='small' onClick={handleSave}>Ýatda sakla</Button>
            </DialogActions>
        </Dialog>
    )
}

