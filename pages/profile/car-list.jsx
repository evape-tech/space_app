import { useEffect } from "react";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import CarItem from "@/components/car-item";
import ProfileBanner from "@/image/icons/profile-banner.svg";
import React, { useState } from "react";
import SwipeToDelete from "react-swipe-to-delete-ios";
import AddIcon from "@/image/icons/plus.svg";
import { useSession } from "next-auth/react";
import { getUserCars, deleteCar } from "@/client-api/car";
import DeleteIcon from "@/image/icons/Trash.svg";

const CarList = () => {
  const {
    data: {
      user: { id: userId },
    },
  } = useSession();

  const [cars, setCars] = useState([]);

  const router = useRouter();
  const navTo = (path) => {
    router.push(path);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // navTo("/profile");
    await getUserCars(userId)
      .then((rsp) => {
        console.log(rsp);
        setCars(rsp);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  const handleDelete = async (id) => {
    await deleteCar(id)
      .then(async (rsp) => {
        // console.log(rsp);
        await fetchData();
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  return (
    <div>
      <div className="flex flex-col h-full text-center mt-2 text-[#333333]">
        {cars.map((car) => (
          <SwipeToDelete
            key={car.id}
            onDelete={() => handleDelete(car.id)}
            height={65} // required
            // optional
            deleteComponent={
              <div style={{ display: "flex", placeContent: "center" }}>
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 2,
                    marginRight: 5,
                  }}
                >
                  刪除
                </span>

                <DeleteIcon />
              </div>
            }
            transitionDuration={250} // default
            deleteWidth={100} // default
            deleteColor="rgba(252, 58, 48, 1.00)" // default
            rtl={false} // default
          >
            <CarItem key={car.carNo} car={car} />
          </SwipeToDelete>
        ))}
      </div>
      <div className="mx-[27px] mt-[30px] text-center">
        {cars.length < 5 && (
          <button
            type="button"
            className={` 
          rounded-full w-full  
          ${styles["btn-primary"]}
          ${styles["round-wrapper-btn"]}
          mb-[10px]
          text-[16px] font-medium
          flex items-center justify-center
      `}
            onClick={() => navTo("car-edit")}
          >
            <AddIcon />
            新增您的愛車
          </button>
        )}
        <p className="text-[13px]">最多5台車輛，左滑可刪除</p>
      </div>
    </div>
  );
};

export default CarList;

CarList.getLayout = function getLayout(page) {
  return (
    <Layout
      header={
        <div style={{ height: 60 }}>
          <Navbar title={"車輛資料"} backUrl={"/profile"} />
        </div>
      }
      paddingNo={0}
    >
      {page}
    </Layout>
  );
};
