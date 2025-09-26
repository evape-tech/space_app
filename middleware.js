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

    var result = whileList.findIndex((w) => {
      return url.startsWith(w);
    });
    console.log(result);
  };

  if (!verifiedToken) {
    // if this an API request, respond with JSON
    if (url.startsWith("/api/") && checkList() < 0) {
      // return NextResponse.json(
      //   { error: { message: "authentication required" } },
      //   { status: 401 }
      // );
      req.nextUrl.searchParams.set("callbackUrl", req.nextUrl.pathname);
      req.nextUrl.pathname = "/auth/login";

      return NextResponse.redirect(req.nextUrl);
    }
    // otherwise, redirect to the set token page
    else {
      return NextResponse.next();
    }
  }
}
