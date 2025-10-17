import { useEffect, useState } from "react";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import RechargeItem from "@/components/recharge-item";
import { getRecharges, getLastRecharge, getUserWalletBalanceFromBackend, getRechargesFromBackend } from "@/client-api/recharge";
import { useSession } from "next-auth/react";

const RechargeList = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [recharges, setRecharges] = useState([]);
  const [userWallet, setUserWallet] = useState(null);

  const navTo = (path) => {
    router.push(path);
  };

  // const handleNavClick = () => {};

  useEffect(() => {
    fetchData();
    fetchWalletBalance();
  }, []);

  const fetchData = async () => {
    // navTo("/profile");
    await getRechargesFromBackend(session.accessToken)
      .then((rsp) => {
        console.log(rsp);
        // Extract topups array from response
        setRecharges(rsp.topups || []);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const fetchWalletBalance = async () => {
    // navTo("/profile");
    await getUserWalletBalanceFromBackend(session.accessToken)
      .then((rsp) => {
        console.log(rsp);
        setUserWallet(rsp);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  return (
    <>
      <div className="p-[27px] w-full flex flex-col items-center text-center bg-[#F5F5F5]">
        <div className="mb-[20px]">
          <div className="text-[16px] mb-[10px]">目前點數:</div>
          <div className="text-[48px] font-bold">
            {(userWallet && userWallet.wallet.balance) || 0}
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center h-full text-center">
        {recharges.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-[80px] text-[#BDBDBD]">
            <div className="text-[48px] mb-4">💳</div>
            <div className="text-[16px] mb-2">尚無充值紀錄</div>
            <div className="text-[14px]">開始您的第一筆充值吧！</div>
            <button
              type="button"
              className={`py-2 px-6 rounded-full mt-6 ${styles["btn-primary"]}`}
              onClick={() => router.push("recharge")}
            >
              立即充值
            </button>
          </div>
        ) : (
          recharges.map((rechr) => (
            <RechargeItem
              key={rechr.id}
              recharge={rechr}
              // navClick={handleNavClick}
            />
          ))
        )}
      </div>
    </>
  );
};

export default RechargeList;

RechargeList.getLayout = function getLayout(page) {
  return (
    <Layout
      header={
        <div style={{ height: 60 }}>
          <Navbar title={"充值紀錄"} backUrl={"/profile"} />
        </div>
      }
      paddingNo={0}
    >
      {page}
    </Layout>
  );
};
