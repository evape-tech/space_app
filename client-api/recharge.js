import request from '@/utils/request'

export function getRecharges(userId) {
    return request({
        url: `/users/${userId}/recharges`,
        method: 'get'
    })
}

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