import { CircularProgress, Dialog, DialogContent } from "@mui/material"

import React from "react"

const Context = React.createContext<{ startLoading: () => void, endLoading: () => void }>({ endLoading: console.log, startLoading: console.log })

export const GlobalLoadingContextWrapper = (props: { children: any }) => {
    const [loading, setLoading] = React.useState<boolean>(false)
    return (
        <Context.Provider value={{
            endLoading: () => setLoading(false),
            startLoading: () => setLoading(true)
        }}>
            {props.children}
            <Dialog open={loading}>
                <DialogContent>
                    <CircularProgress size={30} />
                </DialogContent>
            </Dialog>
        </Context.Provider>
    )
}

export const useGlobalLoading = () => React.useContext(Context)