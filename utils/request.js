import axios from 'axios'
// import { MessageBox, Message } from 'element-ui'
// import store from '@/store'
// import { getToken } from '@/utils/auth'
const baseUrl = process.env.NEXT_PUBLIC_BASE_API

// Global flag to prevent multiple 401 redirects
let isRedirectingTo401 = false

// Helper function to sign out and redirect to login
const handleUnauthorized = async () => {
    if (isRedirectingTo401) return
    isRedirectingTo401 = true
    
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
        try {
            // Dynamically import signOut to avoid SSR issues
            const { signOut } = await import('next-auth/react')
            // Sign out without redirecting (we'll do it manually)
            await signOut({ redirect: false })
        } catch (error) {
            console.error('Error signing out:', error)
        } finally {
            // Redirect to login page
            window.location.href = '/auth/login'
        }
    }
}

// create an axios instance
const service = axios.create({
    baseURL: baseUrl, // url = base url + request url
    // withCredentials: true, // send cookies when cross-domain requests
    timeout: 5000 // request timeout
})

// request interceptor
service.interceptors.request.use(
    config => {
        // do something before request is sent

        // if (store.getters.token) {
        //     // let each request carry token
        //     // ['X-Token'] is a custom headers key
        //     // please modify it according to the actual situation
        //     config.headers['X-Token'] = getToken()
        // }
        return config
    },
    error => {
        // do something with request error
        console.log(error) // for debug
        return Promise.reject(error)
    }
)

// response interceptor
service.interceptors.response.use(
    /**
     * If you want to get http information such as headers or status
     * Please return  response => response
    */

    /**
     * Determine the request status by custom code
     * Here is just an example
     * You can also judge the status by HTTP Status Code
     */
    response => {
        const res = response.data

        // if the custom code is not 20000, it is judged as an error.
        if (res.code) {
            // Message({
            //     message: res.message || 'Error',
            //     type: 'error',
            //     duration: 5 * 1000
            // })

            // 50008: Illegal token; 50012: Other clients logged in; 50014: Token expired;
            // if (res.code === 50008 || res.code === 50012 || res.code === 50014) {
            //     // to re-login
            //     MessageBox.confirm('You have been logged out, you can cancel to stay on this page, or log in again', 'Confirm logout', {
            //         confirmButtonText: 'Re-Login',
            //         cancelButtonText: 'Cancel',
            //         type: 'warning'
            //     }).then(() => {
            //         store.dispatch('user/resetToken').then(() => {
            //             location.reload()
            //         })
            //     })
            // }
            // if backend indicates unauthorized, redirect to login
            if (res.code === 401 || res.code === 403) {
                handleUnauthorized()
            }

            return Promise.reject(new Error(res.message || 'Error'))
        } else {
            return res
        }
    },
    error => {
        console.log('err' + error) // for debug
        // If the HTTP status is 401, redirect to login page
        if (error && error.response && error.response.status === 401) {
            handleUnauthorized()
        }
        // Message({
        //     message: error.message,
        //     type: 'error',
        //     duration: 5 * 1000
        // })
        return Promise.reject(error)
    }
)

export default service