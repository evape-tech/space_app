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