import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import { getUserStatus } from '@/utils/storeTool'
import { payPointFee, getChargeTxLastestFromBackend, getChargeTariffsFromBackend } from "@/client-api/user";
import { useSession } from "next-auth/react";
import { getLastRecharge } from "@/client-api/recharge";
import dayjs from "@/utils/dayjs";
import { updateUserStatus } from "@/utils/storeTool";
import request from "@/utils/request";


const CpopEndup = () => {
  const router = useRouter();
  const cpId = useRef(null);
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

  const { data: session } = useSession();
  const userId = session?.user?.id;

  const checkoutSummery = async () => {
    try {
      // Get the latest completed charging transaction using session token
      const rsp = await getChargeTxLastestFromBackend(session?.accessToken);

      // Return both responses as a pair (similar to Kotlin Pair)
      return { transaction: rsp};
    } catch (err) {
      console.log("checkoutSummery error:", err.message);
      throw err;
    }
  };

  const fetchEndupData = () => {
    setTimeout(async () => {
      try {
        const { transaction: response} = await checkoutSummery();
        // Parse the new JSON format - transaction is at top level now
        const transaction = response?.transaction;
        const realtimeCost = transaction?.realtime_cost;
        
        if (transaction) {
          // 從 realtime_cost 獲取真實費用
          const feeAmount = realtimeCost?.estimated_total || 0;
          
          // Map to the format expected by UI
          const state = {
            kWh: transaction.energy_consumed || 0, // 充电度数
            fee: feeAmount, // 從 realtime_cost.estimated_total 獲取
            startTime: transaction.start_time,
            endTime: transaction.end_time,
            transactionId: transaction.transaction_id,
            cpid: transaction.cpid,
            cpsn: transaction.cpsn,
            chargingDuration: transaction.charging_duration || 0, // 充电时长（秒）
            meterStart: transaction.meter_start || 0,
            meterStop: transaction.meter_stop || 0,
            tariffName: realtimeCost?.tariff_name || '', // 電價名稱
            tariffType: realtimeCost?.tariff_type || '', // 電價類型
            energyFee: realtimeCost?.energy_fee || 0, // 能源費用
            discountAmount: realtimeCost?.discount_amount || 0, // 折扣金額
            station: {
              name: `充电站 ${transaction.cpid}` // 可以根据需要调整
            },
            cpile: {
              name: `充电桩 ${transaction.cpsn}`
            }
          };
          setEndupData(state);
        }
      } catch (error) {
        console.log("fetchEndupData error:", error);
      }
    }, 500);
  };

  useEffect(() => {
    const { cpid } = getUserStatus()

    if (cpid) cpId.current = cpid;

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
                {endupData?.kWh?.toFixed(2) || "0.00"} 度
              </div>
              <span className="text-[#01F2CF] text-[13px]">已充電量</span>
            </div>
            <div className="border-r-2 border-[#4F4F4F] flex-1">
              <div className="text-[22px]">
                {Math.round(endupData?.fee) || 0} 元
              </div>
              <span className="text-[#01F2CF] text-[13px]">充電金額</span>
            </div>
          </div>
          <div className="flex flex-col gap-2 text-[13px] my-[30px]">
            <div className="flex justify-between">
              <span>一般費率</span> <span>{Math.round(endupData?.energyFee) || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>新會員優惠</span> <span>-{Math.round(endupData?.discountAmount) || 0}</span>
            </div>
            <div className="flex justify-between">
              <span>訂單金額</span> <span>{Math.round(endupData?.fee) || 0}</span>
            </div>

            <hr />

            <div className="flex justify-between">
              <span>充電時間</span>{" "}
              <span>{endupData?.startTime && endupData?.endTime ? `${dayjs.utc(endupData?.startTime).local().format(
                "YYYY/MM/DD HH:mm"
              )}~${dayjs.utc(endupData?.endTime).local().format("HH:mm")}` : '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>充電站</span> <span>{endupData?.station?.name || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span>充電樁編號</span> <span>{endupData?.cpid || cpId.current}</span>
            </div>
            <div className="flex justify-between">
              <span>交易編號</span> <span>{endupData?.transactionId || '-'}</span>
            </div>
            {endupData?.tariffName && (
              <div className="flex justify-between">
                <span>電價方案</span> <span>{endupData.tariffName}</span>
              </div>
            )}
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
