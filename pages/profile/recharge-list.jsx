import { useEffect, useState } from "react";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import RechargeItem from "@/components/recharge-item";
import ProfileBanner from "@/image/icons/profile-banner.svg";
import { getRecharges, getLastRecharge } from "@/client-api/recharge";
import { useSession } from "next-auth/react";

const RechargeList = () => {
  const router = useRouter();
  const {
    data: {
      user: { id: userId },
    },
  } = useSession();
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
    await getRecharges(userId)
      .then((rsp) => {
        console.log(rsp);
        setRecharges(rsp);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const fetchWalletBalance = async () => {
    // navTo("/profile");
    await getLastRecharge(userId)
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
      <style jsx>
        {`
          .btn-recharge {
            width: 60px;
            height: 26px;

            background: rgba(255, 255, 255, 0.3);
            border: 0.934579px solid rgba(255, 255, 255, 0.5);
            border-radius: 16px;
          }
        `}
      </style>
      <div className="p-[27px] w-full flex justify-center bg-[#F5F5F5]">
        <div className="relative inline-block">
          <ProfileBanner />
          <div className="absolute top-[20px] left-[20px] text-white">
            <div className="text-[12px]">目前點數</div>
            <div className="text-[24px] font-medium">
              {(userWallet && userWallet.balance) || 0}
            </div>
            <button
              className="text-[12px] btn-recharge mt-3"
              onClick={() => router.push("recharge")}
            >
              充值
            </button>
          </div>
        </div>
      </div>
      <div className="flex flex-col items-center h-full text-center">
        {recharges.map((rechr) => (
          <RechargeItem
            key={rechr.id}
            recharge={rechr}
            // navClick={handleNavClick}
          />
        ))}
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
