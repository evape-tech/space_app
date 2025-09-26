import React, { useState } from "react";
import clsx from "clsx";
import Logo from "@/image/icons/logo.svg";
import Google from "@/image/icons/google.svg";
import Line from "@/image/icons/line.svg";
import LayoutWoAth from "@/components/layout-woAuth";
import Divider from "@/components/divider";
import styles from "@/styles/login.module.scss";
import { useRouter } from "next/router";
import { Input, TextInput, Checkbox, Modal, Button } from "@mantine/core";
import { useForm } from "@mantine/form";
import { signIn, useSession } from "next-auth/react";

const Login = ({ providers }) => {
  const [formValues, setFormValues] = useState({});
  const router = useRouter();
  const [opened, setOpened] = useState(false);
  const [modalText, setModalText] = useState("");
  const {
    query: { callbackUrl },
  } = router;

  const [accepted, setAccepted] = useState(true);

  const { data, status } = useSession();
  // console.log("zevi", data);

  const form = useForm({
    initialValues: {
      phoneNo: "",
      // accepted: true,
    },
    validate: {
      phoneNo: (value) =>
        /^09\d{2}-*\d{6}$/.test(value) ? null : "手機號碼錯誤",
      // accepted: (value) => (value ? null : "請勾選《使用條款與隱私條款》"),
    },
  });

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "authenticated") {
    router.push({
      pathname: "/",
    });
  }

  const socialLogin = (providerId) => {
    if (!checkAccepted()) return;
    signIn(providerId, { callbackUrl });
  };

  const smsSend = async (phoneNo, vcode) => {
    const smsUrl = "/api/send-sms";

    try {
      const res = await fetch(smsUrl, {
        method: "POST",
        body: JSON.stringify({
          phoneNo,
          vcode,
        }),
        headers: { "Content-Type": "application/json" },
      });
      let sendRsp = await res.json();
      // console.log(sendRsp);
      router.push(
        {
          pathname: "verify-code",
          query: { phoneNo, vcode },
        },
        "verify-code"
      );
    } catch (error) {
      console.log(error.message);
    }
  };

  const checkAccepted = () => {
    if (accepted) return true;
    setModalText("請勾選《使用條款與隱私條款》");
    setOpened(true);
    return false;
  };

  const handleSubmit = form.onSubmit(
    (values, _event) => {
      if (!checkAccepted()) return;
      setFormValues(values);
      console.log(values);
      let vcode =
        Math.floor(1 + Math.random() * 9) +
        ("" + Math.random()).substring(2, 7); // no zero ahead
      smsSend(values.phoneNo.replaceAll("-", ""), vcode);
    },
    (validationErrors, _values, _event) => {
      console.log(validationErrors);
      // setModalText(validationErrors.accepted);
      // setOpened(true);
      // alert(validationErrors.accepted);
    }
  );

  return (
    <div className="flex flex-col h-full gap-[30px] text-center">
      <Modal opened={opened} onClose={() => setOpened(false)} title="提示">
        {modalText}
      </Modal>
      <div className="logo w-[65%] mx-auto">
        <Logo />
      </div>
      <form onSubmit={handleSubmit} className="flex flex-col gap-[30px]">
        <TextInput
          placeholder="請輸入您的手機號碼"
          {...form.getInputProps("phoneNo")}
        />

        <button
          type="submit"
          className={`py-2 px-4 rounded-full w-full ${clsx(
            styles["btn-primary"],
            !form.isValid("phoneNo") && styles.disabled
          )}`}
        >
          登入或註冊
        </button>
      </form>

      <div className="my-[30px]">
        <Divider>或使用其他方式登入</Divider>
      </div>

      <div className="flex justify-between gap-5">
        <button
          type="button"
          className={`rounded-full w-full ${clsx(
            styles["btn-primary"],
            styles["round-wrapper"]
          )} flex items-center text-[15px]`}
          onClick={() => socialLogin("google")}
        >
          <Google />
          &nbsp;&nbsp;Google登入
        </button>
        <button
          type="button"
          className={`rounded-full w-full ${clsx(
            styles["btn-primary"],
            styles["round-wrapper"]
          )} flex items-center text-[15px]`}
          onClick={() => socialLogin("line")}
        >
          <Line />
          &nbsp;&nbsp;Line登入
        </button>
      </div>
      {/* <Checkbox
        label="我已詳閱並同意《使用條款與隱私條款》"
        {...form.getInputProps("accepted", { type: "checkbox" })}
      /> */}
      <Checkbox
        label="我已詳閱並同意《使用條款與隱私條款》"
        checked={accepted}
        onChange={(event) => setAccepted(event.currentTarget.checked)}
      />
    </div>
  );
};

export default Login;

Login.getLayout = function getLayout(page) {
  return <LayoutWoAth>{page}</LayoutWoAth>;
};
