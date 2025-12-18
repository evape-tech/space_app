import request from '@/utils/request'
import fetchWithAuth from '@/utils/fetchWithAuth'

// export function createUser(data) {
//     return request({
//         url: '/users',
//         method: 'post',
//         data
//     })
// }

/**
 * @deprecated
 */
export function updateProfile(data, uid) {
    return request({
        url: `/users/${uid}`,
        method: 'put',
        data
    })
}

/**
 * @deprecated
 */
export function getProfileById(uid) {
    return request({
        url: `/users/${uid}`,
        method: 'get'
    })
}

// {
//     "userId": 30,
//     "points": -100,
//     "depositId": null,
//     "spendId": 2,  // from chargeTx
//     "balance": 300
// }
/**
 * @deprecated
 */
export function payPointFee(data, uid) {
    return request({
        url: `/users/${uid}/spend`,
        method: 'post',
        data
    })
}

export function getChargeTx(userId) {
    return request({
        url: `/users/${userId}/charges`,
        method: 'get'
    })
}

export function getChargeTxFromBackend(token) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    return fetchWithAuth(`${baseUrl}/users/me/transactions`, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        token
    })
}

export function getChargeTxLastestFromBackend(token) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    return fetchWithAuth(`${baseUrl}/users/me/transactions?mode=latest`, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        token
    })
}

export function getChargeTariffsFromBackend(token, transactionId) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    return fetchWithAuth(`${baseUrl}/users/me/wallet/transactions`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: { transaction_id: transactionId },
        token
    })
}

export function getUserProfileFromBackend(token) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    return fetchWithAuth(`${baseUrl}/users/me`, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        token
    })
}

export function updateUserProfileFromBackend(token, data) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    return fetchWithAuth(`${baseUrl}/users/me`, {
        method: 'PATCH',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: data,
        token
    })
}