import { Menu, MenuItem } from "@mui/material"

import React from "react"

type Props = {
    options: { onClick?: (...args: any) => void, label?: string, customTitle?: any }[]
    [x: string]: any
}


export const CustomContextMenu: React.FC<Props> = ({ options, children, ...rest }) => {
    const [contextMenu, setContextMenu] = React.useState<any>(null)
    const [boxShadow, setBoxShadow] = React.useState<string | undefined>(undefined)
    const onContextMenu = (e: any) => {
        e.preventDefault()
        if (options.length === 0) return;
        setBoxShadow('0 0 4px grey')
        setContextMenu(
            contextMenu === null
                ? {
                    e,
                    mouseX: e.clientX - 2,
                    mouseY: e.clientY - 4,
                } : null)
    }
    const onClose = () => {
        setBoxShadow(undefined)
        setContextMenu(null)
    }

    return (<>
        {React.Children.map(children, (child, index) => React.isValidElement(child) ? React.cloneElement<any>(child, { ...rest, onContextMenu, style: { ...rest.style || {}, boxShadow } }) : child)}
        {contextMenu && <Menu
            open={contextMenu !== null}
            onClose={onClose}
            onContextMenu={(e) => { e.preventDefault(); onClose() }}
            onClick={onClose}
            anchorReference="anchorPosition"
            anchorPosition={
                contextMenu !== null
                    ? { top: contextMenu.mouseY, left: contextMenu.mouseX }
                    : undefined
            }
        >
            {options?.map((item, idx) => <MenuItem key={idx} onClick={item.onClick}>{item.label ? item.label : item.customTitle || null}</MenuItem>)}
        </Menu>}
    </>)
}