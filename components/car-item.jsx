import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";

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

const CarItem = ({ car }) => {
  const router = useRouter();
  const navTo = (path) => {
    router.push(path);
  };

  const { brand, carNo } = car;
  return (
    <div className="flex h-[65px] p-[15px] border-b-2 justify-between items-center w-full bg-white">
      <div className="text-[16px] font-medium">
        <div>{brand}</div>
      </div>
      <div>
        <div className="text-[16px] font-medium">{carNo}</div>
      </div>
    </div>
  );
};

export default CarItem;
