import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import { cpRoundCheckout } from "@/client-api/cp";
import { getUserStatus } from '@/utils/storeTool'
import { payPointFee } from "@/client-api/user";
import { useSession } from "next-auth/react";
import { getLastRecharge } from "@/client-api/recharge";
import dayjs from "dayjs";
import { updateUserStatus } from "@/utils/storeTool";

const CpopEndup = () => {
  const router = useRouter();
  const cpId = useRef(null);
  const roundId = useRef(null);
  const [endupData, setEndupData] = useState(null);

  //   {
  //     "kWh": 1.28,
  //     "fee": "12.8",
  //     "startTime": "2023-03-19T04:19:23.768Z",
  //     "endTime": "2023-03-19T04:19:39.945Z",
  //     "cpile": {
  //         "name": "charger 1001"
  //     },
  //     "station": {
  //         "name": "station 1"
  //     }
  // }

  const {
    data: {
      user: { id: userId },
    },
  } = useSession();

  const checkoutSummery = () => {
    return new Promise((resolve, reject) => {
      cpRoundCheckout(roundId.current)
        .then(async (rsp) => {
          resolve(rsp);
        })
        .catch((err) => {
          console.log(err.message);
          reject(err);
        });
    });
  };

  const fetchEndupData = () => {
    setTimeout(async () => {
      let state = await checkoutSummery();
      setEndupData(state);
      updateUserStatus({ rid: null }) // cleanRound
    }, 500);
  };

  useEffect(() => {
    const { cpid, rid } = getUserStatus()

    if (cpid) cpId.current = cpid;
    if (rid) roundId.current = rid;

    fetchEndupData();
  }, []);

  return (
    <div className="flex flex-col h-full gap-[30px] items-center text-center">
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

      <div className="mt-[10%] mb-[30px]">
        <div className="text-[18px] font-medium mb-[15px]">充電完成</div>
        <Image
          src="/images/cp-done.png"
          alt="Picture of the author"
          width={500}
          height={500}
        />
        <div className="p-[27px]">
          <div
            className="charging-info text-center
        border-[1px] border-white/60
        flex justify-around items-center"
          >
            <div className="border-r-2 border-[#4F4F4F] flex-1">
              <div className="text-[22px]">
                {endupData && endupData?.kWh
                  ? Number.parseFloat(endupData?.kWh).toFixed(1)
                  : "0.0"}{" "}
                KW
              </div>
              {/* 設備功率是data2 x data3 / 1000 , 如7.87 x 228.0 / 1000 = 1.79 KW */}
              <span className="text-[#01F2CF] text-[13px]">設備功率</span>
            </div>
            {/* <div className="border-r-2 border-[#4F4F4F] flex-1">
              <div className="text-[22px]">3.1度</div>
              <span className="text-[#01F2CF] text-[13px]">已充電量</span>
            </div> */}
            <div className="border-r-2 border-[#4F4F4F] flex-1">
              <div className="text-[22px]">
                {Math.trunc(endupData?.fee) || 0} 元
              </div>
              <span className="text-[#01F2CF] text-[13px]">預估金額</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-[13px] my-[30px]">
            <div className="flex justify-between">
              <span>一般費率</span> <span>{Math.trunc(endupData?.fee)}</span>
            </div>
            <div className="flex justify-between">
              <span>新會員優惠</span> <span>-0</span>
            </div>
            <div className="flex justify-between">
              <span>訂單金額</span> <span>{Math.trunc(endupData?.fee)}</span>
            </div>

            <hr />

            <div className="flex justify-between">
              <span>充電時間</span>{" "}
              <span>{`${dayjs(endupData?.startTime).format(
                "YYYY/MM/DD HH:mm"
              )}~${dayjs(endupData?.endTime).format("HH:mm")}`}</span>
            </div>
            <div className="flex justify-between">
              <span>充電站</span> <span>{endupData?.station?.name}</span>
            </div>
            <div className="flex justify-between">
              <span>充電樁編號</span> <span>{cpId.current}</span>
            </div>
          </div>

          <button
            type="button"
            className={`py-2 px-4 rounded-full w-full  ${styles["btn-primary"]}`}
            // onClick={() => router.push("cpop-recharge")}
            onClick={() => {
              router.push("station-map");
            }}
          >
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

export default CpopEndup;

CpopEndup.getLayout = function getLayout(page) {
  return (
    <Layout darkMode header={<Navbar backUrl={"station-map"} hideBack />}>
      {page}
    </Layout>
  );
};
