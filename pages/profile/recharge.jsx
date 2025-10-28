import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import { useState } from "react";
import clsx from "clsx";
import { checkOutPage } from "@/client-api/recharge";
import { useSession } from "next-auth/react";
import { orderSeq, createOrder, resetSeqNo } from "@/client-api/order";
import dayjs from "dayjs";

const ShowHTML = ({ html }) => {
  // const html = "<h1>hello</h1>";
  return <iframe srcDoc={html} className="h-full"></iframe>;
};

const Recharge = () => {
  const router = useRouter();

  const {
    data: {
      user: { id: userId },
    },
  } = useSession();

  const [points, setPoints] = useState(100);
  const [inputValid, setInputValid] = useState(true);
  const [ecpayForm, setEcpayForm] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("tappay_credit"); // 預設信用卡

  // 支付方式選項 - TapPay 支援的四個通道
  const paymentMethods = [
    { id: "tappay_credit", name: "信用卡", icon: "💳", description: "Visa / Master / JCB" },
    { id: "tappay_jkopay", name: "全盈Pay", icon: "💳", description: "街口支付 / 全盈+PAY" },
    { id: "tappay_line", name: "LINE Pay", icon: "💳", description: "LINE Pay 付款" },
    { id: "tappay_easycard", name: "悠游付", icon: "💳", description: "悠遊卡 Easy Wallet" },
  ];

  const navTo = (path) => {
    router.push(path);
  };

  const validInput = (v) => {
    if (v >= 100) setInputValid(true);
    else setInputValid(false);
  };

  const handleInput = (e) => {
    const no = e.target.value;
    setPoints(no);
    validInput(no);
  };

  const padZero = (val, len) => {
    return val.padStart(len, "0");
  };

  const genOrderTxNo = () => {
    return new Promise(async (resolve, reject) => {
      await orderSeq()
        .then((rsp) => {
          console.log(rsp);
          let seqNo = rsp?.seqNo;
          if (seqNo > 999) {
            resetSeqNo();
            seqNo = 0;
          }
          let dayFormat = `${dayjs().format("YYMMDD")}`; // some day
          seqNo = "Z" + dayFormat + padZero(seqNo + "", 3);
          resolve(seqNo);
        })
        .catch((err) => {
          console.log(err);
          reject(err);
        });
    });

    return orderNo;
  };

  const handleRecharge = async () => {
    const orderTxNo = await genOrderTxNo();

    const orderData = { orderNo: orderTxNo, userId, qty: points };

    orderData.qty = +points;
    orderData.unitPrice = 1;
    orderData.amount = orderData.qty * orderData.unitPrice;
    orderData.status = "unpaid";

    createOrder(orderData)
      .then((rsp) => {
        // 根據選擇的支付方式導向 TapPay 支付頁面
        let paymentType = "credit_card"; // 預設信用卡
        
        switch (selectedPayment) {
          case "tappay_credit":
            paymentType = "credit_card";
            break;
          case "tappay_jkopay":
            paymentType = "jkopay";
            break;
          case "tappay_line":
            paymentType = "line_pay";
            break;
          case "tappay_easycard":
            paymentType = "easycard";
            break;
          default:
            paymentType = "credit_card";
        }

        // 統一導向 TapPay 支付頁面
        router.push({
          pathname: "/profile/tappay-payment",
          query: {
            amount: orderData.amount,
            orderId: orderTxNo,
            details: "充電站充值",
            paymentType: paymentType
          }
        });
      })
      .catch((err) => console.log(err.message));
  };

  if (ecpayForm) return <ShowHTML html={ecpayForm} />;
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
          最低至少需充值100點
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
                  <span className="text-2xl">{method.icon}</span>
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
          !inputValid && styles.disabled
        )}`}
        onClick={handleRecharge}
        disabled={!inputValid}
      >
        前往付款 NT$ {points}
      </button>
    </div>
  );
};

export default Recharge;

Recharge.getLayout = function getLayout(page) {
  return (
    <Layout
      header={
        <div style={{ height: 60 }}>
          <Navbar title="輸入充值點數" />
        </div>
      }
    >
      {page}
    </Layout>
  );
};
