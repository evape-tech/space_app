import request from '@/utils/request'

export function getStations() {
    return request({
        url: `/stations`,
        method: 'get'
    })
}

export function getStationCps(stationId) {
    return request({
        url: `/stations/${stationId}/cps`,
        method: 'get'
    })
}

export function getStationFromBackend(stationId) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    const url = stationId
        ? `${baseUrl}/stations/${stationId}`
        : `${baseUrl}/stations`;

    return request({
        url,
        method: 'get'
    })
}