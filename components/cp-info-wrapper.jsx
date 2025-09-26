import { useState, useEffect } from "react";
import clsx from "clsx";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import NavBackIcon from "@/image/icons/nav-back.svg";
import Navbar from "@/components/navbar";

const CpInfoWrapper = ({ children, onBackClick }) => {
  
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  }, [])
  
  return (
    <div
      className={`
          infoModal-box 
          absolute
          top-0 left-0
          right-0 bottom-0
          bg-white
          z-10
        `}
    >
      <style jsx>{`
        .infoModal-box {
          box-shadow: 0px -4px 20px rgba(0, 0, 0, 0.1);
          border-radius: 16px 16px 0px 0px;
        }
      `}</style>
      {/* <div className="px-[20px] pt-[20px]">
          <a
            onClick={() => close()}
            className="inline-block p-[10px] pt-0"
            href="#"
          >
            <NavBackIcon />
          </a>
        </div> */}
      <Navbar title="充電槍資訊" onBackClick={onBackClick} />
      <div className=" p-[27px]">{children}</div>
    </div>
  );
};

export default CpInfoWrapper;
