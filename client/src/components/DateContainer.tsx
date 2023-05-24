import { CustomContextMenu } from './CustomContextMenu'
import React from 'react'

type Props = {
    children: any,
    onChange: (props: { date1: string, date2: string }) => void
}

const dateToStr = (date: Date) => `${date.getFullYear()}-${(date.getMonth() + 1 > 9) ? date.getMonth() + 1 : `0${date.getMonth() + 1}`}-${date.getDate() > 9 ? date.getDate() : `0${date.getDate()}`}`

export const DateContainer: React.FC<Props> = ({ children, onChange }) => {
    const today = dateToStr(new Date())
    const yesterday = dateToStr(new Date((new Date()).setDate((new Date()).getDate() - 1)))
    const this_month = { date1: dateToStr(new Date((new Date()).setDate(1))), date2: dateToStr(new Date((new Date((new Date()).setMonth((new Date()).getMonth() + 1))).setDate(0))) }
    const prev_month = { date1: dateToStr(new Date((new Date((new Date()).setMonth((new Date()).getMonth() - 1))).setDate(1))), date2: dateToStr(new Date((new Date((new Date()).setMonth((new Date()).getMonth()))).setDate(0))) }
    const this_year = { date1: dateToStr(new Date((new Date((new Date()).setDate(1))).setMonth(0))), date2: dateToStr(new Date((new Date((new Date((new Date((new Date()).setDate(1))).setMonth(0)).setFullYear((new Date()).getFullYear() + 1)))).setDate(0))) }

    const options: { label: string, onClick: () => void }[] = [
        { label: 'Şu gün', onClick: () => onChange({ date1: today, date2: today }) },
        { label: 'Düýn', onClick: () => onChange({ date1: yesterday, date2: yesterday }) },
        { label: 'Şu aý', onClick: () => onChange(this_month) },
        { label: 'Geçen aý', onClick: () => onChange(prev_month) },
        { label: 'Şu ýyl', onClick: () => onChange(this_year) },
    ]
    return <CustomContextMenu options={options}>{children}</CustomContextMenu>
}



const date2 = new Date()
const date1 = new Date((new Date()).setDate(date2.getDate()))
export const today1 = `${date1.getFullYear()}-${(date1.getMonth() + 1 > 9) ? date1.getMonth() + 1 : `0${date1.getMonth() + 1}`}-${date1.getDate() > 9 ? date1.getDate() : `0${date1.getDate()}`}`
export const today2 = `${date2.getFullYear()}-${(date2.getMonth() + 1 > 9) ? date2.getMonth() + 1 : `0${date2.getMonth() + 1}`}-${date2.getDate() > 9 ? date2.getDate() : `0${date2.getDate()}`}`
