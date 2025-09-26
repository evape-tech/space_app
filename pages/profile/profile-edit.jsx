import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import { Input, Select, TextInput, Radio } from "@mantine/core";
import { useForm, isNotEmpty, isEmail } from "@mantine/form";

import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import DistrictData from "@/data/taiwan-district-zip-code.json";
import { updateProfile, getProfileById } from "@/client-api/user";
import { fetchData } from "next-auth/client/_utils";

const ProfileEdit = () => {
  const router = useRouter();
  const {
    data: {
      user: { id: uid },
    },
  } = useSession();

  const [formValues, setFormValues] = useState({});
  const [bDay, setbDay] = useState(dayjs().year(dayjs().$y - 20));

  const [cities, setCities] = useState(DistrictData);
  const [areas, setAreas] = useState([]);

  const form = useForm({
    initialValues: {
      email: "",
      fullName: "",
      nickName: "",
      birthY: bDay.$y,
      birthM: bDay.$M + 1,
      birthD: bDay.$D,
      gender: "",
      city: "",
      area: "",
      addr: "",
    },

    validate: {
      email: (value) => {
        if (value.length < 1) return true;
        if (/^\S+@\S+$/.test(value)) return null;
        else return "電子郵件格式錯誤";
      },
      // isEmail("電子郵件格式錯誤"),
      fullName: isNotEmpty(),
      nickName: isNotEmpty(),
      gender: isNotEmpty(),
      city: isNotEmpty(),
      area: isNotEmpty(),
      addr: isNotEmpty(),
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

  const handleCitySel = (v) => {
    form.setFieldValue("area", null);
    setAreas(DistrictData[v].districts);
  };
  const handleAreaSel = (v) => {
    setArea(v);
  };

  // console.log(DistrictData);
  // onClick={() => }

  const handleSubmit = form.onSubmit(
    (values, _event) => {
      const body = { ...values };
      const birthDay = new Date(body.birthY, body.birthM - 1, body.birthD);
      body.birth = birthDay;
      body.city = body.city + "";
      delete body.birthY;
      delete body.birthM;
      delete body.birthD;
      setFormValues(body);
      console.log(body);
      updateProfile(body, uid)
        .then((rsp) => {
          navTo("/profile");
        })
        .catch((error) => console.log(error.message));
    },
    (validationErrors, _values, _event) => {
      console.log(validationErrors);
      // setModalText(validationErrors.accepted);
      // setOpened(true);
      // alert(validationErrors.accepted);
    }
  );

  const fetchData = async () => {
    await getProfileById(uid)
      .then((rsp) => {
        const profile = rsp.profile;
        console.log(profile);
        handleCitySel(+profile.city);
        form.setValues({
          email: profile.email,
          fullName: profile.fullName,
          nickName: profile.nickName,
          birthY: dayjs(profile.birth).$y,
          birthM: dayjs(profile.birth).$M + 1,
          birthD: dayjs(profile.birth).$D,
          gender: profile.gender,
          city: +profile.city,
          area: profile.area,
          addr: profile.addr,
        });
      })
      .catch((error) => console.log(error.message));
  };

  useEffect(() => {
    fetchData();
  }, []);

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

      <TextInput
        label="匿稱"
        className="w-full"
        withAsterisk
        {...form.getInputProps("nickName")}
      />
      <Radio.Group
        name="gender"
        label="性別"
        {...form.getInputProps("gender")}
        withAsterisk
        className="w-full"
      >
        <Radio value="male" label="男" />
        <Radio value="female" label="女" />
        <Radio value="other" label="其它" />
      </Radio.Group>

      <div className="flex gap-3">
        <Select
          label="居住地點"
          placeholder="縣市"
          data={cities.map((c, i) => ({ value: i, label: c.name }))}
          {...form.getInputProps("city")}
          onChange={(v) => {
            handleCitySel(v);
            if (form.getInputProps(`city`).onChange)
              form.getInputProps(`city`).onChange(v);
          }}
          withAsterisk
        />
        <Select
          label="&nbsp;"
          placeholder="鄉鎮市區"
          data={areas.map((a, i) => ({ value: a.zip, label: a.name }))}
          {...form.getInputProps("area")}
        />
      </div>
      <TextInput
        className="w-full"
        placeholder="地址"
        {...form.getInputProps("addr")}
      />
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
