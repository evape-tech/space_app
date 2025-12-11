import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import LineProvider from "next-auth/providers/line"
import CredentialsProvider from "next-auth/providers/credentials"
import { prisma } from '@/utils/db'
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

// 從資料庫查找用戶
async function findUserInDB(token) {
    // 優先使用 acc 查詢
    if (token.acc) {
        try {
            const user = await prisma.user.findUnique({ where: { acc: token.acc } })
            if (user) return user
        } catch (e) { }
    }
    
    // 使用 numeric userId 查詢（credentials login）
    if (token.userId && typeof token.userId === 'number') {
        try {
            return await prisma.user.findUnique({ where: { id: token.userId } })
        } catch (e) { }
    }
    
    // 使用 uuid 查詢
    if (token.uuid) {
        try {
            return await prisma.user.findUnique({ where: { uuid: token.uuid } })
        } catch (e) { }
    }
    
    return null
}

// 儲存或更新用戶到資料庫
async function saveUserToDB(acc, provider, uuid, profileData) {
    const existing = await prisma.user.findUnique({ where: { acc } })
    
    if (existing) {
        // 更新 uuid（如果有變更）
        if (uuid && existing.uuid !== uuid) {
            await prisma.user.update({ 
                where: { id: existing.id }, 
                data: { uuid } 
            })
        }
        return existing
    }
    
    // 建立新用戶
    const newUser = await prisma.user.create({
        data: {
            acc,
            provider,
            uuid: uuid || null
        }
    })
    
    // 建立 profile
    if (profileData) {
        await prisma.profile.create({
            data: {
                userId: newUser.id,
                ...profileData
            }
        })
    }
    
    return newUser
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
            // Credentials provider（手機登入）
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
            // OAuth fallback（沒有後端資料）
            else {
                Object.assign(token, {
                    userId: user.id,
                    acc: user.email || user.id,
                    provider: account?.provider
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
                
                if (data) {
                    user.backendUser = {
                        id: data.user.id,
                        uuid: data.user.uuid || data.user.id,
                        acc: data.user.email || data.user.id,
                        provider: account.provider,
                        accessToken: data.token
                    }
                }
            }
            
            // 準備儲存到本地資料庫的資料
            let acc, uuid, profileData = {}
            
            if (user.backendUser) {
                // 從後端 API 獲取的資料
                acc = user.backendUser.acc
                uuid = user.backendUser.uuid
            } else if (account.provider === "credentials") {
                // 手機登入
                acc = user.acc
                uuid = user.uuid
                profileData.mobile = user.acc
                profileData.nickName = user.name
            } else if (account.provider === "google") {
                // Google OAuth fallback
                acc = user.id
                uuid = null
                profileData.email = user.email
                profileData.nickName = user.name
            } else if (account.provider === "line") {
                // Line OAuth fallback
                acc = user.id
                uuid = null
                profileData.nickName = user.name
            }
            
            try {
                await saveUserToDB(
                    acc, 
                    account.provider, 
                    uuid,
                    Object.keys(profileData).length > 0 ? profileData : null
                )
                return true
            } catch (error) {
                console.error('Failed to save user to DB:', error.message)
                return false
            }
        },
        
        async session({ session, token }) {
            // 設定 token 到 session
            session.accessToken = token.accessToken
            session.refreshToken = token.refreshToken
            
            // 從資料庫取得用戶資料
            const dbUser = await findUserInDB(token)
            
            if (dbUser) {
                session.user = {
                    ...dbUser,
                    uuid: dbUser.uuid || token.uuid
                }
            } else {
                session.user = {
                    acc: token.acc,
                    uuid: token.uuid,
                    provider: token.provider
                }
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
