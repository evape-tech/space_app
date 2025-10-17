import { useState, useEffect, useRef } from "react";
import clsx from "clsx";
import Image from "next/image";
import styles from "@/styles/verify-code.module.scss";
import chargingStyles from "@/styles/charging.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import { CpStatusEnum } from "@/types/index";
import { cpCmd, cpStartCmd, cpReport } from "@/client-api/cp";
import { getUserStatus, updateUserStatus, setUserStatus } from '@/utils/storeTool'

import PowerIcon from "@/image/icons/Power.svg";
import CpCharging from "@/image/icons/cp-charging.svg";
import { useSession } from "next-auth/react";
import { cpRoundStart, getCpByKey, cpCmdFromBackend, cpStartCmdFromBackend, cpStopCmdFromBackend, getCpidByKeyFromBackend } from "@/client-api/cp";

const CpopCharging = () => {
  const router = useRouter();
  const { data, status } = useSession();
  const userId = data?.user?.id;
  const userUuid = data?.user?.uuid;
  const cpId = useRef(null);
  const cpStatus = useRef(null);

  let cpInterval = null;
  const [loading, setLoading] = useState(true);
  const [chargingData, setChargingData] = useState(null);

  // check cp status from db.
  // const getDBCpStatus = () => {
  //   return new Promise((resolve, reject) => {
  //     cpReport(cpId.current)
  //       .then((rsp) => {
  //         resolve(rsp);
  //       })
  //       .catch((err) => {
  //         console.log(err);
  //         reject(err);
  //       });
  //   });
  // };

  const getCpStatus = () => {
    return new Promise((resolve, reject) => {
      cpCmdFromBackend("get_cp_status", cpId.current)
        .then((rsp) => {
          console.log(rsp);
          //參數有:Charging,Preparing,Available
          resolve(rsp);
        })
        .catch((err) => reject(err));
    });
  };

  const getStationId = async () => {
    return new Promise((resolve, reject) => {
      getCpidByKeyFromBackend(cpId.current)
        .then((rsp) => resolve(rsp.stationId))
        .catch((err) => reject(err));
    });
  };

  const roundStart = async () => {
    const stationId = await getStationId(cpId.current);
    const body = {
      stationId,
      cpIdKey: cpId.current,
      userId: userId,
    };
    cpRoundStart(body) // log start.
      .then((rsp) => {
        console.log(rsp);
      })
      .catch((err) => {
        console.log(err.message);
      });
  };

  // polling
  const polling = () => {
    setTimeout(() => {
      cpInterval = setInterval(() => {
        checkCpStatus();
        console.log("current status -- ", cpStatus.current);
      }, 3000); //3sec
      checkCpStatus();
    }, 1000);
  };

  const checkCpStatus = async () => {
    const cpState = await getCpStatus();
    const state = {
      cpIdKey: cpState.cpid,
      cp_online: cpState.cp_online,
      current_status: cpState.current_status,
      currentkWh: +cpState.data1,
      eA: +cpState.data2,
      eV: +cpState.data3,
    }
    setChargingData(state);

    cpStatus.current = state.current_status;
    if (cpStatus.current !== CpStatusEnum.Charging) {
      if (
        cpStatus.current === CpStatusEnum.Available ||
        cpStatus.current === CpStatusEnum.Finishing
      ) {
        clearInterval(cpInterval); // leave page.
        updateUserStatus({ appPath: "/cpop/station-map" })
        router.push("cpop-endup");
      }
    }
  };

  const cpStart = async () => {
    console.log("CpopCharging cpStart =>", JSON.stringify(data, null, 2));
    cpStartCmdFromBackend(userUuid, cpId.current)
      .then(async (rsp) => {
        console.log(rsp);
        try {
          await roundStart();
          polling();
        } catch (error) {
          console.log(error.message);
        } finally {
          setLoading(false);
        }
      })
      .catch((err) => console.log(err.message));
  };

  const cpStop = async () => {
    // stop polling immediately
    try {
      if (cpInterval) clearInterval(cpInterval);
    } catch (e) {
      // ignore
    }

    try {
      const rsp = await cpStopCmdFromBackend(userUuid, cpId.current);
      console.log("cpStop response:", JSON.stringify(rsp, null, 2));

      // update user status and navigate to end page
      updateUserStatus({ appPath: "/cpop/station-map" });
      setUserStatus({ userId, cpid: null, appPath: "/cpop/station-map" });
      router.push("cpop-endup");
    } catch (err) {
      console.log(err?.message || err);
      // ensure we still navigate/cleanup on error
      setUserStatus({ userId, cpid: null, appPath: "/cpop/station-map" });
      router.push("cpop-endup");
    }
  };

  // Available
  // Preparing
  // Charging
  // Finishing

  useEffect(() => {
    // map, charging only charging keep the path.
    updateUserStatus({ appPath: "/cpop/cpop-charging" })
    const { cpid } = getUserStatus()
    console.log("CpopCharging cpid:", cpid);
    if (cpid) cpId.current = cpid;
    
    console.log("CpopCharging start charging");
    cpStart();

    return () => {
      clearInterval(cpInterval);
    };
  }, []);

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <div
      className="flex flex-col gap-[30px] 
      items-center text-center h-full relative"
    >
      <style jsx>
        {`
          .charging-info {
            width: 322px;
            height: 90px;

            background: linear-gradient(
              107.95deg,
              rgba(255, 255, 255, 0.07) 0%,
              rgba(255, 250, 250, 0) 83.15%
            );
            filter: drop-shadow(0px 3px 32.25px rgba(0, 0, 0, 0.25));
            backdrop-filter: blur(5.78207px);
            /* Note: backdrop-filter has minimal browser support */

            border-radius: 12px;
          }
        `}
      </style>
      <div className="mt-[20%] mb-[30px]">
        <div className="flex justify-between mb-[10px]">
          <div className="flex">
            <CpCharging />
            &nbsp;&nbsp;充電中
          </div>
          <div>資料回傳可能延遲</div>
        </div>
        <div
          className="charging-info text-center
        border-[1px] border-white/60
        flex justify-around items-center"
        >
          <div className="border-r-2 border-[#4F4F4F] flex-1">
            <div className="text-[22px]">
              {chargingData
                ? Number.parseFloat(
                  (chargingData.eA * chargingData.eV) / 1000
                ).toFixed(1)
                : "0.0"}{" "}
              KW
            </div>
            {/* 設備功率是data2 x data3 / 1000 , 如7.87 x 228.0 / 1000 = 1.79 KW */}
            <span className="text-[#01F2CF] text-[13px]">設備功率</span>
          </div>
          <div className="border-r-2 border-[#4F4F4F] flex-1">
            <div className="text-[22px]">
              {chargingData?.currentkWh || 0} 度
            </div>
            <span className="text-[#01F2CF] text-[13px]">已充電量</span>
          </div>
          <div className="border-r-2 border-[#4F4F4F] flex-1">
            <div className="text-[22px]">
              {Math.trunc(chargingData?.currentkWh * 10) || 0} 元
            </div>
            <span className="text-[#01F2CF] text-[13px]">預估金額</span>
          </div>
        </div>
      </div>
      <div className="w-full max-h-[500px]">
        <div className="mx-auto w-max-[500px] relative">
          <Image
            src="/images/cp-charging-car.png"
            alt="Picture of the author"
            width={500}
            height={500}
          />
          <Image
            src="/images/lightning.png"
            alt="Picture of the author"
            width={30}
            height={30}
            className={clsx(chargingStyles.breathing,
              "absolute bottom-[30%] right-[12%]")}
          />
        </div>
      </div>

      <div className="">
        <button
          className={`rounded-full w-full ${clsx(
            styles["btn-primary"],
            styles["round-wrapper-dark"]
          )} flex items-center text-[15px]`}
          onClick={cpStop}
        >
          <PowerIcon />
          &nbsp;&nbsp;結束充電
        </button>
      </div>
    </div>
  );
};

export default CpopCharging;

CpopCharging.getLayout = function getLayout(page) {
  return (
    <Layout darkMode header={<Navbar backUrl={"station-map"} hideBack />}>
      {page}
    </Layout>
  );
};
