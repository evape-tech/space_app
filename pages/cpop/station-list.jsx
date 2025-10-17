import { useState, useEffect } from "react";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import StationItem from "@/components/station-item";
import { getStations, getStationFromBackend } from "@/client-api/station";


const StationList = () => {
  const router = useRouter();
  const [locations, setLocations] = useState(null);
  const [loading, setLoading] = useState(true);

  const navTo = (path) => {
    router.push(path);
  };


  const fetchData = async () => {
    setLoading(true);
    try {
      console.log('獲取充電站數據...');
      const rsp = await getStationFromBackend();
      console.log('充電站數據獲取成功:', rsp);
      setLocations(rsp);
    } catch (error) {
      console.log('獲取充電站失敗:', error);
      setLocations([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleNavClick = () => {};

  return (
    <div
      className="flex flex-col items-center h-full text-center"
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="text-lg mb-2">載入中...</div>
        </div>
      ) : locations && locations.length > 0 ? (
        locations.map((std) => (
          <StationItem key={std.id} station={std} navClick={handleNavClick} />
        ))
      ) : (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="text-lg mb-2">目前沒有充電站數據</div>
          <div className="text-sm">請稍後再試或聯繫管理員</div>
        </div>
      )}
    </div>
  );
};

StationList.getLayout = function getLayout(page) {
  return (
    <Layout header={<Navbar />} paddingNo={0}>
      {page}
    </Layout>
  );
};

export default StationList;
