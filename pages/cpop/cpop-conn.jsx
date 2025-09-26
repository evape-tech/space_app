import { useEffect, useState } from "react";
import Image from "next/image";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import { CpStatusEnum } from "@/types/index";
import { cpCmd } from "@/client-api/cp";
import { getUserStatus } from '@/utils/storeTool'

const CpopStart = () => {
  const router = useRouter();
  let cpInterval = null;
  let counter = 0;
  const { cpid } = getUserStatus()

  const getCpStatus = () => {
    return new Promise((resolve, reject) => {
      cpCmd("get_cp_status", cpid)
        .then((rsp) => {
          console.log(rsp);
          //參數有:Charging,Preparing,Available
          resolve(rsp.current_status);
        })
        .catch((err) => reject(err));
    });
  };

  const checkCpStatus = async () => {
    let state = await getCpStatus();
    counter++;
    console.log("wait for cp plugin -- ", counter, state);
    // wait for 30 sec. 10 times fail.
    if (counter > 10) {
      counter = 0;
      clearInterval(cpInterval);
      router.push("cpop-cancel");
    }
    if (state === CpStatusEnum.Preparing) {
      clearInterval(cpInterval);
      router.push("cpop-charging");
    }
  };

  const polling = () => {
    cpInterval = setInterval(() => {
      checkCpStatus();
    }, 3000); //3sec
    checkCpStatus();
  };

  useEffect(() => {
    polling();
    return () => {
      clearInterval(cpInterval);
    };
  }, []);

  return (
    <div
      className="flex flex-col h-full gap-[30px] 
      items-center text-center
     "
    >
      <div className="mt-[100px] mb-[30px]">
        <div className="text-[18px] font-medium mb-[15px]">等待連線</div>
        <div>
          裝置正在連線請耐心等待...
          {/* <br />
          <button
            onClick={() => {
              router.push("cpop-cancel");
            }}
          >
            下一步
          </button> */}
        </div>
      </div>
      <Image
        src="/images/cp-conn.png"
        alt="Picture of the author"
        width={250}
        height={250}
      />
    </div>
  );
};

export default CpopStart;

CpopStart.getLayout = function getLayout(page) {
  return (
    <Layout darkMode header={<Navbar backUrl={"station-map"} />}>
      {page}
    </Layout>
  );
};
