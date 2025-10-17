import { useEffect, useState } from "react";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import { getLastRecharge, getUserWalletBalanceFromBackend } from "@/client-api/recharge";
import { useSession } from "next-auth/react";

const MyWallet = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [userWallet, setUserWallet] = useState(null);
  const navTo = (path) => {
    router.push(path);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
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
    <div
      className="flex flex-col h-full gap-[30px] 
      items-center text-center"
    >
      <div className="mt-[50px] mb-[30px]">
        <div className="text-[16px] mb-[10px]">目前點數:</div>
        <div className="text-[48px] font-bold">
          {(userWallet && userWallet.wallet.balance) || 0}
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
