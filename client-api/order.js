import request from '@/utils/request'

export function orderSeq() {
    return request({
        url: `/orders/seq-no`,
        method: 'get'
    })
}

export function resetSeqNo() {
    return request({
        url: `/orders/re-seq-no`,
        method: 'post'
    })
}


export function getUserOrders(userId) {
    return request({
        url: `/orders/user/${userId}`,
        method: 'get'
    })
}

export function getOrderById(id) {
    return request({
        url: `/orders/${id}`,
        method: 'get'
    })
}

export function getOrderByNo(orderNo) {
    return request({
        url: `/orders/no/${orderNo}`,
        method: 'get'
    })
}

export function createOrder(data) {
    return request({
        url: `/orders`,
        method: 'post',
        data
    })
}

export function updateOrder(data, id) {
    return request({
        url: `/orders/${id}`,
        method: 'put',
        data
    })
}

export function deleteOrder(id) {
    return request({
        url: `/orders/${id}`,
        method: 'delete'
    })
}