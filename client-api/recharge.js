import request from '@/utils/request'

/**
 * @deprecated
 */
export function getRecharges(userId) {
    return request({
        url: `/users/${userId}/recharges`,
        method: 'get'
    })
}

/**
 * @deprecated
 */
export function getLastRecharge(userId) {
    return request({
        url: `/users/${userId}/rechargeBalance`,
        method: 'get'
    })
}

export function checkOutPage(data) {
    return request({
        url: `/ecpay/checkout`,
        method: 'post',
        data
    })
}

export function getRechargesFromBackend(token) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    
    return request({
        url: `${baseUrl}/users/me/topups`,
        method: 'get',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}

export function getUserWalletBalanceFromBackend(token) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    
    return request({
        url: `${baseUrl}/users/me/wallet`,
        method: 'get',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}