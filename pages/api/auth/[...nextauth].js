import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import LineProvider from "next-auth/providers/line";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from '@/utils/db'


const baseApiUrl = process.env.NEXT_PUBLIC_BASE_API

// import AppleProvider from "next-auth/providers/apple"
// import EmailProvider from "next-auth/providers/email"

// For more information on each option (and a full list of options) go to
// https://next-auth.js.org/configuration/options
export const authOptions = {
    // https://next-auth.js.org/configuration/providers/oauth

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
            // The name to display on the sign in form (e.g. "Sign in with...")
            name: "Credentials",
            // `credentials` is used to generate a form on the sign in page.
            // You can specify which fields should be submitted, by adding keys to the `credentials` object.
            // e.g. domain, username, password, 2FA token, etc.
            // You can pass any HTML attribute to the <input> tag through the object.
            // credentials: {
            //     phoneNo: { label: "Username", type: "text", placeholder: "jsmith" },
            // },
            async authorize(credentials, req) {
                // 呼叫後端 thirdparty login API 取得 token
                try {
                    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
                    const res = await fetch(`${backendUrl}/auth/thirdparty`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            provider: 'phone',
                            phone: credentials.phoneNo
                        })
                    });

                    const data = await res.json();

                    if (!res.ok || !data.success) {
                        console.log('Thirdparty login failed:', data);
                        return null;
                    }

                    // 回傳 user 並附帶 token（會傳給 jwt callback）
                    return {
                        id: data.user.id,
                        // backend may not return uuid; use id as fallback so we always have a stable identifier
                        uuid: data.user.uuid || data.user.id,
                        acc: data.user.phone || data.user.id,
                        phone: data.user.phone,
                        email: data.user.email,
                        name: data.user.firstName || data.user.phone,
                        provider: data.user.provider || 'phone',
                        accessToken: data.token,
                        // 如果後端也回傳 refreshToken，可加上：
                        // refreshToken: data.refreshToken
                    };
                } catch (error) {
                    console.log('Authorize error:', error.message);
                    return null;
                }
            }
        })
    ],
    theme: {
        colorScheme: "light",
    },
    callbacks: {
        async jwt({ token, user, account }) {
            // 初次登入時，user 會有值（來自 authorize 回傳的物件）
            if (user) {
                token.accessToken = user.accessToken;
                token.refreshToken = user.refreshToken; // 如果有
                token.userId = user.id;
                token.uuid = user.uuid;
                token.acc = user.acc;
                token.provider = user.provider;
            }

            // 這裡可以加入 token 續期邏輯
            // if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
            //   // 呼叫 refresh endpoint
            // }

            return token;
        },
        async signIn({ user, account, profile, email, credentials }) {

            const body = {
                acc: user.acc,
                provider: user.provider || account.provider,
                profile: {
                    create: {
                        nickName: user.name
                    }
                }
            }
            console.log('signIn user/account:', user);
            // ensure uuid from thirdparty is persisted
            if (user.uuid) {
                body.uuid = user.uuid;
            }
            if (account.provider === "credentials") {
                body.profile.create.mobile = user.acc
            }

            if (account.provider === "google") {
                body.acc = user.id
                body.profile.create.email = user.email
            }

            if (account.provider === "line") {
                body.acc = user.id
            }

            try {
                // safer flow: check existing user first to avoid inserting explicit primary key
                const existing = await prisma.user.findUnique({ where: { acc: body.acc } });
                if (existing) {
                    // update uuid if provided and different
                    if (body.uuid && existing.uuid !== body.uuid) {
                        await prisma.user.update({ where: { id: existing.id }, data: { uuid: body.uuid } });
                    }
                } else {
                    // create new user first (only pass allowed fields, no id)
                    const createData = {
                        acc: body.acc,
                        provider: body.provider,
                        uuid: body.uuid ?? undefined,
                    };
                    const newUser = await prisma.user.create({ data: createData });

                    // create profile separately if provided
                    if (body.profile && body.profile.create) {
                        await prisma.profile.create({
                            data: {
                                userId: newUser.id,
                                mobile: body.profile.create.mobile ?? null,
                                nickName: body.profile.create.nickName ?? null,
                                email: body.profile.create.email ?? null,
                            }
                        });
                    }
                }
            } catch (error) {
                console.log('signIn upsert/create error:', error.message || error);
                return false
            }

            return true
        },
        async session({ session, user, token }) {
            // 把 accessToken 傳給前端
            session.accessToken = token.accessToken;
            session.refreshToken = token.refreshToken;

            // 嘗試從資料庫取得使用者資料
            let dbUser = await prisma.user.findUnique({
                where: {
                    acc: token.acc || token.sub
                }
            })
            if (!dbUser) {
                dbUser = await prisma.user.findUnique({
                    where: {
                        id: token.userId || +token.sub,
                    }
                })
            }
            
            if (dbUser) {
                session.user = dbUser;
                // if token includes uuid (from thirdparty login), ensure it's available on session.user
                if (!session.user.uuid && token.uuid) session.user.uuid = token.uuid;
            } else {
                // 如果資料庫沒有，至少回傳 token 中的基本資訊
                session.user = {
                    id: token.userId,
                    uuid: token.uuid,
                    acc: token.acc,
                    provider: token.provider
                };
            }
            
            return session
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
        signIn: '/auth/login',
    },
    // secret: "test",
    jwt: {
        secret: process.env.NEXTAUTH_SECRET
    }
}

export default NextAuth(authOptions)
