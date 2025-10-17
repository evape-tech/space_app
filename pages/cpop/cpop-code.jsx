import styles from "@/styles/verify-code.module.scss";
import clsx from "clsx";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import AuthCode from "react-auth-code-input";
import { useState } from "react";
import InputCode from "@/components/InputCode";
import { Badge } from "@mantine/core";
import { getCpByKey, getCpidByKeyFromBackend } from "@/client-api/cp";
import { updateUserStatus } from "@/utils/storeTool";

const CpopCode = () => {
  const router = useRouter();
  // const [loading, setLoading] = useState(false);

  const [inputCode, setInputCode] = useState("");
  const [currentLen, setCurrentLen] = useState(0);
  const [invalid, setInvalid] = useState(false);

  const navTo = (path) => {
    router.push(path);
  };

  const onComplete = (code) => {
    setInputCode(code);
  };

  const onKeyPress = (n) => {
    setInvalid(false);
    setCurrentLen(n);
  };

  const checkCpExist = () => {
    return new Promise((resolve, reject) => {
      getCpidByKeyFromBackend(inputCode)
        .then((rsp) => resolve(true))
        .catch((err) => reject(false));
    });
  };

  const handleCheckCP = async () => {
    let cp = await checkCpExist();
    if (cp) {
      updateUserStatus({ cpid: inputCode })
      router.push("cpop-conn");
    } else setInvalid(true);
  };

  return (
    <div
      className="flex flex-col h-full gap-[30px] 
      items-center text-center"
    >
      <div className="text-[18px] font-medium mt-[50px]">請輸入充電槍編號</div>

      {
        <div style={{ opacity: invalid ? 1 : 0 }}>
          <Badge color="red" size="xl" radius="md" variant="filled">
            充電槍沒有找到
          </Badge>
        </div>
      }

      <div>
        <InputCode length={4} onComplete={onComplete} onKeyPress={onKeyPress} />
      </div>

      <button
        type="button"
        className={`py-2 px-4 rounded-full w-full ${clsx(
          styles["btn-primary"],
          currentLen < 4 && styles.disabled
        )}`}
        onClick={handleCheckCP}
      >
        確定
      </button>
    </div>
  );
};

export default CpopCode;

CpopCode.getLayout = function getLayout(page) {
  return <Layout header={<Navbar backUrl={"station-map"} />}>{page}</Layout>;
};
