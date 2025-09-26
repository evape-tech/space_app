import { useEffect } from "react";
import Image from "next/image";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";
import { useRouter } from "next/router";
import { Button } from "@mantine/core";
import { updateUserStatus } from '@/utils/storeTool'

const CpopCancel = () => {
  const router = useRouter();

  useEffect(() => {
    // reset cpid / rid
    updateUserStatus({
      cpid: null,
      rid: null,
    })
  }, []);

  return (
    <div
      className="flex flex-col h-full gap-[30px] 
      items-center text-center
     "
    >
      <div className="mt-[100px] mb-[30px]">
        <div className="text-[18px] font-medium mb-[15px]">充電取消</div>
        <div>
          未偵測到充電槍，已取消此次充電...
          <br />
          <Button
            onClick={() => {
              router.push("cpop-code");
            }}
          >
            重新輸入充電槍編號
          </Button>
        </div>
      </div>
      <Image
        src="/images/cp-cnn-cancel.png"
        alt="Picture of the author"
        width={250}
        height={250}
      />
    </div>
  );
};

export default CpopCancel;

CpopCancel.getLayout = function getLayout(page) {
  return (
    <Layout darkMode header={<Navbar backUrl={"station-map"} />}>
      {page}
    </Layout>
  );
};
