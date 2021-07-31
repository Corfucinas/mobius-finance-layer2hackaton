import axios from "axios"

const service = axios.create({
    timeout: 2000 * 500,
    headers: {
        "Content-Type": "application/json; charset=utf-8"
    }
})

service.interceptors.request.use((config) => {
    return config
}, (error) => {
    error.data = {}
    error.data.msg = 'service error'
    return Promise.resolve(error)
})

service.interceptors.response.use((response) => {
    return response
}, (error) => {
    return Promise.resolve(error)
})

export default service