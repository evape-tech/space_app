import { useEffect, useState } from "react";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import { setUserStatus } from '@/utils/storeTool'
import { getLastRecharge, getUserWalletBalanceFromBackend } from "@/client-api/recharge";
import { useSession } from "next-auth/react";
import { Modal } from '@mantine/core';
import { getUserProfileFromBackend } from '@/client-api/user';

const MyWallet = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const [userWallet, setUserWallet] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileWarning, setShowProfileWarning] = useState(false);

  // 檢查使用者資料是否完整
  const isProfileComplete = (profile) => {
    if (!profile) return false;
    console.log('檢查使用者資料完整性:', profile);
    return !!(
      profile.user.email &&
      profile.user.phone
    );
  };

  // 獲取使用者資料
  const fetchUserProfile = async () => {
    if (!session?.accessToken) {
      console.warn('尚未登入或 token 不存在');
      return;
    }

    try {
      const data = await getUserProfileFromBackend(session.accessToken);
      setUserProfile(data);
    } catch (error) {
      console.error('獲取使用者資料失敗:', error);
    }
  };

  const navTo = (path) => {
    const target = path.startsWith('/') ? path : `/profile/${path}`;
    router.push(target).then(() => setUserStatus({ userId, cpid: null, appPath: target }));
  };

  const handleStartRecharge = () => {
    if (!isProfileComplete(userProfile)) {
      setShowProfileWarning(true);
      return;
    }
    navTo("recharge");
  };

  useEffect(() => {
    fetchData();
    fetchUserProfile();
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
    <>
      {/* 個人資訊未完整提示 Dialog */}
      <Modal
        opened={showProfileWarning}
        onClose={() => setShowProfileWarning(false)}
        title="提示"
        centered
      >
        <div className="text-center">
          <p className="mb-4">請先完善個人資訊後再使用此功能</p>
          <div className="flex gap-3 justify-center">
            <button
              className="px-6 py-2 bg-gray-200 rounded-full"
              onClick={() => setShowProfileWarning(false)}
            >
              取消
            </button>
            <button
              className="px-6 py-2 bg-blue-500 text-white rounded-full"
              onClick={() => {
                setShowProfileWarning(false);
                navTo('/profile');
              }}
            >
              前往填寫
            </button>
          </div>
        </div>
      </Modal>

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
          onClick={handleStartRecharge}
        >
          開始充值
        </button>
      </div>
    </>
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
