import request from '@/utils/request'
import fetchWithAuth from '@/utils/fetchWithAuth'

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
    return fetchWithAuth(`${baseUrl}/users/me/topups`, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        token
    })
}

export function getUserWalletBalanceFromBackend(token) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    return fetchWithAuth(`${baseUrl}/users/me/wallet`, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        token
    })
}

export function createPaymentOrderFromBackend(token, orderData) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';

    return fetchWithAuth(`${baseUrl}/users/me/payment/create-order`, {
        method: 'POST',
        headers: {
            'ngrok-skip-browser-warning': 'true'
        },
        body: orderData,
        token
    });
}