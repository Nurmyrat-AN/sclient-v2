import { CircularProgress, TableCell } from "@mui/material";

import React from "react";
import { _axios } from "../config/request";

type Balance = {
    id: number
    loading: boolean
    error: boolean
    balance?: string
    date?: Date
}
type Store = {
    balances: Balance[]
    addUser: (id: number) => void
}
type State = {
    balances: Balance[]
    loading: boolean
}
const Context = React.createContext<Store>({ balances: [], addUser: id => { } })

export class AishBalanceContextWrapper extends React.Component<{ children: any }, State> {
    state: Readonly<State> = { balances: [], loading: false }

    componentDidMount(): void {
        this.syncBalances()
    }

    componentDidUpdate(prevProps: Readonly<{ children: any; }>, prevState: Readonly<State>, snapshot?: any): void {
        if (JSON.stringify(prevState.balances) !== JSON.stringify(this.state.balances)) {
            this.syncBalances()
        }
    }

    addUser: Store['addUser'] = (id) => {
        this.setState(state => state.balances.find(b => b.id === id) ? state : ({ ...state, balances: [...state.balances, { id, error: false, loading: true }] }))
        this.syncBalances()
    }

    syncBalances = async () => {
        if (this.state.loading) return;
        const balance = this.state.balances.find(b =>
            (!b.balance && !b.error) || ((new Date().getTime() - (b.date || new Date()).getTime()) / 1000 / 60) > 3
        )

        if (!balance) return;

        if (!balance.loading) {
            return this.setState(state => ({
                ...state,
                balances: state.balances.map(b => b.id === balance.id ? ({ ...b, loading: true }) : b)
            }))
        }

        try {
            const { data } = await _axios.get(`/customers/${balance.id}/aish-balance`)
            this.setState(state => ({
                ...state,
                balances: state.balances.map(b => b.id === balance.id ? ({ ...b, balance: data, loading: false, date: new Date() }) : b),
                loading: false
            }))
        } catch (e) {
            this.setState(state => ({
                ...state,
                balances: state.balances.map(b => b.id === balance.id ? ({ ...b, error: true, loading: false, date: new Date() }) : b),
                loading: false
            }))
        }
    }

    render(): React.ReactNode {
        return (
            <Context.Provider value={{
                balances: this.state.balances,
                addUser: this.addUser
            }}>
                {this.props.children}
            </Context.Provider>
        )
    }
}

export const AishBalance = ({ id }: { id: number }) => {
    const { addUser, balances } = React.useContext(Context)
    React.useEffect(() => {
        addUser(id)
    }, [id, addUser])

    const balance = balances.find(b => b.id === id)
    return (
        <TableCell align={balance?.balance ? "right" : 'center'}>
            {!balance ? '...' : balance.loading ? <CircularProgress size={20} /> : balance.error ? '???' : balance.balance}
        </TableCell>
    )
}