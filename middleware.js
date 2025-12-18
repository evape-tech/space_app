import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: ["/api/:path*"],
};

export async function middleware(req) {
  // validate the user is authenticated
  const verifiedToken = await getToken({ req });

  console.log(req.nextUrl.pathname);

  const url = req.nextUrl.pathname

  const checkList = () => {
    const whileList = ["/api/send-sms", "/api/auth"];
    const result = whileList.findIndex((w) => url.startsWith(w));
    // return index (>=0) if matched, otherwise -1
    // keep a log for debugging
    console.log('middleware whitelist check:', { url, result });
    return result;
  };

  if (!verifiedToken) {
    // if this an API request, respond with JSON
    if (url.startsWith("/api/") && checkList() < 0) {
      // For API requests, return 401 JSON so clients (fetch/axios) can handle redirects
      return NextResponse.json({ error: { message: "authentication required" } }, { status: 401 });
    }
    // otherwise, redirect to the set token page
    else {
      return NextResponse.next();
    }
  }
}
