import { useEffect, useState } from "react";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import ChargeItem from "@/components/charge-item";
import { getChargeTx } from "@/client-api/user";
import { useSession } from "next-auth/react";

const ChargeList = () => {
  const {
    data: {
      user: { id: userId },
    },
  } = useSession();
  const router = useRouter();
  const navTo = (path) => {
    router.push(path);
  };

  const [charges, setCharges] = useState([]);

  const fetchData = () => {
    // navTo("/profile");
    getChargeTx(userId)
      .then((rsp) => {
        console.log(rsp);
        setCharges(rsp);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNavClick = () => {};

  return (
    <div className="flex flex-col items-center h-full text-center">
      {charges.map((chr) => (
        <ChargeItem key={chr.id} charge={chr} navClick={handleNavClick} />
      ))}
    </div>
  );
};

export default ChargeList;

ChargeList.getLayout = function getLayout(page) {
  return (
    <Layout
      header={
        <div style={{ height: 60 }}>
          <Navbar title={"充電紀錄"} />
        </div>
      }
      paddingNo={0}
    >
      {page}
    </Layout>
  );
};
