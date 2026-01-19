import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import LineProvider from "next-auth/providers/line"
import CredentialsProvider from "next-auth/providers/credentials"
import axios from 'axios'

const BACKEND_API = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api'

// 呼叫後端 API 進行第三方登入
async function callBackendAuth(provider, data) {
    try {
        const res = await axios.post(`${BACKEND_API}/auth/thirdparty`, data, {
            headers: { 
                'Content-Type': 'application/json',
                'ngrok-skip-browser-warning': 'true'
            }
        })
        
        if (res.status === 200 && res.data.success) {
            return res.data
        }
        console.warn('Backend API returned non-success:', res.data)
        return null
    } catch (error) {
        console.error(`Backend API call failed for ${provider}:`, error.message)
        return null
    }
}

export const authOptions = {
    trustHost: true,
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_ID,
            clientSecret: process.env.GOOGLE_SECRET,
        }),
        LineProvider({
            clientId: process.env.LINE_CLIENT_ID ?? '',
            clientSecret: process.env.LINE_CLIENT_SECRET ?? ''
        }),
        CredentialsProvider({
            name: "Credentials",
            async authorize(credentials) {
                const data = await callBackendAuth('phone', {
                    provider: 'phone',
                    phone: credentials.phoneNo
                })
                
                if (!data) return null
                
                return {
                    id: data.user.id,
                    uuid: data.user.uuid || data.user.id,
                    acc: data.user.phone || data.user.id,
                    phone: data.user.phone,
                    email: data.user.email,
                    name: data.user.firstName || data.user.phone,
                    provider: 'phone',
                    accessToken: data.token
                }
            }
        })
    ],
    callbacks: {
        async jwt({ token, user, account }) {
            if (!user) return token
            
            // 從後端 API 獲取的資料（OAuth with backend）
            if (user.backendUser) {
                Object.assign(token, {
                    accessToken: user.backendUser.accessToken,
                    userId: user.backendUser.id,
                    uuid: user.backendUser.uuid,
                    acc: user.backendUser.acc,
                    provider: user.backendUser.provider
                })
            }
            // Credentials provider（手機登入）- 也需要後端 API 資料
            else if (user.accessToken) {
                Object.assign(token, {
                    accessToken: user.accessToken,
                    refreshToken: user.refreshToken,
                    userId: user.id,
                    uuid: user.uuid,
                    acc: user.acc,
                    provider: user.provider
                })
            }
            
            return token
        },
        
        async signIn({ user, account }) {
            // Google/Line OAuth：呼叫後端 API
            if (account.provider === "google" || account.provider === "line") {
                const data = await callBackendAuth(account.provider, {
                    provider: account.provider,
                    email: user.email,
                    name: user.name,
                    providerId: user.id,
                    image: user.image
                })
                
                if (!data) {
                    console.error(`Backend API failed for ${account.provider} auth`)
                    return false
                }
                
                user.backendUser = {
                    id: data.user.id,
                    uuid: data.user.uuid || data.user.id,
                    acc: data.user.email || data.user.id,
                    provider: account.provider,
                    accessToken: data.token
                }
            }
            
            // 手機登入也必須通過後端 API
            if (account.provider === "credentials") {
                // CredentialsProvider 的 authorize 已經調用後端 API
                // 只需確保有返回資料
                if (!user.accessToken) {
                    console.error('Credentials login failed: no backend token')
                    return false
                }
            }
            
            return true
        },
        
        async session({ session, token }) {
            // 設定 token 到 session
            session.accessToken = token.accessToken
            session.refreshToken = token.refreshToken
            
            // 直接使用 token 中的遠端資料
            session.user = {
                id: token.userId,
                acc: token.acc,
                uuid: token.uuid,
                provider: token.provider
            }
            
            return session
        }
    },
    pages: {
        signIn: '/auth/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
    jwt: {
        secret: process.env.NEXTAUTH_SECRET
    },
    useSecureCookies: process.env.NODE_ENV === 'production',
    cookies: {
        sessionToken: {
            name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.session-token`,
            options: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            }
        },
        callbackUrl: {
            name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.callback-url`,
            options: {
                httpOnly: false,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            }
        },
        csrfToken: {
            name: `${process.env.NODE_ENV === 'production' ? '__Host-' : ''}next-auth.csrf-token`,
            options: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            }
        },
        pkceCodeVerifier: {
            name: `${process.env.NODE_ENV === 'production' ? '__Secure-' : ''}next-auth.pkce.code_verifier`,
            options: {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                path: '/',
            }
        }
    }
}

export default NextAuth(authOptions)
