import { useRecoilState } from "recoil";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import ArrowRightIcon from "@/image/icons/chevron-left.svg";
import DotIcon from "@/image/icons/dot.svg";
import DotIconGray from "@/image/icons/dot_gray.svg";
import { currPSInfoState } from "@/atom/atomState";

import { useRouter } from "next/router";

// {
//   id: 2,
//   stationName: "abc 充電站",
//   km: 2,
//   spaces: 5,
// },

const CpItem = ({ park }) => {
  const router = useRouter();
  // const navTo = (path) => {
  //   router.push(path);
  // };

  const [, setCurrPSInfo] = useRecoilState(currPSInfoState);

  const { cpIdKey, kW, chargerFee,
    available
  } = park;
  return (
    <div
      className="flex p-[10px] border-b-2 justify-between items-center w-full bg-white"
      onClick={() => setCurrPSInfo(park)}
    >
      <div>
        <span>{cpIdKey}</span> {kW} kW <br />
        <span>
          {"平面"} - {cpIdKey} 號車格
        </span>
      </div>
      <div className="flex items-center">
        {
          available ? (
            <>
              <DotIcon /> &nbsp; 可使用
            </>
          ) : (
            <>
              <DotIconGray /> &nbsp; 停用
            </>
          )

        }

        <ArrowRightIcon />
      </div>
    </div>
  );
};

export default CpItem;
