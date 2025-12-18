import request from '@/utils/request'
import fetchWithAuth from '@/utils/fetchWithAuth'

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
        method: 'get',
        headers: {
            'ngrok-skip-browser-warning': 'true'
        }
    })
}

export function getUserCarsFromBackend(token) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    return fetchWithAuth(`${baseUrl}/users/me/vehicles`, {
        method: 'GET',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        token
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
    
    return fetchWithAuth(`${baseUrl}/users/me/vehicles`, {
        method: 'POST',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        body: data,
        token
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
    return fetchWithAuth(`${baseUrl}/users/me/vehicles/${id}`, {
        method: 'DELETE',
        headers: { 'ngrok-skip-browser-warning': 'true' },
        token
    })
}
