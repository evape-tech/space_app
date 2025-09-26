// import Navbar from './navbar'
import Footer from "./footer";
import { useRouter } from "next/router";
import { signOut, useSession } from "next-auth/react";
import { deleteUserStatus, getUserStatus, updateUserStatus } from '@/utils/storeTool'
import { useEffect } from "react";
import { setUserStatus } from '@/utils/storeTool'

export default function Layout({
  children,
  header,
  paddingNo = 27,
  darkMode = false,
  isMap = false
}) {
  const { data, status } = useSession();
  // console.log("zevi", data);
  const router = useRouter();
  const { asPath } = router;

  if (status === "loading") {
    /**
     * Session is being fetched
     */
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    deleteUserStatus() // clean userStatus

    router.push({
      pathname: "/auth/login",
      query: { callbackUrl: `${window.location.origin}` + asPath },
    });
    return null;
  }

  if (status === "authenticated") {
    const { userId, cpid, rid, appPath } = getUserStatus()
    if (userId) {
      const { id: currentUserId } = data.user
      if ((userId !== currentUserId)) {
        // reset
        setUserStatus({
          userId,
          cpid: null,
          rid: null,
          appPath: "/cpop/station-map"
        })
        if (asPath !== appPath) {
          console.log('push', appPath);
          router.push(appPath)
        }
      }
      else // same userId. 
      {
        if (appPath === "/cpop/cpop-charging" && cpid && rid) {
          if (asPath !== appPath) {
            console.log('push', appPath);
            router.push(appPath)
          }
        }
      }
    }
  }

  return (
    <div
      className={`
        w-full flex flex-col h-screen
        border-[1px]
        ${darkMode ? "bg-[#141B23] text-white" : "text-[#333333]"}
        ${(isMap) ? 'overflow-hidden' : 'overflow-auto'}
      `}
    >
      {/* <Navbar /> */}

      {header}
      <main>
        <div className="h-full" style={{ padding: paddingNo }}>
          {children}
        </div>
      </main>
      {/* <Footer /> */}
    </div>
  );
}
