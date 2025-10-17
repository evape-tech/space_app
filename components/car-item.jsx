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

  // Support both legacy shape { brand, carNo } and backend vehicles { modelName, licensePlate }
  const displayLeft = car.brand || car.modelName || (car.brand && car.brand.name) || "";
  const displayRight = car.carNo || car.licensePlate || "";

  return (
    <div className="flex h-[65px] p-[15px] border-b-2 justify-between items-center w-full bg-white">
      <div className="text-[16px] font-medium">
        <div>{displayLeft}</div>
      </div>
      <div>
        <div className="text-[16px] font-medium">{displayRight}</div>
      </div>
    </div>
  );
};

export default CarItem;
