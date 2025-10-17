import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import { Carousel } from '@mantine/carousel';
import { Modal } from '@mantine/core';

import BottomBarCp from "@/image/icons/bottom_bar_cp.svg";
import ProfileIcon from "@/image/icons/profile.svg";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import StartChargeIcon from "@/image/icons/start_charge.svg";
import { getLastRecharge, getUserWalletBalanceFromBackend } from "@/client-api/recharge";
import { useSession } from "next-auth/react";
import { setUserStatus } from '@/utils/storeTool'
import { getUserProfileFromBackend } from '@/client-api/user';

import { currStationInfoState, currPSInfoState } from "@/atom/atomState";

const StationMap = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [balance, setBalance] = useState(0);
  const [userProfile, setUserProfile] = useState(null);
  const [showProfileWarning, setShowProfileWarning] = useState(false);
  const [banners, setBanners] = useState([
    { id: 1, image: '/images/banner.webp', title: 'Banner 1' },
    { id: 2, image: '/images/banner.webp', title: 'Banner 2' },
    { id: 3, image: '/images/banner.webp', title: 'Banner 3' },
  ]);
  const [announcements, setAnnouncements] = useState([
    { id: 1, title: '系統維護通知', date: '2025-10-13', content: '系統將於本週末進行維護' },
    { id: 2, title: '新功能上線', date: '2025-10-12', content: '新增充電站預約功能' },
    { id: 3, title: '優惠活動', date: '2025-10-11', content: '充電滿額送好禮活動進行中' },
  ]);

  const router = useRouter();

  // 檢查使用者資料是否完整
  const isProfileComplete = (profile) => {
    if (!profile) return false;
    // 根據需求調整必填欄位，例如：name, phone, email 等
    console.log('檢查使用者資料完整性:', profile);
    return !!(
      profile.user.email ||
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

  // 檢查並導航
  const checkProfileAndNavigate = (path) => {
    if (!isProfileComplete(userProfile)) {
      setShowProfileWarning(true);
      return;
    }
    router.push(path);
  };

  const navTo = (path) => {
    router.push(path);
  };

  const checkWallet = () => {
    if (!isProfileComplete(userProfile)) {
      setShowProfileWarning(true);
      return;
    }

    const minPoints = 100;
    if (balance >= minPoints) {
      navTo("cpop-code");
    } else {
      navTo("cpop-recharge");
    }
  };

  const fetchWalletBalance = async () => {
    if (!session?.accessToken) {
      console.warn('尚未登入或 token 不存在，無法取得錢包餘額');
      return;
    }

    try {
      const rsp = await getUserWalletBalanceFromBackend(session.accessToken);
      // 假設回傳格式包含 balance 屬性
      console.log('取得錢包餘額:', rsp);
      const bal = rsp?.wallet?.balance || 0;
      setBalance(bal);
    } catch (error) {
      console.log('取得錢包餘額失敗:', error.message || error);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      setUserStatus({
        userId,
        cpid: null,
        appPath: "/cpop/station-map"
      });
      fetchUserProfile();
      fetchWalletBalance();
    }
  }, [session]);

  return (
    <>
      <div className="h-full">
        <style jsx>{`
          .bottom-bar {
            background: transparent url("/images/bottom_bar.png") no-repeat
              center;
             {
              /* background-position: bottom -20px left -27px; */
            }
             {
              /* border: 1px solid #4d4d4d; */
            }
          }
          .infoModal-box {
            box-shadow: 0px -4px 20px rgba(0, 0, 0, 0.1);
            border-radius: 16px 16px 0px 0px;
          }
        `}</style>

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
                  router.push('/profile');
                }}
              >
                前往填寫
              </button>
            </div>
          </div>
        </Modal>

        <div className={`h-screen pb-[60px] w-full absolute overflow-y-auto`}>
          <Navbar hideBack/>
          
          {/* Banner 輪播 */}
          <div className="w-full px-4 mt-4">
            <Carousel
              withIndicators
              height={180}
              slideSize="100%"
              slideGap="md"
              loop
              align="start"
              slidesToScroll={1}
            >
              {banners.map((banner) => (
                <Carousel.Slide key={banner.id}>
                  <div 
                    className="w-full h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white text-xl font-bold"
                    style={{
                      backgroundImage: `url(${banner.image})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  >
                    {banner.title}
                  </div>
                </Carousel.Slide>
              ))}
            </Carousel>
          </div>

          {/* 公告列表 */}
          <div className="w-full px-4 mt-6 mb-32">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-bold text-gray-800">最新公告</h2>
              <button className="text-sm text-blue-500">查看更多</button>
            </div>
            
            <div className="space-y-3">
              {announcements.map((announcement) => (
                <div 
                  key={announcement.id}
                  className="bg-white rounded-lg p-4 shadow-sm border border-gray-100"
                >
                  <div className="flex items-start justify-between">
                    <h3 className="font-semibold text-gray-800 flex-1">
                      {announcement.title}
                    </h3>
                    <span className="text-xs text-gray-400 ml-2">
                      {announcement.date}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {announcement.content}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div
          className="absolute overflow-hidden left-0 right-0 ml-auto mr-auto
              w-[334px] h-[122px] 
              flex flex-col gap-[30px] 
              text-center
              bottom-[5%]"
        >
          <div
            className="bottom-bar flex 
              w-[334px] h-[122px] 
              text-[#BDBDBD] text-[12px]"
          >
            <div className="flex items-center justify-center flex-1 h-full">
              <button
                className="flex flex-col items-center mt-[20px] ml-[15px]"
                onClick={() => checkProfileAndNavigate("station-list")}
              >
                <BottomBarCp />
                <p className="mt-2">充電站</p>
              </button>
            </div>
            <div className="flex-1">
              <button className="-mt-[4px]" onClick={checkWallet}>
                <StartChargeIcon />
                <p className="-mt-[22px]">啟動充電</p>
              </button>
            </div>
            <div className="flex items-center justify-center flex-1">
              <button
                className="flex flex-col items-center mt-[20px] mr-[15px]"
                onClick={() => navTo("/profile")}
              >
                <ProfileIcon />
                <p className="mt-2">個人中心</p>
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
};

export default StationMap;

StationMap.getLayout = function getLayout(page) {
  return <Layout paddingNo={0} isMap={true} hideBack>{page}</Layout>;
};
