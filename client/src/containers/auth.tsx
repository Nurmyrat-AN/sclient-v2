import { Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material"

import React from "react"
import { _axios } from "../config/request"

type AUTH_TYPE = { pc_name?: string, isAdmin?: boolean, hasAccessToApp?: boolean }

const Context = React.createContext<{ auth: AUTH_TYPE, refresh: () => void }>({ auth: {}, refresh: console.log })

export const AuthContainer = ({ children }: { children: any }) => {
    const [loadingStatus, setLoadingStatus] = React.useState<{ loading: boolean, error?: string }>({ loading: true })
    const [auth, setAuth] = React.useState<AUTH_TYPE>({})
    const [retry, setRetry] = React.useState(false)
    React.useEffect(() => {
        const controller = new AbortController()
        setLoadingStatus({ loading: true })
        const timer = setTimeout(async () => {
            try {
                const { data } = await _axios.get<AUTH_TYPE>('/devices/verify', { signal: controller.signal })
                setAuth(data)
                setLoadingStatus({ loading: false })
            } catch (e: any) {
                setLoadingStatus({ loading: false, error: e.message })
            }
        }, 300)
        return () => {
            clearTimeout(timer)
            controller.abort()
        }
    }, [retry])

    const loadingComponent = <Dialog open><DialogContent><CircularProgress /></DialogContent></Dialog>
    const errorComponent = <Dialog open><DialogContent><Button onClick={() => setRetry(!retry)} color='error'>{loadingStatus.error}</Button></DialogContent></Dialog>
    return loadingStatus.loading ?
        loadingComponent
        : loadingStatus.error ? errorComponent
            : !auth.hasAccessToApp ? <EditPasswordForApp refresh={() => setRetry(!retry)} />
                : !auth.pc_name ? <EditPcName refresh={() => setRetry(!retry)} />
                    : <Context.Provider value={{
                        auth,
                        refresh: () => setRetry(!retry)
                    }}>{children}</Context.Provider>
}

const EditPcName = (props: { refresh: () => void }) => {
    const [pc, setPc] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const handleSave = async () => {
        if (loading || !pc) return;
        setLoading(true)
        try {
            await _axios.put('/devices/cookies', { _key: 'pc_name', _value: pc })
            props.refresh()
        } catch (e) {
            setLoading(false)
        }
    }
    return (
        <Dialog open>
            <DialogTitle>Device Name</DialogTitle>
            <DialogContent style={{ paddingTop: 16 }}>
                <TextField
                    disabled={loading}
                    size='small'
                    label='Device name'
                    autoFocus
                    value={pc}
                    onChange={e => setPc(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSave} disabled={loading} size='small'>Ýatda sakla</Button>
            </DialogActions>
        </Dialog>
    )
}


export const EditPassword = (props: { refresh: () => void, onClose?: () => void }) => {
    const [pc, setPc] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const handleSave = async () => {
        if (loading || !pc) return;
        setLoading(true)
        try {
            await _axios.put('/devices/cookies', { _key: 'device-app-key', _value: pc })
            props.refresh()
        } catch (e) {
            setLoading(false)
        }
    }
    return (
        <Dialog open onClose={props.onClose}>
            <DialogTitle>Gizlin kod</DialogTitle>
            <DialogContent style={{ paddingTop: 16 }}>
                <TextField
                    disabled={loading}
                    size='small'
                    label='Gizlin kod'
                    autoFocus
                    type='password'
                    value={pc}
                    onChange={e => setPc(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSave} disabled={loading} size='small'>Ulgama gir</Button>
            </DialogActions>
        </Dialog>
    )
}


const EditPasswordForApp = (props: { refresh: () => void, onClose?: () => void }) => {
    const [pc, setPc] = React.useState('')
    const [loading, setLoading] = React.useState(false)
    const handleSave = async () => {
        if (loading || !pc) return;
        setLoading(true)
        try {
            await _axios.put('/devices/cookies', { _key: 'main-app-key', _value: pc })
            props.refresh()
        } catch (e) {
            setLoading(false)
        }
    }
    return (
        <Dialog open onClose={props.onClose}>
            <DialogTitle>Giriş gizlin kodyňyz</DialogTitle>
            <DialogContent style={{ paddingTop: 16 }}>
                <TextField
                    disabled={loading}
                    size='small'
                    label='Giriş gizlin kodyňyz'
                    autoFocus
                    type='password'
                    value={pc}
                    onChange={e => setPc(e.target.value)}
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleSave} disabled={loading} size='small'>Ulgama gir</Button>
            </DialogActions>
        </Dialog>
    )
}

export const useAuthentification = () => React.useContext(Context)