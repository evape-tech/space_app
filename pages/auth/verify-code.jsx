import styles from "@/styles/verify-code.module.scss";
import clsx from "clsx";
import LayoutWoAth from "@/components/layout-woAuth";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import AuthCode from "react-auth-code-input";
import { useState } from "react";
import InputCode from "@/components/InputCode";
import { useEffect } from "react";
import { Loader } from "@mantine/core";
import { Badge } from "@mantine/core";
import { signIn } from "next-auth/react";

const VerifyCode = () => {
  const router = useRouter();
  console.log(router.query.vcode);
  const [phoneNo, setPhoneNo] = useState(router.query.phoneNo);
  const [vcode, setVcode] = useState(router.query.vcode);
  const [inputCode, setInputCode] = useState("");
  // const [isDisabled, setIsDisabled] = useState(true);
  const [currentLen, setCurrentLen] = useState(0);
  const [invalid, setInvalid] = useState(false);
  const {
    query: { callbackUrl },
  } = router;

  // const navTo = (path) => {
  //   router.push(path);
  // };
  // const [result, setResult] = useState();
  // const handleOnChange = (res) => {
  //   setResult(res);
  // };

  const onComplete = (code) => {
    setInputCode(code);
    // setIsDisabled(false);
  };

  const onKeyPress = (n) => {
    setInvalid(false);
    setCurrentLen(n);
  };

  const verifyCode = async () => {
    if (inputCode === vcode) {
      // check phone no. if exist skip, if none , create.
      // create a user by phoneNo.
      const res = await signIn("credentials", {
        phoneNo,
        redirect: false,
      });
      if (res?.ok) {
        router.push("/cpop/station-map");
      }
    } else setInvalid(true);
  };

  return (
    <div
      className="flex flex-col h-full gap-[30px]
      items-center text-center"
    >
      <div className="mt-[50px] mb-0">
        <div className="text-[18px] font-medium mb-[15px]">請輸入驗證碼</div>
        <div>已經發送到 {phoneNo}</div>
      </div>
      {
        <div style={{ opacity: invalid ? 1 : 0 }}>
          <Badge color="red" size="xl" radius="md" variant="filled">
            驗證碼錯誤
          </Badge>
        </div>
      }
      <div>
        <InputCode length={6} onComplete={onComplete} onKeyPress={onKeyPress} />
      </div>

      <button
        type="button"
        className={`py-2 px-4 rounded-full w-full ${clsx(
          styles["btn-primary"],
          currentLen < 6 && styles.disabled
        )}`}
        onClick={verifyCode}
      >
        確定
      </button>
      <a onClick={() => router.back()} className="text-[13px] text-[#333333]">
        未收到驗證號碼？
      </a>
    </div>
  );
};

export default VerifyCode;

VerifyCode.getLayout = function getLayout(page) {
  return <LayoutWoAth header={<Navbar />}>{page}</LayoutWoAth>;
};
