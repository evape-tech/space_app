import { useState, useRef } from "react";
import { useRecoilState } from "recoil";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";

import DirectionIcon from "@/image/icons/direction.svg";
import ListCpIcon from "@/image/icons/list-cp.svg";
import ParkingIcon from "@/image/icons/parking.svg";

// import { useRouter } from "next/router";

import { userPosState, currStationInfoState } from "@/atom/atomState";

// {
//   id: 2,
//   stationName: "abc 充電站",
//   km: 2,
//   spaces: 5,
// },

const StationItem = ({ station }) => {
  // const router = useRouter();
  const navTo = (path) => {
    router.push(path);
  };

  const [pointA] = useRecoilState(userPosState);
  const pointB = useRef(null)
  
  // const [pointB] = useRecoilState(currStationInfoState);

  const newTabStartNav = () => {
    const url = `https://www.google.com/maps/dir/${pointA.lat},${pointA.lng}/${pointB.current.lat},${pointB.current.lng}`;
    window.open(url, "_blank").focus();
  };


  const { name, km, spaceCount } = station;
  return (
    <div
      className="text-[15px] flex p-[15px] 
      border-b-2 justify-between items-center w-full bg-white"
    >
      <div className="text-left">
        <div>{name || '未命名'}</div>
        <div className="flex gap-[15px]">
          <div className="flex items-center text-[13px] ">
            <ListCpIcon /> 
            <span className="text-[15px] font-medium text-[#4F4F4F]"> &nbsp;{km || '距離未知'} </span> &nbsp;
          </div>
          <div className="flex  items-center text-[13px]">
            <ParkingIcon />
            <span className="text-[18px] font-medium text-[#4F4F4F]"> &nbsp; {spaceCount}</span> &nbsp;空位
          </div>
        </div>
      </div>
      <button onClick={() => {
        pointB.current = {
          lat: station.latLng.lat,
          lng: station.latLng.lng,
        }
        newTabStartNav()
      }}>
        <DirectionIcon />
      </button>
    </div>
  );
};

export default StationItem;
