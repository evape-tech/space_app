import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import {useRouter} from "next/router";
import {useState} from "react";
import clsx from "clsx";
import {useSession} from "next-auth/react";
import dayjs from "dayjs";
import { createPaymentOrderFromBackend } from '@/client-api/recharge';
import Image from "next/image";

const ShowHTML = ({html}) => {
  // const html = "<h1>hello</h1>";
  return <iframe srcDoc={html} className="h-full"></iframe>;
};

const Recharge = () => {
  const router = useRouter();

  const {data: session} = useSession();

  const [points, setPoints] = useState(100);
  const [inputValid, setInputValid] = useState(true);
  const [selectedPayment, setSelectedPayment] = useState(""); // 每次進入頁面都沒有預設選擇
  const [loading, setLoading] = useState(false);

  // 支付方式選項 - TapPay 支援的通道
  const paymentMethods = [
    {id: "tappay_credit", name: "信用卡", icon: "/images/ic_credit_card.png", description: "Visa / Master / JCB", isImage: true},
    {id: "tappay_linepay", name: "LINE Pay", icon: "/images/ic_line_pay.png", description: "LINE Pay 付款", isImage: true},
    {id: "direct_linepay", name: "LINE Pay (直連)", icon: "/images/ic_line_pay.png", description: "LINE Pay 付款（直連）", isImage: true},
    {id: "tappay_easywallet", name: "悠游付", icon: "/images/ic_easy_wallet.png", description: "悠遊卡 Easy Wallet", isImage: true},
  ];

  const validInput = (v) => {
    if (v >= 1) setInputValid(true);
    else setInputValid(false);
  };

  const handleInput = (e) => {
    const no = e.target.value;
    setPoints(no);
    validInput(no);
  };

  const genOrderTxNo = () => {
    // 直接產生訂單號，不呼叫 API/DB
    const dayFormat = dayjs().format("YYMMDD");
    // 取 3 位隨機數字（可改用 userId/時間戳/uuid）
    const random = Math.floor(100 + Math.random() * 900); // 100~999
    return `Z${dayFormat}${random}`;
  };

  const initTapPaySDK = () => {
    if (typeof window === "undefined") {
      console.error('❌ Window is undefined');
      alert('環境不支持，請稍後再試');
      return false;
    }

    if (!window.TPDirect) {
      console.error('❌ TapPay SDK 尚未載入', {
        hasWindow: !!window,
        hasTPDirect: !!window.TPDirect,
        windowKeys: Object.keys(window).filter(k => k.includes('TP') || k.includes('tap'))
      });
      alert('付款元件尚未載入，請稍後再試');
      return false;
    }

    try {
      console.log('🔧 TapPay SDK 初始化參數:', {
        appId: process.env.NEXT_PUBLIC_TAPPAY_APP_ID,
        serverType: process.env.NEXT_PUBLIC_TAPPAY_SERVER_TYPE
      });

      window.TPDirect.setupSDK(
        parseInt(process.env.NEXT_PUBLIC_TAPPAY_APP_ID),
        process.env.NEXT_PUBLIC_TAPPAY_APP_KEY,
        process.env.NEXT_PUBLIC_TAPPAY_SERVER_TYPE
      );
      console.log('✅ TapPay SDK 初始化完成');
      return true;
    } catch (error) {
      console.error('❌ TapPay SDK 初始化失敗:', error);
      alert('付款初始化失敗: ' + error.message);
      return false;
    }
  };

  const handleRecharge = async () => {
    const orderTxNo = genOrderTxNo();
    // 本地組合 orderData，僅用於支付流程
    const orderData = {
      orderNo: orderTxNo,
      userId: session?.user?.id,
      qty: +points,
      unitPrice: 1,
      amount: +points * 1,
      status: "unpaid"
    };

    setLoading(true);

    // 初始化 TapPay SDK
    if (!initTapPaySDK()) {
      setLoading(false);
      return;
    }

    // 根據選擇的支付方式分支處理
    switch (selectedPayment) {
      case "tappay_linepay": {
        console.log('Entering LINE Pay case');
        // LINE Pay - 導向 TapPay 支付頁面
        const paymentMethod = 'tappay_linepay';

        console.log(`🔄 ${paymentMethod} 支付流程開始，金額:`, orderData.amount);

        // 直接取得 LINE Pay Prime（不需要任何表單）
        window.TPDirect.linePay.getPrime(async (result) => {
          console.log('LINE Pay getPrime result:', JSON.stringify(result, null, 2));

          if (!result || result.status !== 0) {
            alert('取得 LINE Pay 付款資訊失敗: ' + (result?.msg || '未知錯誤'));
            setLoading(false);
            return;
          }
          const prime = result.prime;
          console.log('✅ LINE Pay Prime 取得成功:', prime);

          try {
            // 將 Prime 交給後端
            const paymentData = {
              amount: parseInt(orderData.amount),
              description: '充電站充值',
              transactionId: orderTxNo,
              paymentMethod: paymentMethod,
              metadata: {
                prime: prime,
                result_url: {
                  frontend_redirect_url: `${window.location.origin}/profile/payment-result`,
                  backend_notify_url: `${process.env.NEXT_PUBLIC_BACKEND_API}/payment/tappay-callback`
                }
              }
            };
            const data = await createPaymentOrderFromBackend(session?.accessToken, paymentData);
            console.log('後端回應:', data);
            // 支援不同命名的 payment url
            const paymentUrl = data?.payment_url;
            if (paymentUrl) {
              console.log('🔗 跳轉到 LINE Pay 支付頁面:', paymentUrl);
              window.location.href = paymentUrl;
              return; // 已跳轉，結束
            }
            if (data.success) {
              alert('付款成功！');
              router.push('/');
              return;
            }
            alert('付款失敗: ' + (data.message || '未知錯誤'));
            setLoading(false);
          } catch (error) {
            console.error('LINE Pay error:', error);
            alert('付款過程發生錯誤: ' + error.message);
            setLoading(false);
          }
        });
        return;
      }

      case "direct_linepay": {
        console.log('Entering LINE Pay direct case');
        const paymentMethod = 'direct_linepay';

        console.log(`🔄 ${paymentMethod} 支付流程開始，金額:`, orderData.amount);

        try {
          const paymentData = {
            amount: parseInt(orderData.amount),
            description: '充電站充值',
            transactionId: orderTxNo,
            paymentMethod: paymentMethod
          };

          const data = await createPaymentOrderFromBackend(session?.accessToken, paymentData);
          console.log('後端回應 (LINE direct):', data);

          // 支援不同命名的 payment url
          const paymentUrl = data?.payment_url || data?.paymentUrl || data?.redirect_url;
          if (paymentUrl) {
            console.log('🔗 跳轉到 LINE Pay 支付頁面:', paymentUrl);
            window.location.href = paymentUrl;
            return; // 已跳轉，結束
          }

          if (data.success) {
            alert('付款成功！');
            router.push('/');
            return;
          }

          alert('付款失敗: ' + (data.message || '未知錯誤'));
          setLoading(false);
        } catch (error) {
          console.error('LINE Pay direct error:', error);
          alert('付款過程發生錯誤: ' + (error.message || error));
          setLoading(false);
        }

        return;
      }

      case "tappay_easywallet": {
        console.log('Entering EasyWallet case');
        // 悠遊付 - 導向 TapPay 支付頁面
        const paymentMethod = 'tappay_easywallet';

        console.log(`🔄 ${paymentMethod} 支付流程開始，金額:`, orderData.amount);

        // 取得悠遊付 Prime
        // guard: ensure EasyWallet API exists on TPDirect
        if (!window.TPDirect || !window.TPDirect.easyWallet) {
          console.error('TPDirect.easyWallet is not available on window.TPDirect', window.TPDirect);
          alert('悠遊付付款元件尚未載入或不支援於此瀏覽器');
          setLoading(false);
          return;
        }

        // wrapper to support both callback signatures and promise style
        const handleEasyWalletResult = async (result) => {
          console.log('EasyWallet getPrime result (normalized):', JSON.stringify(result, null, 2));

          if (!result || result.status !== 0) {
            alert('取得悠遊付付款資訊失敗: ' + (result?.msg || '未知錯誤'));
            setLoading(false);
            return;
          }

          const prime = result.prime;
          console.log('✅ EasyWallet Prime 取得成功:', prime);

          try {
            // 將 Prime 交給後端
            const paymentData = {
              amount: parseInt(orderData.amount),
              description: '充電站充值',
              transactionId: orderTxNo,
              paymentMethod: paymentMethod,
              metadata: {
                prime: prime,
                result_url: {
                  frontend_redirect_url: `${window.location.origin}/profile/payment-result`,
                  backend_notify_url: `${process.env.NEXT_PUBLIC_BACKEND_API}/payment/tappay-callback`
                }
              }
            };
            const data = await createPaymentOrderFromBackend(session?.accessToken, paymentData);
            console.log('後端回應:', data);
            const paymentUrl = data?.payment_url;
            if (paymentUrl) {
              console.log('🔗 跳轉到悠遊付支付頁面:', paymentUrl);
              window.location.href = paymentUrl;
              return;
            }
            if (data.success) {
              alert('付款成功！');
              router.push('/');
              return;
            }
            alert('付款失敗: ' + (data.message || '未知錯誤'));
            setLoading(false);
          } catch (error) {
            console.error('EasyWallet error:', error);
            alert('付款過程發生錯誤: ' + error.message);
            setLoading(false);
          }
        };

        // callback wrapper: supports (error, result) or (result)
        const cbWrapper = function(arg1, arg2) {
          // (error, result) style
          if (arguments.length === 2) {
            const err = arg1;
            const result = arg2;
            if (err) {
              console.error('EasyWallet getPrime callback error:', err);
              handleEasyWalletResult({ status: -1, msg: err && (err.message || err) });
              return;
            }
            handleEasyWalletResult(result);
            return;
          }
          // (result) style
          handleEasyWalletResult(arg1);
        };

        // call getPrime, also handle promise-style return
        try {
          const ret = window.TPDirect.easyWallet.getPrime(cbWrapper);
          if (ret && typeof ret.then === 'function') {
            ret.then((res) => cbWrapper(res)).catch((err) => cbWrapper(err));
          }
        } catch (e) {
          console.error('EasyWallet getPrime call failed:', e);
          alert('呼叫悠遊付付款元件失敗');
          setLoading(false);
        }
        return;
      }

      case "tappay_credit": {
        console.log('Entering Credit Card case');
        router.push({
          pathname: "/profile/tappay-payment",
          query: {
            amount: orderData.amount,
            orderId: orderTxNo,
            details: "充電站充值",
            paymentMethod: 'credit_card'
          }
        });
        return;
      }

      default: {
        console.log('Entering default case');

        return;
      }
    }
  };

  return (
      <div
          className="flex flex-col h-full gap-[20px]
      items-center p-[20px]"
      >
        {/* 充值金額輸入 */}
        <div className="w-full">
          <label className="block text-sm font-medium mb-2">充值金額</label>
          <input
              type="text"
              placeholder="請輸入充值點數"
              className="
            bg-gray-50 border 
            border-gray-300 text-gray-900 
            text-sm rounded-lg 
            focus:ring-blue-500 focus:border-blue-500 
            block w-full p-2.5
            "
              value={points}
              onChange={handleInput}
          />

          {/* 快速選擇金額按鈕 */}
          <div className="flex gap-2 mt-3">
            <button
                type="button"
                className="flex-1 py-2 px-4 border-2 border-gray-300 rounded-lg text-sm font-medium hover:border-[#01F2CF] hover:bg-[#01F2CF]/10 transition-all"
                onClick={() => {
                  setPoints(100);
                  validInput(100);
                }}
            >
              NT$ 100
            </button>
            <button
                type="button"
                className="flex-1 py-2 px-4 border-2 border-gray-300 rounded-lg text-sm font-medium hover:border-[#01F2CF] hover:bg-[#01F2CF]/10 transition-all"
                onClick={() => {
                  setPoints(500);
                  validInput(500);
                }}
            >
              NT$ 500
            </button>
            <button
                type="button"
                className="flex-1 py-2 px-4 border-2 border-gray-300 rounded-lg text-sm font-medium hover:border-[#01F2CF] hover:bg-[#01F2CF]/10 transition-all"
                onClick={() => {
                  setPoints(1000);
                  validInput(1000);
                }}
            >
              NT$ 1000
            </button>
          </div>

          <p className={`text-[13px] mt-1 ${!inputValid && "text-red-500"}`}>
            最低至少需充值1點
          </p>
        </div>

        {/* 支付方式選擇 */}
        <div className="w-full">
          <label className="block text-sm font-medium mb-2">選擇支付方式</label>
          <div className="flex flex-col gap-3">
            {paymentMethods.map((method) => (
                <div
                    key={method.id}
                    className={`
                border-2 rounded-lg p-4 cursor-pointer transition-all
                ${selectedPayment === method.id
                        ? 'border-[#01F2CF] bg-[#01F2CF]/10'
                        : 'border-gray-200 hover:border-gray-300'
                    }
              `}
                    onClick={() => setSelectedPayment(method.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {method.isImage ? (
                          <div className="w-8 h-8 relative flex-shrink-0">
                            <Image src={method.icon} alt={method.name} fill className="object-contain" />
                          </div>
                      ) : (
                          <span className="text-2xl">{method.icon}</span>
                      )}
                      <div>
                        <div className="font-medium">{method.name}</div>
                        <div className="text-xs text-gray-500">{method.description}</div>
                      </div>
                    </div>
                    <div className={`
                  w-5 h-5 rounded-full border-2 flex items-center justify-center
                  ${selectedPayment === method.id
                        ? 'border-[#01F2CF] bg-[#01F2CF]'
                        : 'border-gray-300'
                    }
                `}>
                      {selectedPayment === method.id && (
                          <div className="w-2 h-2 bg-white rounded-full"></div>
                      )}
                    </div>
                  </div>
                </div>
            ))}
          </div>
        </div>

        {/* 充值按鈕 */}
        <button
            type="button"
            className={`py-3 px-4 rounded-full w-full mt-4 ${clsx(
                styles["btn-primary"],
                (!inputValid || loading || !selectedPayment) && styles.disabled
            )}`}
            onClick={handleRecharge}
            disabled={!inputValid || loading || !selectedPayment}
        >
          {loading ? ((selectedPayment === "tappay_line" || selectedPayment === "line_pay_direct") ? '取得付款資訊中...' : '處理中...') : `前往付款 NT$ ${points}`}
        </button>
      </div>
  );
};

export default Recharge;

Recharge.getLayout = function getLayout(page) {
  return (
      <Layout
          header={
            <div style={{height: 60}}>
              <Navbar title="輸入充值點數"/>
            </div>
          }
      >
        {page}
      </Layout>
  );
};
