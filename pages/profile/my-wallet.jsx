import { useEffect, useState } from "react";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import ProfileBanner from "@/image/icons/profile-banner.svg";
import { getLastRecharge } from "@/client-api/recharge";
import { useSession } from "next-auth/react";

const MyWallet = () => {
  const router = useRouter();
  const {
    data: {
      user: { id: userId },
    },
  } = useSession();
  const [userWallet, setUserWallet] = useState(null);
  const navTo = (path) => {
    router.push(path);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
    <div
      className="flex flex-col h-full gap-[30px] 
      items-center"
    >
      {/* <div className="text-[18px] font-medium mt-[50px] mb-[80px]">
        輸入充值點數
      </div> */}
      {/* <ProfileBanner /> */}
      <div className="relative inline-block">
        <ProfileBanner />
        <div className="absolute top-[40px] left-[20px] text-white">
          <div className="text-[12px]">目前點數</div>
          <div className="text-[24px] font-medium">
            {(userWallet && userWallet.balance) || 0}
          </div>
          {/* <button className="text-[12px] btn-recharge mt-3"
            onClick={()=> router.push('recharge')}
            >充值</button> */}
        </div>
      </div>

      <button
        type="button"
        className={`py-2 px-4 rounded-full w-full  ${styles["btn-primary"]}`}
        onClick={() => navTo("recharge")}
      >
        開始充值
      </button>
    </div>
  );
};

export default MyWallet;

MyWallet.getLayout = function getLayout(page) {
  return (
    <Layout
      header={
        <div style={{ height: 60 }}>
          <Navbar title="我的錢包" />
        </div>
      }
    >
      {page}
    </Layout>
  );
};
