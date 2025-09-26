import request from '@/utils/request'

export function getUserCars(userId) {
    return request({
        url: `/users/${userId}/cars`,
        method: 'get'
    })
}

export function getCarById(id) {
    return request({
        url: `/cars/${id}`,
        method: 'get'
    })
}

export function createCar(data, userId) {
    return request({
        url: `/users/${userId}/cars`,
        method: 'post',
        data
    })
}

// export function updateCar(data, id) {
//     return request({
//         url: `/cars/${id}`,
//         method: 'put',
//         data
//     })
// }

export function deleteCar(id) {
    return request({
        url: `/cars/${id}`,
        method: 'delete'
    })
}