import LayoutWoAuth from "@/components/layout-woAuth";
import Navbar from "@/components/navbar";
import styles from "@/styles/privacy-term.module.scss";
import clsx from "clsx";
import { setReadPrivacy } from '@/utils/storeTool'

import { useRouter } from "next/router";

const PrivacyTerm = () => {
  const router = useRouter();

  const navTo = (path) => {
    router.push(path);
  };

  function handleClick() {
    setReadPrivacy(true)
    navTo("login");
  }

  return (
    <div
      className="flex flex-col h-full gap-[30px] 
      text-center
     "
    >
      {/* justify-center */}
      <h2>使用條 款及免責聲明</h2>
      <div className={`${clsx(styles["layout-out"])}`}>
        <p className={`${clsx(styles.content)}`}>
          {`
            本網站由「SpcePark」所經營。本網站重視每一個使用者所享有的服務，特此說明本網站的使用政策，以保障您的權益。請您細讀本使用條款的內容：

            1. 關於《使用條款》
            1) 在您決定使用本網站所提供的服務(以下簡稱本服務)前，請仔細閱讀本使用條款。您必須在完全同意以下條款的前提下，才能使用本服務。本使用條款與其他附加條件或其他特殊條款相矛盾時，以附加條件或特殊條款為準。
            2) 本網站有權於任何時間修改或變更本使用條款之內容，您應經常查看以瞭解您當前的權利及義務。若您於本網站為任何修改或變更本使用條款後仍繼續使用本服務，視為您已同意接受本使用條款之修改及變更。用條款後仍繼續使用本服務，視為您已同意接受本使用條款之。用條款後仍繼續使用本服務，視為您已同意接受本使條款後仍繼續使用本服務，視為您已同意接受本使用條款之修改及變更。用條款後仍繼續使用本服務，視為您已同意接受本使用條款之。用條款後仍繼續使用本服務，視為您已同意接受本使
            `}
        </p>
      </div>

      <button
        type="button"
        className={`py-2 px-4 rounded-full w-full  ${styles["btn-primary"]}
        `}
        onClick={handleClick}
      >
        我已詳閱並同意
      </button>
    </div>
  );
};

export default PrivacyTerm;

PrivacyTerm.getLayout = function getLayout(page) {
  return <LayoutWoAuth>{page}</LayoutWoAuth>;
};
