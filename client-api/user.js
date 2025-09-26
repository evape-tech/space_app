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
