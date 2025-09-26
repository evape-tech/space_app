import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { signOut } from "next-auth/react";
// import DirectionIcon from "@/image/icons/direction.svg";
// import ListCpIcon from "@/image/icons/list-cp.svg";
// import ParkingIcon from "@/image/icons/parking.svg";

import { useRouter } from "next/router";

// {
//   id: 2,
//   stationName: "abc 充電站",
//   km: 2,
//   spaces: 5,
// },

const MenuItem = ({ menu }) => {
  const router = useRouter();
  const navTo = (path) => {
    if (navPath === "logout") {
      signOut({
        callbackUrl: `${window.location.origin}`,
      });
    } else {
      router.push(path);
    }
  };

  const { title, navPath } = menu;
  return (
    <button
      onClick={() => navTo(navPath)}
      className="flex p-[15px] border-b-2 justify-between items-center w-full bg-white"
    >
      <div>{title}</div>
    </button>
  );
};

export default MenuItem;
