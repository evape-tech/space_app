import { useState, useEffect } from "react";
import { useRecoilState } from "recoil";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import StationItem from "@/components/station-item";
import { getStations } from "@/client-api/station";
import { getKms } from '@/utils/mapTool'
import { userPosState } from "@/atom/atomState";


const StationList = () => {
  const router = useRouter();
  const [locations, setLocations] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [userPos] = useRecoilState(userPosState);

  const navTo = (path) => {
    router.push(path);
  };


  const fetchData = async () => {
    setLoading(true);
    setPermissionDenied(false);
    
    console.log('步驟1: 檢查地理位置權限...');
    // 檢查地理位置權限
    if (navigator.permissions) {
      try {
        const permission = await navigator.permissions.query({ name: 'geolocation' });
        if (permission.state === 'denied') {
          console.log('權限被拒絕');
          setPermissionDenied(true);
          setLoading(false);
          return;
        }
        console.log('權限允許');
      } catch (error) {
        console.log('權限檢查失敗:', error);
      }
    }

    console.log('步驟2: 獲取用戶位置...');
    // 獲取用戶位置
    let currentUserPos = userPos; // 先使用現有的
    if (!currentUserPos) {
      currentUserPos = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          console.log('瀏覽器不支持地理位置');
          resolve(null);
          return;
        }
        
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const pos = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            console.log('用戶位置獲取成功:', pos);
            console.log('Google Maps SDK 確認位置:', pos);
            console.log('位置準確度:', position.coords.accuracy, '米');
            console.log('位置時間戳:', new Date(position.timestamp));
            resolve(pos);
          },
          (error) => {
            console.log('獲取位置失敗:', error);
            console.log('錯誤代碼:', error.code, '消息:', error.message);
            setLocationError(error);
            resolve(null);
          },
          { timeout: 10000, enableHighAccuracy: true }
        );
      });
    } else {
      console.log('使用現有用戶位置:', currentUserPos);
    }

    console.log('步驟3: 獲取充電站數據...');
    try {
      const rsp = await getStations();
      console.log('充電站數據獲取成功:', rsp);
      
      let locations;
      if (currentUserPos) {
        try {
          console.log('開始計算距離...');
          locations = await getKms(currentUserPos, rsp);
          console.log('距離計算成功');
        } catch (kmsError) {
          console.log('距離計算失敗，使用原始數據:', kmsError);
          locations = rsp; // 如果距離計算失敗，使用原始數據
        }
      } else {
        console.log('沒有用戶位置，使用原始數據');
        locations = rsp; // 如果沒有用戶位置，直接使用原始數據
      }
      
      console.log('最終locations:', locations);
      setLocations(locations);
    } catch (error) {
      console.log('獲取充電站失敗:', error);
      setLocations([]); // 設置為空數組以顯示placeholder
    } finally {
      console.log('載入完成');
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
      ) : permissionDenied ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="text-lg mb-2">需要位置權限</div>
          <div className="text-sm mb-4">請在瀏覽器設定中允許位置存取，以顯示充電站距離</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重新載入
          </button>
        </div>
      ) : locations && locations.length > 0 ? (
        locations.map((std) => (
          <StationItem key={std.id} station={std} navClick={handleNavClick} />
        ))
      ) : locationError ? (
        <div className="flex flex-col items-center justify-center h-full text-gray-500">
          <div className="text-lg mb-2">位置獲取失敗</div>
          <div className="text-sm mb-4">錯誤: {locationError.message} (代碼: {locationError.code})</div>
          <button 
            onClick={() => {
              setLocationError(null);
              fetchData();
            }} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            重試
          </button>
        </div>
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
