import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import { useState, useEffect } from "react";
import clsx from "clsx";
import { checkOutPage } from "@/client-api/recharge";

const ShowHTML = ({ html }) => {
  // const html = "<h1>hello</h1>";
  return <iframe srcDoc={html} className="h-screen w-full"></iframe>;
};

const Recharge = () => {
  const router = useRouter();
  const {
    query: { orderTxNo, userId, points },
  } = router;
  const [ecpayForm, setEcpayForm] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const data = {
      orderTxNo,
      userId,
      points,
    };
    // navTo("/profile");
    await checkOutPage(data)
      .then((rsp) => {
        console.log(rsp);
        setEcpayForm(rsp);
      })
      .catch((error) => {
        console.log(error.message);
      });
  };

  return ecpayForm && <ShowHTML html={ecpayForm} />;
};

export default Recharge;
