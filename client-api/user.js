import request from '@/utils/request'

// export function createUser(data) {
//     return request({
//         url: '/users',
//         method: 'post',
//         data
//     })
// }

export function updateProfile(data, uid) {
    return request({
        url: `/users/${uid}`,
        method: 'put',
        data
    })
}

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
    
    return request({
        url: `${baseUrl}/users/me/transactions`,
        method: 'get',
        headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
        }
    })
}

export function getChargeTxLastestFromBackend(token) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';

    return request({
        url: `${baseUrl}/users/me/transactions?mode=latest`,
        method: 'get',
        headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
        }
    })
}

export function getChargeTariffsFromBackend(token, transactionId) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';

    return request({
        url: `${baseUrl}/users/me/wallet/transactions`,
        method: 'post',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'ngrok-skip-browser-warning': 'true'
        },
        data: {
            transaction_id: transactionId
        }
    })
}

export function getUserProfileFromBackend(token) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    
    return request({
        url: `${baseUrl}/users/me`,
        method: 'get',
        headers: {
            'Authorization': `Bearer ${token}`,
            'ngrok-skip-browser-warning': 'true'
        }
    })
}
