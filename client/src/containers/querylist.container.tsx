import { } from 'react-router-dom'

import React from "react";
import { _axios } from "../config/request";

type Props<T, F extends { [x: string]: any }, E extends { [x: string]: any }> = {
    initialFilter: F
    dynamicFilter?: { [x in keyof F]?: F[x] }
    url: string
    notSaveToUrl?: boolean
    onNewData?: (data: State<T, F, E>['data']) => void
    renderList: (props: {
        data: {
            rows: T[],
            count: number,
            extras?: E
        }
        filter: F,
        setFilter: React.Dispatch<React.SetStateAction<F>>
        loading: boolean
        error: string | null
        refresh: () => void
    }) => React.ReactElement
}

type State<T, F, E extends { [x: string]: any }> = {
    filter: F,
    data: { rows: T[], count: number, extras?: E }
    status: {
        loading: boolean
        error: string | null
    }
}

export class QueryListContainer<T, F extends { [x: string]: any }, E extends { [x: string]: any } = any> extends React.Component<Props<T, F, E>, State<T, F, E>> {
    state = {
        filter: this.props.initialFilter,
        data: {
            rows: [],
            count: 0
        },
        status: {
            loading: false,
            error: null
        }
    }

    setFilter: React.Dispatch<React.SetStateAction<F>> = (fn) => {
        this.setState(state => ({
            ...state,
            filter: typeof fn === 'function' ?
                // @ts-ignore
                fn(state.filter) :
                fn
        }))
    }

    componentDidMount(): void {
        this.getData()
    }

    componentDidUpdate(prevProps: Props<T, F, E>, prevState: State<T, F, E>) {
        if (JSON.stringify(prevState.filter) !== JSON.stringify(this.state.filter)) {
            this.getData()
            console.log("Changed State")
        } else if (JSON.stringify(prevProps.dynamicFilter || null) !== JSON.stringify(this.props.dynamicFilter || null)) {
            this.setState(state => ({ ...state, filter: { ...state.filter, ...this.props.dynamicFilter } }))
            console.log("Changed dinamic")
        }
        console.log("Changed Something: ", this.props.dynamicFilter)
    }

    timer: NodeJS.Timeout | null = null
    controller: AbortController | null = null

    getData = () => {
        if (this.timer) {
            clearTimeout(this.timer)
        }
        if (this.controller) {
            this.controller.abort()
        }
        this.setState(state => ({ ...state, status: { ...state.status, loading: true, error: null }, data: { ...state.data, rows: [] } }))
        this.timer = setTimeout(async () => {
            if (!this.props.notSaveToUrl) {
                var newurl = `${window.location.protocol}//${window.location.host}${window.location.pathname}?${Object.keys(this.state.filter).reduce(
                    (res, key) => this.state.filter[key] === null || this.state.filter[key] === undefined || this.state.filter[key].length === 0 ?
                        res :
                        `${res}${res ? '&' : ''}${key}=${this.state.filter[key]}`, ''
                )}`
                window.history.pushState({ path: newurl }, '', newurl);
            }
            try {
                this.controller = new AbortController()
                const { data } = await _axios.post<State<T, F, E>['data']>(this.props.url, this.state.filter, { signal: this.controller.signal })
                this.props.onNewData?.(data)
                this.setState(state => ({ ...state, data, status: { loading: false, error: null } }))
            } catch (e: any) {
                if (e.code !== 'ERR_CANCELED')
                    this.setState(state => ({ ...state, status: { loading: false, error: e.message } }))
            }
        }, 300)
    }

    render(): React.ReactNode {
        return (
            <this.props.renderList
                data={this.state.data}
                filter={this.state.filter}
                setFilter={this.setFilter}
                loading={this.state.status.loading}
                error={this.state.status.error}
                refresh={this.getData}
            />
        )
    }
}