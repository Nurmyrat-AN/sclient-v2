import { Card, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText } from "@mui/material";

import { AddOutlined } from "@mui/icons-material";
import { EDIT_ACTION_TYPE_PROPS } from "./types";

export const Triggers = (props: EDIT_ACTION_TYPE_PROPS) => {
    return (
        <List component={Card} style={{ margin: 5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
            <ListItem component={Card}>
                <ListItemText>Şertler</ListItemText>
                <ListItemSecondaryAction><IconButton><AddOutlined fontSize='small' /></IconButton></ListItemSecondaryAction>
            </ListItem>
            <ListItem style={{ flexGrow: 1, position: 'relative' }}>
                <div style={{ overflow: 'auto', position: 'absolute', top: 6, left: 0, right: 0, bottom: 0 }}>
                    <List>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                        <ListItem>Salam</ListItem>
                    </List>
                </div>
            </ListItem>
        </List>
    )
}