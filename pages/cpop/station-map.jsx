import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import Image from "next/image";

import BottomBarCp from "@/image/icons/bottom_bar_cp.svg";
import ProfileIcon from "@/image/icons/profile.svg";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
// import MapCpIcon from "@/image/icons/map-cp.svg";
import StartChargeIcon from "@/image/icons/start_charge.svg";
import styles from "@/styles/login.module.scss";
import StationInfo from "@/components/station-info";
import CpInfoWrapper from "@/components/cp-info-wrapper";
import CpInfo from "@/components/cp-info";
import { getLastRecharge } from "@/client-api/recharge";
import { useSession } from "next-auth/react";
import Map from "@/components/Map";
import { setUserStatus } from '@/utils/storeTool'

import { currStationInfoState, currPSInfoState } from "@/atom/atomState";

const StationMap = () => {
  const {
    data: {
      user: { id: userId },
    },
  } = useSession();

  const [currStationInfo, setCurrStationInfo] =
    useRecoilState(currStationInfoState);
  const [currPSInfo, setCurrPSInfo] = useRecoilState(currPSInfoState);

  const [balance, setBalance] = useState(0);

  const router = useRouter();
  const navTo = (path) => {
    router.push(path);
  };

  const onBackClick = () => {
    setCurrPSInfo(null);
  };

  const checkWallet = () => {
    const minPoints = 100;
    if (balance >= minPoints) {
      navTo("cpop-code");
    } else {
      navTo("cpop-recharge");
    }
  };

  const fetchWalletBalance = async () => {
    await getLastRecharge(userId)
      .then((rsp) => {
        console.log(rsp);
        setBalance(rsp.balance);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  useEffect(() => {
    setUserStatus({
      userId,
      cpid: null,
      rid: null,
      appPath: "/cpop/station-map"
    })
    fetchWalletBalance();
  }, []);

  return (
    <>
      <div className="h-full">
        <style jsx>{`
          .map-bg {
            background: url("/images/bg-map.png") no-repeat;
            background-size: cover;
          }
          .bottom-bar {
            background: transparent url("/images/bottom_bar.png") no-repeat
              center;
             {
              /* background-position: bottom -20px left -27px; */
            }
             {
              /* border: 1px solid #4d4d4d; */
            }
          }
          .infoModal-box {
            box-shadow: 0px -4px 20px rgba(0, 0, 0, 0.1);
            border-radius: 16px 16px 0px 0px;
          }
        `}</style>

        <div className={`h-screen pb-[60px] w-full map-bg absolute`}>
          <Navbar hideBack/>
          <Map />
        </div>

        <div
          className="absolute overflow-hidden left-0 right-0 ml-auto mr-auto
              w-[334px] h-[122px] 
              flex flex-col gap-[30px] 
              text-center
              bottom-[5%]"
        >
          <div
            className="bottom-bar flex 
              w-[334px] h-[122px] 
              text-[#BDBDBD] text-[12px]"
          >
            <div className="flex items-center justify-center flex-1 h-full">
              <button
                className="flex flex-col items-center mt-[20px] ml-[15px]"
                onClick={() => navTo("station-list")}
              >
                <BottomBarCp />
                <p className="mt-2">充電站</p>
              </button>
            </div>
            <div className="flex-1">
              <button className="-mt-[4px]" onClick={checkWallet}>
                <StartChargeIcon />
                <p className="-mt-[22px]">啟動充電</p>
              </button>
            </div>
            <div className="flex items-center justify-center flex-1">
              <button
                className="flex flex-col items-center mt-[20px] mr-[15px]"
                onClick={() => navTo("/profile")}
              >
                <ProfileIcon />
                <p className="mt-2">個人中心</p>
              </button>
            </div>
          </div>
        </div>
        {currStationInfo && <StationInfo />}
        {currPSInfo && (
          <CpInfoWrapper onBackClick={onBackClick}>
            <CpInfo park={currPSInfo} />
          </CpInfoWrapper>
        )}
      </div>
    </>
  );
};

export default StationMap;

StationMap.getLayout = function getLayout(page) {
  return <Layout paddingNo={0} isMap={true} hideBack>{page}</Layout>;
};
