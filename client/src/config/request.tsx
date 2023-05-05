import axios from 'axios'

export const _axios = axios.create({
    baseURL: '/api',
    withCredentials: true
})