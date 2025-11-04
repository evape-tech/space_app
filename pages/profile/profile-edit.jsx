import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { Select, TextInput } from "@mantine/core";
import { useForm, isNotEmpty, isEmail } from "@mantine/form";

import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { updateProfile, getProfileById, updateUserProfileFromBackend, getUserProfileFromBackend } from "@/client-api/user";
import { fetchData } from "next-auth/client/_utils";

const ProfileEdit = () => {
  const router = useRouter();
  const { data: session } = useSession();
  const userId = session?.user?.id;

  const [formValues, setFormValues] = useState({});
  const [bDay, setbDay] = useState(dayjs().year(dayjs().$y - 20));

  const form = useForm({
    initialValues: {
      email: "",
      fullName: "",
      phone: "",
      birthY: bDay.$y,
      birthM: bDay.$M + 1,
      birthD: bDay.$D,
    },

    validate: {
      email: (value) => {
        if (value.length < 1) return true;
        if (/^\S+@\S+$/.test(value)) return null;
        else return "電子郵件格式錯誤";
      },
      fullName: isNotEmpty(),
      phone: isNotEmpty("電話號碼不能為空"),
    },
  });

  const navTo = (path) => {
    router.push(path);
  };

  function range(start, end) {
    return Array(end - start + 1)
      .fill()
      .map((_, idx) => start + idx);
  }

  const years = () => {
    const a = dayjs().$y - 120;
    const b = dayjs().$y;
    return range(a, b);
  };

  const mons = () => {
    return range(1, 12);
  };

  const days = () => {
    return range(1, 31);
  };

  const handleSubmit = form.onSubmit(
    (values, _event) => {
      const body = { ...values };
      
      console.log('表單值:', body);
      
      // 轉換為後端期望的格式
      const updateData = {
        email: body.email || '',
        firstName: body.fullName.split('')[0] || '',  // 第一個字作為 firstName
        lastName: body.fullName.split('').slice(1).join('') || '',  // 剩餘字作為 lastName
        phone: body.phone || '',
        dateOfBirth: new Date(body.birthY, body.birthM - 1, body.birthD).toISOString().split('T')[0]
      };
      
      console.log('更新資料:', updateData);
      console.log('發送 token:', session?.accessToken);
      
      updateUserProfileFromBackend(session?.accessToken, updateData)
        .then((rsp) => {
          alert('個人資料已更新');
          navTo("/profile");
        })
        .catch((error) => {
          console.error('更新失敗:', error.message);
          alert('更新失敗: ' + error.message);
        });
    },
    (validationErrors, _values, _event) => {
      console.log(validationErrors);
    }
  );

  const fetchData = async () => {
    if (!session?.accessToken) {
      console.warn('尚未登入或 token 不存在');
      return;
    }

    try {
      const data = await getUserProfileFromBackend(session.accessToken);
      const profile = data.user;
      console.log('取得使用者資料:', profile);
      
      form.setValues({
        email: profile.email || "",
        fullName: profile.firstName && profile.lastName ? `${profile.firstName}${profile.lastName}` : "",
        phone: profile.phone || "",
        birthY: profile.dateOfBirth ? dayjs(profile.dateOfBirth).$y : dayjs().$y,
        birthM: profile.dateOfBirth ? dayjs(profile.dateOfBirth).$M + 1 : dayjs().$M + 1,
        birthD: profile.dateOfBirth ? dayjs(profile.dateOfBirth).$D : dayjs().$D,
      });
    } catch (error) {
      console.error('取得使用者資料失敗:', error.message);
    }
  };

  useEffect(() => {
    if (session?.accessToken) {
      fetchData();
    }
  }, [session?.accessToken]);

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full gap-[30px] items-center"
    >
      <TextInput
        label="姓名"
        className="w-full"
        placeholder="請輸入您的名字"
        {...form.getInputProps("fullName")}
        withAsterisk
      />
      <TextInput
        label="Email"
        className="w-full"
        placeholder="請輸入您的Email"
        {...form.getInputProps("email")}
        withAsterisk
      />
      <TextInput
        label="電話"
        className="w-full"
        placeholder="請輸入您的電話號碼"
        {...form.getInputProps("phone")}
        withAsterisk
      />
      <div className="flex gap-3">
        <Select
          label="生日"
          placeholder="西元"
          data={years().map((y) => {
            return {
              value: y,
              label: y,
            };
          })}
          {...form.getInputProps("birthY")}
          withAsterisk
        />
        <Select
          label="&nbsp;"
          placeholder="月"
          data={mons().map((m) => {
            return {
              value: m,
              label: m,
            };
          })}
          {...form.getInputProps("birthM")}
        />
        <Select
          label="&nbsp;"
          placeholder="日"
          data={days().map((d) => {
            return {
              value: d,
              label: d,
            };
          })}
          {...form.getInputProps("birthD")}
        />
      </div>

      <button
        type="submit"
        className={`py-2 px-4 rounded-full w-full  ${styles["btn-primary"]}`}
      >
        儲存
      </button>
    </form>
  );
};

export default ProfileEdit;

ProfileEdit.getLayout = function getLayout(page) {
  return (
    <Layout
      header={
        <div style={{ height: 60 }}>
          <Navbar title="個人資料設定" />
        </div>
      }
    >
      {page}
    </Layout>
  );
};
