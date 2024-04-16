import axios from 'axios'

export const _axios = axios.create({
    // baseURL: '/api',
    baseURL: 'http://localhost/api',
    // baseURL: 'https://bonus.mebato-count.com/api',
    withCredentials: true
})