import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import styles from "@/styles/verify-code.module.scss";

const PaymentResult = () => {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // 倒數計時後自動跳轉
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/profile/recharge-history");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="flex flex-col h-full gap-[30px] items-center justify-center text-center p-[20px]">
      <div className="text-[24px] font-bold text-[#01F2CF]">✓ 付款成功</div>
      
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <Image
          src="/images/cp-done.png"
          alt="Payment Success"
          width={200}
          height={200}
        />
      </div>

      <div className="text-[16px]">
        您的充值已經完成！
      </div>

      <div className="text-[14px] text-gray-500">
        {countdown} 秒後自動跳轉到充值記錄...
      </div>

      <button
        type="button"
        className={`py-3 px-6 rounded-full ${styles["btn-primary"]}`}
        onClick={() => router.push("/profile/recharge-history")}
      >
        立即查看充值記錄
      </button>

      <button
        type="button"
        className="py-3 px-6 rounded-full bg-gray-200 text-gray-700"
        onClick={() => router.push("/cpop/station-map")}
      >
        返回地圖
      </button>
    </div>
  );
};

export default PaymentResult;

PaymentResult.getLayout = function getLayout(page) {
  return (
    <Layout header={<Navbar title="付款結果" hideBack />}>
      {page}
    </Layout>
  );
};
