import axios from 'axios'

export const _axios = axios.create({
    baseURL: '/api',
    // baseURL: 'http://localhost:3001/api',
    withCredentials: true
})