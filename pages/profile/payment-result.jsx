import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Image from "next/image";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import styles from "@/styles/verify-code.module.scss";

const PaymentResult = () => {
  const router = useRouter();
  const { rec_trade_id, order_number, status, bank_transaction_id } = router.query;
  
  const [countdown, setCountdown] = useState(5);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    // 檢查支付狀態（從 TapPay 跳轉回來時會帶 status 參數）
    if (status !== undefined) {
      setPaymentSuccess(status === '0');
    } else {
      // 如果沒有 status 參數，預設為成功（從信用卡支付跳轉）
      setPaymentSuccess(true);
    }
  }, [status]);

  useEffect(() => {
    // 只有支付成功才倒數跳轉
    if (!paymentSuccess) return;

    // 倒數計時後自動跳轉
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router, paymentSuccess]);

  return (
    <div className="flex flex-col h-full gap-[30px] items-center justify-center text-center p-[20px]">
      {paymentSuccess ? (
        <>
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

          {/* 顯示交易資訊（如果有從 TapPay 跳轉回來的參數） */}
          {rec_trade_id && (
            <div className="text-[12px] text-gray-500 bg-gray-50 p-3 rounded">
              <div>訂單編號: {order_number || 'N/A'}</div>
              <div>交易編號: {rec_trade_id}</div>
            </div>
          )}

          <div className="text-[14px] text-gray-500">
            {countdown} 秒後自動跳轉到首頁...
          </div>

          <button
            type="button"
            className={`py-3 px-6 rounded-full ${styles["btn-primary"]}`}
            onClick={() => router.push("/")}
          >
            立即返回首頁
          </button>

          <button
            type="button"
            className="py-3 px-6 rounded-full bg-gray-200 text-gray-700"
            onClick={() => router.push("/profile/recharge-history")}
          >
            查看充值記錄
          </button>
        </>
      ) : (
        <>
          <div className="text-[24px] font-bold text-red-500">✗ 付款失敗</div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-6xl">😔</div>
          </div>

          <div className="text-[16px] text-gray-600">
            付款過程發生錯誤，請稍後再試
          </div>

          {bank_transaction_id && (
            <div className="text-[12px] text-gray-500 bg-gray-50 p-3 rounded">
              <div>交易編號: {bank_transaction_id}</div>
            </div>
          )}

          <button
            type="button"
            className={`py-3 px-6 rounded-full ${styles["btn-primary"]}`}
            onClick={() => router.push("/profile/recharge")}
          >
            重新充值
          </button>

          <button
            type="button"
            className="py-3 px-6 rounded-full bg-gray-200 text-gray-700"
            onClick={() => router.push("/")}
          >
            返回首頁
          </button>
        </>
      )}
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
