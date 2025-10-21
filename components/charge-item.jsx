import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import dayjs from "dayjs";

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

const ChargeItem = ({ charge }) => {
  const router = useRouter();
  const navTo = (path) => {
    router.push(path);
  };

  // Adapt to new API format
  const startTime = charge.start_time;
  const endTime = charge.end_time;
  const energy_consumed = charge.energy_consumed || 0;
  const cpid = charge.cpid;
  const transactionId = charge.transaction_id;

  const mins = dayjs(endTime).diff(dayjs(startTime), "minutes");
  
  return (
    <div className="flex  p-[15px] border-b-2 justify-between items-center w-full bg-white">
      <div className="text-[#828282] text-[15px]">
        <div>{dayjs(startTime).format("YYYY/MM/DD")}</div>
        <div>{dayjs(startTime).format("HH:mm:ss")}</div>
        {cpid && <div className="text-[12px] mt-1">充電樁: {cpid}</div>}
      </div>
      <div className="text-right">
        <div className="text-[17px] font-medium">充電 {mins}分鐘</div>
        <p className="text-[15px] text-[#BDBDBD]">充電度數 {energy_consumed.toFixed(2)}</p>
        {transactionId && (
          <p className="text-[11px] text-[#E0E0E0] mt-1">
            {transactionId}
          </p>
        )}
      </div>
    </div>
  );
};

export default ChargeItem;
