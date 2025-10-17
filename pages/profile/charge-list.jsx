import { useEffect, useState } from "react";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import ChargeItem from "@/components/charge-item";
import { getChargeTx, getChargeTxFromBackend } from "@/client-api/user";
import { useSession } from "next-auth/react";

const ChargeList = () => {
  const { data: session } = useSession();
  const userId = session?.user?.id;
  const router = useRouter();
  const navTo = (path) => {
    router.push(path);
  };

  const [charges, setCharges] = useState([]);

  const fetchData = () => {
    // navTo("/profile");
    getChargeTxFromBackend(session.accessToken)
      .then((rsp) => {
        console.log(rsp);
        // Filter only charging transactions
        const chargingTransactions = rsp.transactions?.filter(
          (tx) => tx.source === "charging" && tx.type === "charging"
        ) || [];
        setCharges(chargingTransactions);
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
      {charges.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-[80px] text-[#BDBDBD]">
          <div className="text-[48px] mb-4">⚡</div>
          <div className="text-[16px] mb-2">尚無充電紀錄</div>
          <div className="text-[14px]">開始您的第一次充電吧！</div>
          <button
            type="button"
            className={`py-2 px-6 rounded-full mt-6 ${styles["btn-primary"]}`}
            onClick={() => router.push("/cpop/station-map")}
          >
            前往充電
          </button>
        </div>
      ) : (
        charges.map((chr) => (
          <ChargeItem key={chr.id} charge={chr} navClick={handleNavClick} />
        ))
      )}
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
