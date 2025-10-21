import { useState } from "react";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import { Input, Select, TextInput } from "@mantine/core";
import { useForm, isNotEmpty } from "@mantine/form";
import { createCar, createCarForBackend, getCarsBrandsListFromBackend } from "@/client-api/car";
import { useEffect } from "react";
import { useSession } from "next-auth/react";

const CarEdit = () => {
  const router = useRouter();

  const { data: session } = useSession();
  const userId = session?.user?.id;

  // const [formValues, setFormValues] = useState({});
  const [brands, setBrands] = useState([]);
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

  useEffect(() => {
    // load brands list for the Select
    getCarsBrandsListFromBackend()
      .then((rsp) => {
        // API returns { success: true, brands: [...] }
        setBrands((rsp && rsp.brands) || []);
      })
      .catch((err) => console.log(err.message));
  }, []);

  const handleSubmit = form.onSubmit(
    (values, _event) => {
      // ensure brandId is the selected id (number)
      const parsedBrandId = parseInt(values.brand, 10);
      const brandIdToSend = Number.isInteger(parsedBrandId) ? parsedBrandId : values.brand;

      // Build payload to match backend curl: { brandId, modelName, licensePlate }
      const payload = {
        brandId: brandIdToSend,
        modelName: values.model,
        licensePlate: `${values.carNo1}-${values.carNo2}`,
      };

      createCarForBackend(payload, session.accessToken)
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
      <Select
        label="廠牌"
        data={brands.map((b) => ({ value: String(b.id), label: `${b.name} (${b.nameEn})` }))}
        placeholder="請選擇廠牌"
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
