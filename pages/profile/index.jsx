import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import MenuItem from "@/components/menu-item";

const ProfileMenu = () => {
  const router = useRouter();
  const navTo = (path) => {
    router.push(path);
  };

  const menus = [
    {
      id: 1,
      title: "個人資料設定",
      navPath: "/profile/profile-edit",
    },
    {
      id: 2,
      title: "車輛資料",
      navPath: "/profile/car-list",
    },
    {
      id: 3,
      title: "充值紀錄",
      navPath: "/profile/recharge-list",
    },
    {
      id: 4,
      title: "充電紀錄",
      navPath: "/profile/charge-list",
    },
    {
      id: 5,
      title: "我的錢包",
      navPath: "/profile/my-wallet",
    },
    {
      id: 6,
      title: "登出",
      navPath: "logout",
    },
  ];

  return (
    <div className="flex flex-col items-center h-full text-center">
      {menus.map((mu) => (
        <MenuItem key={mu.id} menu={mu} />
      ))}
    </div>
  );
};

export default ProfileMenu;

ProfileMenu.getLayout = function getLayout(page) {
  return (
    <Layout
      header={
        <div style={{ height: 60 }}>
          <Navbar title={"個人中心"} backUrl={"/cpop/station-map"} />
        </div>
      }
      paddingNo={0}
    >
      {page}
    </Layout>
  );
};
