import request from '@/utils/request'

export function thirdpartyLogin({ provider, phone }) {
    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
    
    return request({
        url: `${baseUrl}/auth/thirdparty`,
        method: 'post',
        data: { provider, phone },
    })
}
