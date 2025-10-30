import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import styles from "@/styles/verify-code.module.scss";

const PaymentResult = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { 
    rec_trade_id,      // TapPay 交易編號
    order_number,      // 訂單編號
    status,            // 交易狀態 (0=成功, 非0=失敗)
    auth_code,         // 授權碼
    bank_transaction_id // 銀行交易編號
  } = router.query;
  
  const [countdown, setCountdown] = useState(5);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // 等待路由參數準備好
    if (!router.isReady) return;

    console.log('📝 TapPay 3DS 回調參數:', {
      rec_trade_id,
      order_number,
      status,
      auth_code,
      bank_transaction_id
    });

    // 驗證 3DS 結果
    verify3DSResult();
  }, [router.isReady, rec_trade_id, status]);

  const verify3DSResult = async () => {
    try {
      // TapPay 狀態碼: 0 = 成功, 其他 = 失敗
      const isSuccess = status === '0';
      
      if (isSuccess && rec_trade_id) {
        console.log('✅ 3DS 驗證成功，交易編號:', rec_trade_id);
        
        // 可以選擇性地呼叫後端 API 確認訂單狀態
        // await verifyOrderStatus(order_number);
        
        setPaymentSuccess(true);
      } else {
        console.error('❌ 3DS 驗證失敗，狀態碼:', status);
        setPaymentSuccess(false);
        setErrorMessage(getErrorMessage(status));
      }
    } catch (error) {
      console.error('驗證 3DS 結果時發生錯誤:', error);
      setPaymentSuccess(false);
      setErrorMessage('驗證付款結果時發生錯誤');
    } finally {
      setIsVerifying(false);
    }
  };

  // 根據 TapPay 狀態碼返回錯誤訊息
  const getErrorMessage = (statusCode) => {
    const errorMessages = {
      '1': '3DS 驗證失敗',
      '2': '交易被拒絕',
      '3': '訂單不存在',
      '4': '交易逾時',
      '5': '系統錯誤',
    };
    return errorMessages[statusCode] || `付款失敗（錯誤代碼: ${statusCode}）`;
  };

  useEffect(() => {
    // 只有支付成功才倒數跳轉
    if (!paymentSuccess || isVerifying) return;

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
  }, [router, paymentSuccess, isVerifying]);

  // 載入中狀態
  if (isVerifying) {
    return (
      <div className="flex flex-col h-full gap-[30px] items-center justify-center text-center p-[20px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-[#01F2CF]"></div>
        <div className="text-[18px] text-gray-600">驗證付款結果中...</div>
      </div>
    );
  }

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

          {/* 顯示交易資訊 */}
          <div className="w-full max-w-md">
            <div className="text-[14px] text-left bg-gray-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">訂單編號:</span>
                <span className="font-medium">{order_number || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">交易編號:</span>
                <span className="font-medium">{rec_trade_id}</span>
              </div>
              {auth_code && (
                <div className="flex justify-between">
                  <span className="text-gray-600">授權碼:</span>
                  <span className="font-medium">{auth_code}</span>
                </div>
              )}
              {bank_transaction_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">銀行交易編號:</span>
                  <span className="font-medium text-xs">{bank_transaction_id}</span>
                </div>
              )}
            </div>
          </div>

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
            onClick={() => router.push("/profile")}
          >
            查看個人資料
          </button>
        </>
      ) : (
        <>
          <div className="text-[24px] font-bold text-red-500">✗ 付款失敗</div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <div className="text-6xl">😔</div>
          </div>

          <div className="text-[16px] text-gray-600">
            {errorMessage || '付款過程發生錯誤，請稍後再試'}
          </div>

          {/* 顯示錯誤詳情 */}
          <div className="w-full max-w-md">
            <div className="text-[14px] text-left bg-red-50 p-4 rounded-lg space-y-2">
              {order_number && (
                <div className="flex justify-between">
                  <span className="text-gray-600">訂單編號:</span>
                  <span className="font-medium">{order_number}</span>
                </div>
              )}
              {rec_trade_id && (
                <div className="flex justify-between">
                  <span className="text-gray-600">交易編號:</span>
                  <span className="font-medium">{rec_trade_id}</span>
                </div>
              )}
              {status && (
                <div className="flex justify-between">
                  <span className="text-gray-600">錯誤代碼:</span>
                  <span className="font-medium text-red-600">{status}</span>
                </div>
              )}
            </div>
          </div>

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
