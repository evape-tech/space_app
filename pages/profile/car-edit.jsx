import { useState } from "react";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import { Input, Select, TextInput } from "@mantine/core";
import { useForm, isNotEmpty } from "@mantine/form";
import { createCar } from "@/client-api/car";
import { useSession } from "next-auth/react";

const CarEdit = () => {
  const router = useRouter();

  const {
    data: {
      user: { id: userId },
    },
  } = useSession();

  // const [formValues, setFormValues] = useState({});
  const form = useForm({
    initialValues: {
      brand: "",
      model: "",
      carNo1: "",
      carNo2: "",
    },

    validate: {
      brand: isNotEmpty(),
      model: isNotEmpty(),
      carNo1: isNotEmpty(),
      carNo2: isNotEmpty(),
    },
  });

  const handleSubmit = form.onSubmit(
    (values, _event) => {
      const body = { ...values };
      body.carNo = `${body.carNo1}-${body.carNo2}`;
      body.userId = userId;
      delete body.carNo1;
      delete body.carNo2;
      // setFormValues(body);
      // console.log(body);
      createCar(body, userId)
        .then((rsp) => {
          navTo("car-list");
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

  const navTo = (path) => {
    router.push(path);
  };

  // return <TextInput label="Your name" {...form.getInputProps("name")} />;
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-full gap-[30px] items-center"
    >
      <TextInput
        label="廠牌"
        className="w-full"
        withAsterisk
        {...form.getInputProps("brand")}
      />
      <TextInput
        label="車型"
        className="w-full"
        withAsterisk
        {...form.getInputProps("model")}
      />
      <div className="flex w-full gap-3">
        <TextInput
          label="車牌"
          className="w-full"
          withAsterisk
          {...form.getInputProps("carNo1")}
        />
        <div className="mt-[25px]">~</div>
        <TextInput
          label="&nbsp;"
          className="w-full"
          {...form.getInputProps("carNo2")}
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

export default CarEdit;

CarEdit.getLayout = function getLayout(page) {
  return (
    <Layout
      header={
        <div style={{ height: 60 }}>
          <Navbar title="新增您的愛車" />
        </div>
      }
    >
      {page}
    </Layout>
  );
};
