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
    // const orderNo = orderTxNo.slice(3);

    const orderData = { orderNo: orderTxNo, userId, qty: points };
    const ecpayOrder = { orderTxNo, userId, points };

    orderData.qty = +points;
    orderData.unitPrice = 1;
    orderData.amount = orderData.qty * orderData.unitPrice;
    orderData.status = "unpaid";

    createOrder(orderData)
      .then((rsp) => {
        router.push(
          {
            pathname: "credit-page",
            query: ecpayOrder,
          },
          "credit-page"
        );
      })
      .catch((err) => console.log(err.message));
  };

  if (ecpayForm) return <ShowHTML html={ecpayForm} />;
  return (
    <div
      className="flex flex-col h-full gap-[30px] 
      items-center text-center"
    >
      {/* <div className="text-[18px] font-medium mt-[50px] mb-[80px]">
        輸入充值點數
      </div> */}
      <input
        type="text"
        placeholder="請輸入充值點數"
        className="
          bg-gray-50 border 
          border-gray-300 text-gray-900 
          text-sm rounded-lg 
          focus:ring-blue-500 focus:border-blue-500 
          block w-full p-2.5 
          mt-[30px]
          "
        value={points}
        onChange={handleInput}
      />

      <button
        type="button"
        className={`py-2 px-4 rounded-full w-full  ${clsx(
          styles["btn-primary"],
          !inputValid && styles.disabled
        )}`}
        onClick={handleRecharge}
      >
        開始充值
      </button>
      <p className={`text-[13px] ${!inputValid && "text-red-500"}`}>
        最低至少需充值100點
      </p>
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
