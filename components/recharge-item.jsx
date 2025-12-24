import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import dayjs from "@/utils/dayjs";

// import DirectionIcon from "@/image/icons/direction.svg";
// import ListCpIcon from "@/image/icons/list-cp.svg";
// import ParkingIcon from "@/image/icons/parking.svg";

import { useRouter } from "next/router";

// {
//   id: 2,
//   stationName: "abc 充電站",
//   km: 2,
//   spaces: 5,
// },

const RechargeItem = ({ recharge }) => {
  const router = useRouter();
  const navTo = (path) => {
    router.push(path);
  };

  // Adapt to new API format
  const createdAt = recharge.created_at;
  const amount = recharge.amount;
  const balanceAfter = recharge.balance_after;
  const paymentMethod = recharge.payment_method;
  const status = recharge.status;
  const note = recharge.note;

  // Map payment method to display text
  const getPaymentMethodText = (method) => {
    const methodMap = {
      'credit_card': '信用卡',
      'easy_wallet': '悠遊付',
      'line_pay': 'Line Pay',
      'plus_pay': '全盈 Pay',
      'other': '其他'
    };
    return methodMap[method] || method;
  };

  // Map status to display text and color
  const getStatusDisplay = (status) => {
    const statusMap = {
      'COMPLETED': { text: '成功', color: '#4CAF50' },
      'PENDING': { text: '處理中', color: '#FF9800' },
      'FAILED': { text: '失敗', color: '#F44336' }
    };
    return statusMap[status] || { text: status, color: '#828282' };
  };

  const statusDisplay = getStatusDisplay(status);

  return (
    <div className="flex p-[15px] border-b-2 justify-between items-center w-full bg-white">
      <div className="text-[#828282] text-[15px]">
        <div>{dayjs.utc(createdAt).local().format("YYYY/MM/DD")}</div>
        <div>{dayjs.utc(createdAt).local().format("HH:mm:ss")}</div>
        {paymentMethod && (
          <div className="text-[12px] mt-1 text-[#BDBDBD]">
            {getPaymentMethodText(paymentMethod)}
          </div>
        )}
      </div>
      <div className="text-right">
        <div className="text-[17px] font-medium">
          充值 {amount.toFixed(2)}
          <span 
            className="ml-2 text-[12px] px-2 py-1 rounded"
            style={{ 
              backgroundColor: statusDisplay.color + '20',
              color: statusDisplay.color
            }}
          >
            {statusDisplay.text}
          </span>
        </div>
        <p className="text-[15px] text-[#BDBDBD]">
          餘額 {balanceAfter.toFixed(2)}
        </p>
        {note && note !== 'test' && (
          <p className="text-[12px] text-[#E0E0E0] mt-1">{note}</p>
        )}
      </div>
    </div>
  );
};

export default RechargeItem;
