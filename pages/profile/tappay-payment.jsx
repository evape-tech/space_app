import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import styles from "@/styles/verify-code.module.scss";
import clsx from "clsx";

const TappayPayment = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const { amount, orderId, details } = router.query;

  const [loading, setLoading] = useState(false);
  const [canPay, setCanPay] = useState(false);
  const [cardholderName, setCardholderName] = useState("");
  const [cardholderEmail, setCardholderEmail] = useState("");
  const [cardholderPhone, setCardholderPhone] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && window.TPDirect) {
      // Step 2: 初始化 TapPay SDK（官方建議方式）
      window.TPDirect.setupSDK(
        parseInt(process.env.NEXT_PUBLIC_TAPPAY_APP_ID),
        process.env.NEXT_PUBLIC_TAPPAY_APP_KEY,
        process.env.NEXT_PUBLIC_TAPPAY_SERVER_TYPE || 'sandbox'
      );
      console.log('✅ TapPay SDK 初始化完成');

      // 信用卡支付需要設置 TapPay Fields
      window.TPDirect.card.setup({
        fields: {
          number: {
            element: '#card-number',
            placeholder: '**** **** **** ****'
          },
          expirationDate: {
            element: '#card-expiration-date',
            placeholder: 'MM / YY'
          },
          ccv: {
            element: '#card-ccv',
            placeholder: 'CCV'
          }
        },
        styles: {
          'input': {
            'color': 'gray',
            'font-size': '16px',
            'line-height': '24px',
            'padding': '10px',
            'border-radius': '8px'
          },
          'input.ccv': {
            'font-size': '16px'
          },
          ':focus': {
            'color': 'black'
          },
          '.valid': {
            'color': 'green'
          },
          '.invalid': {
            'color': 'red'
          }
        },
        isMaskCreditCardNumber: true,
        maskCreditCardNumberRange: {
          beginIndex: 6,
          endIndex: 11
        }
      });

      // 監聽卡片狀態變化
      window.TPDirect.card.onUpdate((update) => {
        if (update.canGetPrime) {
          setCanPay(true);
        } else {
          setCanPay(false);
        }
      });
    }
  }, []);

  const handlePayment = async () => {
    if (!canPay) {
      alert('請填寫完整的信用卡資訊');
      return;
    }

    if (!cardholderName || !cardholderEmail || !cardholderPhone) {
      alert('請填寫持卡人資訊');
      return;
    }

    setLoading(true);

    // 取得信用卡 Prime
    window.TPDirect.card.getPrime(async (result) => {
      if (result.status !== 0) {
        alert('取得付款資訊失敗: ' + result.msg);
        setLoading(false);
        return;
      }

      const prime = result.card.prime;
      console.log('✅ Prime 取得成功:', prime);
      console.log('📋 訂單資訊:', {
        amount: parseInt(amount),
        orderId: orderId,
        details: details || '充電站充值',
        name: cardholderName,
        email: cardholderEmail,
        phone: cardholderPhone,
        userId: session?.user?.id
      });

      try {
        // 呼叫後端 API 建立訂單並進行支付
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API || 'http://localhost:3000/api';
        const response = await fetch(`${baseUrl}/users/me/payment/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session?.accessToken}`,
            'ngrok-skip-browser-warning': 'true'
          },
          body: JSON.stringify({
            amount: parseInt(amount),
            description: details || '充電站充值',
            transactionId: orderId,
            paymentMethod: 'credit_card',
            metadata: {
              prime: prime,
              name: cardholderName,
              phone: cardholderPhone,
              email: cardholderEmail
            }
          }),
        });

        const data = await response.json();
        console.log('後端回應:', data);

        if (response.ok && data.success) {
          // 檢查是否需要 3D 驗證
          if (data.paymentUrl) {
            console.log('🔐 需要 3DS 驗證，跳轉到驗證頁面:', data.paymentUrl);
            // 需要 3D 驗證，重定向用戶到驗證頁面
            window.location.href = data.paymentUrl;
            // 注意：跳轉後 loading 狀態會保持，因為頁面會離開
          } else if (data.status === 'COMPLETED' || data.status === 'SUCCESS') {
            // 直接扣款成功（不需要 3DS）
            console.log('✅ 付款成功（無需 3DS）');
            alert('付款成功！');
            router.push('/');
          } else {
            // 其他成功狀態
            console.log('✅ 付款處理完成:', data.status);
            alert('付款成功！');
            router.push('/');
          }
        } else {
          // 付款失敗
          console.error('❌ 付款失敗:', data);
          alert('付款失敗: ' + (data.message || data.error || '未知錯誤'));
          setLoading(false); // 失敗時重置 loading，允許用戶重試
        }
      } catch (error) {
        console.error('Payment error:', error);
        alert('付款過程發生錯誤: ' + error.message);
        setLoading(false); // 錯誤時重置 loading
      }
    });
  };

  return (
    <div className="flex flex-col h-full gap-[20px] p-[20px]">
      <div className="text-[18px] font-medium mb-[10px]">信用卡付款 💳</div>
      
      <div className="flex flex-col gap-4">
        {/* 付款金額 */}
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="text-sm text-gray-600">付款金額</div>
          <div className="text-2xl font-bold text-[#01F2CF]">NT$ {amount}</div>
        </div>

        {/* 持卡人資訊 */}
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium">持卡人資訊</div>
          <input
            type="text"
            placeholder="姓名"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
          />
          <input
            type="email"
            placeholder="Email"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
            value={cardholderEmail}
            onChange={(e) => setCardholderEmail(e.target.value)}
          />
          <input
            type="tel"
            placeholder="手機號碼"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg p-2.5"
            value={cardholderPhone}
            onChange={(e) => setCardholderPhone(e.target.value)}
          />
        </div>

        {/* 信用卡表單 */}
        <div className="flex flex-col gap-3">
          <div className="text-sm font-medium">信用卡資訊</div>
          
          <div className="tpfield" id="card-number"></div>
          
          <div className="flex gap-3">
            <div className="tpfield flex-1" id="card-expiration-date"></div>
            <div className="tpfield flex-1" id="card-ccv"></div>
          </div>
        </div>

        {/* 測試卡號提示 */}
        {process.env.NEXT_PUBLIC_TAPPAY_SERVER_TYPE === 'sandbox' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs">
            <div className="font-medium text-yellow-800 mb-1">測試環境</div>
            <div className="text-yellow-700">
              測試卡號: 4242 4242 4242 4242<br />
              到期日: 任意未來日期<br />
              CVC: 任意 3 碼
            </div>
          </div>
        )}

        {/* 付款按鈕 */}
        <button
          type="button"
          className={`py-3 px-4 rounded-full w-full ${clsx(
            styles["btn-primary"],
            (!canPay || loading) && styles.disabled
          )}`}
          onClick={handlePayment}
          disabled={!canPay || loading}
        >
          {loading 
            ? '處理中...' 
            : `前往付款 NT$ ${amount}`
          }
        </button>

        <button
          type="button"
          className="py-3 px-4 rounded-full w-full bg-gray-200 text-gray-700"
          onClick={() => router.back()}
          disabled={loading}
        >
          取消
        </button>
      </div>

      <style jsx>{`
        .tpfield {
          height: 44px;
          width: 100%;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          padding: 10px;
          background: white;
        }
      `}</style>
    </div>
  );
};

export default TappayPayment;

TappayPayment.getLayout = function getLayout(page) {
  return (
    <Layout header={<Navbar title="付款" />}>
      {page}
    </Layout>
  );
};
