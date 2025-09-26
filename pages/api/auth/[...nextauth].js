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
                let user = null

                const body = {
                    acc: credentials.phoneNo,
                    provider: 'phone'
                }

                try {
                    user = await prisma.user.upsert({
                        where: {
                            acc: body.acc
                        },
                        create: body,
                        update: {}
                    })
                } catch (error) {
                    console.log(error.message)
                    return null
                }

                return user
            }
        })
    ],
    theme: {
        colorScheme: "light",
    },
    callbacks: {
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
                const dbUser = await prisma.user.upsert({
                    where: {
                        acc: body.acc
                    },
                    create: body,
                    update: {}
                })
            } catch (error) {
                console.log(error.message)
                return false
            }

            return true
        },
        async session({ session, user, token }) {

            let dbUser = await prisma.user.findUnique({
                where: {
                    acc: token.sub
                }
            })
            if (!dbUser) {
                dbUser = await prisma.user.findUnique({
                    where: {
                        id: +token.sub,
                    }
                })
            }
            session.user = dbUser;
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
