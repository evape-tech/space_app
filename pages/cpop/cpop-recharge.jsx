import { useEffect } from "react";
import Image from "next/image";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";

const CpopRecharge = () => {
  const router = useRouter();

  return (
    <div
      className="flex flex-col h-full gap-[30px] 
      items-center text-center
     "
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

      <div className="mt-[100px] mb-[30px]">
        <div className="text-[18px] font-medium mb-[15px]">您的餘額不足</div>
        <div>請立即充值您的錢包...</div>
        <Image
          src="/images/cp-icon.png"
          alt="Picture of the author"
          width={500}
          height={500}
        />
        <div className="p-[27px]">
          <button
            type="button"
            className={`py-2 px-4 rounded-full w-full  ${styles["btn-primary"]}`}
            onClick={() => router.push("/profile/recharge")}
          >
            立即充值
          </button>
        </div>
      </div>
    </div>
  );
};

export default CpopRecharge;

CpopRecharge.getLayout = function getLayout(page) {
  return (
    <Layout darkMode header={<Navbar backUrl={"station-map"} />}>
      {page}
    </Layout>
  );
};
