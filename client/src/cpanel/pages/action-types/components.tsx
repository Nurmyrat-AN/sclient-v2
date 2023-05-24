import { ACTION_TYPE_MODEL, CUSTOMER_GROUP_MODEL } from "../../../types"
import { Card, IconButton, List, ListItem, ListItemSecondaryAction } from "@mui/material"

import { AsyncAutoComplete } from "../../../components/AsyncAutoComplete"
import { DeleteOutlined } from "@mui/icons-material"
import { _axios } from "../../../config/request"

export const SelectCustomerGroups = (props: { attachedGroups: CUSTOMER_GROUP_MODEL[], onChange: (attachedGroups: CUSTOMER_GROUP_MODEL[]) => void }) => {

    return (
        <ListItem>
            <Card style={{ flexGrow: 1 }}>
                <List>
                    <CustomerGroupsAutoComplete value={null} onChange={(value) => !value || props.attachedGroups.find(g => g.id === value.id) ? null : props.onChange([...props.attachedGroups, value])} />
                    <ListItem>
                        <Card style={{ flexGrow: 1, height: 350, overflow: 'auto' }}>
                            <List>
                                {props.attachedGroups.map(group => <ListItem key={group.id}>
                                    {group.name}
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => props.onChange(props.attachedGroups.filter(g => g.id !== group.id))} size='small'><DeleteOutlined fontSize="small" /></IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>)}
                            </List>
                        </Card>
                    </ListItem>
                </List>
            </Card>
        </ListItem>
    )
}

let controllerCustomerGroups = new AbortController()
export const CustomerGroupsAutoComplete = (props: { value: CUSTOMER_GROUP_MODEL | null, onChange: (v: CUSTOMER_GROUP_MODEL | null) => void }) => {
    const getCustomerGroups = async (query?: string) => {
        controllerCustomerGroups.abort()
        controllerCustomerGroups = new AbortController()
        const { data: { rows } } = await _axios.post(`/customer-groups`, { name: query, limit: 100 }, { signal: controllerCustomerGroups.signal })
        return rows
    }
    return (
        <ListItem>
            <AsyncAutoComplete<CUSTOMER_GROUP_MODEL>
                getOptionsAsync={getCustomerGroups}
                label="Toparlar"
                getOptionsLabel={option => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={props.value}
                onChange={(e, value) => props.onChange(value)}
            />
        </ListItem>
    )
}


let controllerActionTypes = new AbortController()
export const ActionTypesAutoComplete = (props: { value: ACTION_TYPE_MODEL | null, onChange: (v: ACTION_TYPE_MODEL | null) => void }) => {
    const getActionTypes = async (query?: string) => {
        controllerActionTypes.abort()
        controllerActionTypes = new AbortController()
        const { data: { rows } } = await _axios.post(`/action-types`, { name: query, limit: 100 }, { signal: controllerActionTypes.signal })
        return rows
    }

    return (
        <ListItem>
            <AsyncAutoComplete<ACTION_TYPE_MODEL>
                getOptionsAsync={getActionTypes}
                label="Hereket görnüşleri"
                getOptionsLabel={option => option.name}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={props.value}
                onChange={(e, value) => props.onChange(value)}
            />
        </ListItem>
    )
}