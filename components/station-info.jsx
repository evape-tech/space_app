import { useState, useEffect, useRef } from "react";
import { useRecoilState } from "recoil";
import clsx from "clsx";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import ArrowDown from "@/image/icons/chevron-down.svg";
import DwopUp from "@/image/icons/dwop-up.svg";
import DwopDown from "@/image/icons/dwop-down.svg";
import ParkingIcon from "@/image/icons/parking.svg";
import TimeIcon from "@/image/icons/time.svg";
import CpIcon from "@/image/icons/list-cp.svg";
import ParkingFeeIcon from "@/image/icons/parking-outline.svg";
import ChargingIcon from "@/image/icons/charging.svg";
import StartNavIcon from "@/image/icons/start-nav.svg";
import SharedIcon from "@/image/icons/upload.svg";
import CpList from "@/components/cp-list";

import { userPosState, currStationInfoState } from "@/atom/atomState";
import { fetchData } from "next-auth/client/_utils";
import { getStationCps } from "@/client-api/station";
import 'react-spring-bottom-sheet/dist/style.css'
import { BottomSheet } from 'react-spring-bottom-sheet'

const StationInfo = () => {
  const [open, setOpen] = useState(false)
  const sheetRef = useRef()

  const [showBizHrs, setShowBizHrs] = useState(true); // show
  const [cpListData, setCpListData] = useState([]);
  const [arrowShow, setArrowShow] = useState(false);

  const [pointA] = useRecoilState(userPosState);
  const [pointB] = useRecoilState(currStationInfoState);

  const fetchData = async () => {
    // navTo("/profile");
    getStationCps(pointB.id)
      .then((rsp) => {
        setCpListData(rsp);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  useEffect(() => {
    fetchData();
    setOpen(!!pointB)
  }, [pointB]);

  function onDismiss() {
    setOpen(false)
  }

  const shareInfo = () => {
    if (navigator.share) {
      const url = `https://www.google.com/maps/place/${pointB.latLng.lat},${pointB.latLng.lng}`;
      navigator
        .share({
          title: "充電站",
          text: pointB.title,
          url,
        })
        .then(() => console.log("成功！"))
        .catch((error) => console.log("發生錯誤", error));
    }
  };

  const newTabStartNav = () => {
    const url = `https://www.google.com/maps/dir/${pointA.lat},${pointA.lng}/${pointB.latLng.lat},${pointB.latLng.lng}`;
    window.open(url, "_blank").focus();
  };

  return (
    <>
      <style jsx>{`
        .infoModal-box {
          box-shadow: 0px -4px 20px rgba(0, 0, 0, 0.1);
          border-radius: 16px 16px 0px 0px;
        }
      `}</style>

      <BottomSheet
        className="station-info"
        open={open}
        ref={sheetRef}
        blocking={false}
        scrollLocking={false}
        defaultSnap={({ lastSnap, snapPoints }) =>
          Math.min(...snapPoints)
        }
        snapPoints={({ maxHeight }) => [
          maxHeight,
          225,
        ]}
        onSpringStart={(event) => {
          setArrowShow(true)
          if (event.type === 'SNAP' && sheetRef.current.height === 225) {
            setArrowShow(false)
          }
        }}
        onDismiss={onDismiss}
        header={
          <>
            {!arrowShow && (<a
              onClick={() => {
                sheetRef.current.snapTo(225)
              }} className="inline-block p-0" href="#">
              <ArrowDown />
            </a>)}

            <h2 className="text-[20px] font-medium">{pointB.name}</h2>
            <div className="text-[13px] text-[#4F4F4F]">
              <span className="text-[15px] font-medium">{pointB.km}</span>{" "}
              ．營業中．停車收費
            </div>
            <div className="text-[13px] text-[#4F4F4F]">
              <span className="text-[18px] font-medium">{pointB.spaceCount}</span> 空位
            </div>
          </>
        }
        footer={
          <div className="px-[27px] flex gap-3 mt-2 pb-5">
            <button
              className={`flex-[2] rounded-full  ${clsx(styles["btn-primary"])}`}
              onClick={newTabStartNav}
            >
              <div className="flex items-center justify-center">
                <StartNavIcon />
                &nbsp;&nbsp;立即導航
              </div>
            </button>

            <button
              className={`flex-1 rounded-full  ${clsx(
                styles["btn-primary"],
                styles["outline"]
              )}`}
              onClick={shareInfo}
            >
              <div className="flex items-center justify-center">
                <SharedIcon />
                &nbsp;&nbsp;分享
              </div>
            </button>
          </div>
        }
      >
        <div className="">
          <hr />
          <div className="px-[27px] pt-0">
            <div className="mb-4">
              <div className="flex items-center py-3">
                <CpIcon />
                &nbsp; {pointB.addr}
              </div>
              <div className="border-t-[1px] py-3  flex items-center">
                <ParkingIcon />
                &nbsp; {pointB.parkSpace}
              </div>
              <div>
                <div className="border-t-[1px] py-3   flex justify-between pr-3">
                  <div className="flex items-center">
                    <TimeIcon />
                    &nbsp; 營業中．全天開放
                  </div>
                  <button onClick={() => setShowBizHrs(!showBizHrs)}>
                    {showBizHrs ? <DwopUp /> : <DwopDown />}
                  </button>
                </div>
                <div
                  className={` ${showBizHrs ? "h-[200px]" : "h-0"
                    } overflow-hidden`}
                >
                  {pointB.bizHour?.map((b, i) => (
                    <div key={i}>{b}</div>
                  ))}
                </div>
              </div>
              <div className="border-t-[1px] py-3 flex items-center justify-between">
                <div className="flex">
                  <ParkingFeeIcon />
                  &nbsp; 停車費
                </div>
                <div className="text-[#4F4F4F]">
                  {pointB.parkFee} 元/小時(依現場為準)
                </div>
              </div>
              <div className="border-t-[1px] pt-3 flex items-center">
                <ChargingIcon />
                &nbsp; 充電站
              </div>
              <CpList cpListData={cpListData} />
            </div>
          </div>
        </div>
      </BottomSheet>



    </>
  );
};

export default StationInfo;
