import request from '@/utils/request'

/**
 * @deprecated
 */
export function getUserCars(userId) {
    return request({
        url: `/users/${userId}/cars`,
        method: 'get'
    })
}

export function getCarsBrandsListFromBackend() {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    
    return request({
        url: `${baseUrl}/users/me/vehicles/brands`,
        method: 'get'
    })
}

export function getUserCarsFromBackend(token) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    
    return request({
        url: `${baseUrl}/users/me/vehicles`,
        method: 'get',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}

/**
 * @deprecated
 */
export function getCarById(id) {
    return request({
        url: `/cars/${id}`,
        method: 'get'
    })
}

/**
 * @deprecated
 */
export function createCar(data, userId) {
    return request({
        url: `/users/${userId}/cars`,
        method: 'post',
        data
    })
}

export function createCarForBackend(data, token) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    
    return request({
        url: `${baseUrl}/users/me/vehicles`,
        method: 'post',
        headers: {
            'Authorization': `Bearer ${token}`
        },
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

/**
 * @deprecated
 */
export function deleteCar(id) {
    return request({
        url: `/cars/${id}`,
        method: 'delete'
    })
}

export function deleteCarForBackend(id, token) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    
    return request({
        url: `${baseUrl}/users/me/vehicles/${id}`,
        method: 'delete',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    })
}
