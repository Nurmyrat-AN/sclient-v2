import { DeleteOutline } from "@mui/icons-material";
import { Card, CircularProgress, IconButton, List, ListItem, ListItemSecondaryAction, ListItemText } from "@mui/material";
import { PRODUCT_MODEL } from "../../../types";

import { EDIT_ACTION_TYPE_PROPS } from "./types";
import { QueryListContainer } from "../../../containers/querylist.container";
import { _axios } from "../../../config/request";
import { AsyncAutoComplete } from "../../../components/AsyncAutoComplete";
import { useGlobalLoading } from "../../../context/globalloading";


let controllerProducts = new AbortController()
export const ExceptedProducts = (props: EDIT_ACTION_TYPE_PROPS) => {
    const { endLoading, startLoading } = useGlobalLoading()
    const id = props.state.id
    if (!id) return null;

    const getProducts: (query?: string) => Promise<any[]> = async query => {
        controllerProducts.abort()
        controllerProducts = new AbortController()
        const { data: { rows } } = await _axios.post(`/products?limit=20`, { name: query, limit: 100 }, { signal: controllerProducts.signal })
        return rows
    }
    return (
        <QueryListContainer<PRODUCT_MODEL, {}>
            initialFilter={{}}
            renderList={({ data: { rows }, error, loading, refresh }) =>
                <List component={Card} style={{ margin: 5, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                    <ListItem component={Card}>
                        <ListItemText
                            primary={
                                <AsyncAutoComplete<PRODUCT_MODEL>
                                    label={'Harytlar'}
                                    getOptionsAsync={getProducts}
                                    isOptionEqualToValue={(t, v) => t._id === v._id}
                                    getOptionsLabel={t => t['name']}
                                    onChange={async (e, model) => {
                                        startLoading()
                                        try {
                                            await _axios.put(`/action-types/${id}/products/${model?.id}`)
                                            refresh()
                                        } catch (e) {
                                            console.log(e)
                                        }
                                        endLoading()
                                    }}
                                    value={null}
                                />
                            }
                        />
                    </ListItem>
                    <ListItem style={{ flexGrow: 1, position: 'relative' }}>
                        <div style={{ overflow: 'auto', position: 'absolute', top: 6, left: 0, right: 0, bottom: 0 }}><List>
                            {loading && <ListItem style={{ justifyContent: 'center' }}><CircularProgress size={20} /></ListItem>}
                            {error && <ListItem button onClick={refresh} style={{ justifyContent: 'center' }}>{error}</ListItem>}
                            {rows.map(data => <ListItem>
                                <ListItemText primary={`${data.name}`} secondary={data.code} />
                                <ListItemSecondaryAction><IconButton onClick={async () => {
                                    startLoading()
                                    try {
                                        await _axios.delete(`/action-types/${id}/products/${data?.id}`)
                                        refresh()
                                    } catch (e) {
                                        console.log(e)
                                    }
                                    endLoading()
                                }} size='small'><DeleteOutline fontSize="small" /></IconButton></ListItemSecondaryAction>
                            </ListItem>)}
                        </List>
                        </div>
                    </ListItem>
                </List>}
            url={`/action-types/${id}/products`}
        />
    )
}