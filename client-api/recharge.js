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
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
        }
    })
}

export function getUserWalletBalanceFromBackend(token) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    
    return request({
        url: `${baseUrl}/users/me/wallet`,
        method: 'get',
        headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
        }
    })
}

export function createPaymentOrderFromBackend(token, orderData) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    
    return fetch(`${baseUrl}/users/me/payment/create-order`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify(orderData)
    }).then(async response => {
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || data.error || 'API 請求失敗');
        }
        return data;
    });
}