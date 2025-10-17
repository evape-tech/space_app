import { useState } from "react";
import styles from "@/styles/verify-code.module.scss";
import Layout from "@/components/layout";
import Navbar from "@/components/navbar";


import ArrowIcon from "@/image/icons/chevron-down.svg";
import ParkingIcon from "@/image/icons/parking.svg";

// import { useRouter } from "next/router";


// {
//   id: 2,
//   stationName: "abc 充電站",
//   km: 2,
//   spaces: 5,
// },

const StationItem = ({ station }) => {
  // const router = useRouter();
  const navTo = (path) => {
    router.push(path);
  };


  const { name, floor, spaceCount, meters } = station;

  // compute gun counts from meters -> guns
  let totalGuns = 0;
  let acGuns = 0;
  let dcGuns = 0;
  const gunsList = [];
  if (Array.isArray(meters)) {
    meters.forEach((m) => {
      if (Array.isArray(m.guns)) {
        m.guns.forEach((g) => {
          totalGuns += 1;
          const acdc = (g.acdc || "").toString().toUpperCase();
          if (acdc === "AC") acGuns += 1;
          else if (acdc === "DC") dcGuns += 1;
          gunsList.push({ ...g, meter_no: m.meter_no });
        });
      }
    });
  }

  const [expanded, setExpanded] = useState(false);
  return (
    <div className="w-full bg-white border-b-2">
      <div
        className="text-[15px] flex p-[15px] 
      justify-between items-center w-full"
      >
        <div className="text-left">
          <div>{name || '未命名'}-{floor || '未知樓層'}</div>
          {/* gun counts summary */}
          <div className="text-[12px] text-[#828282] mt-1">
            槍數: {totalGuns} {totalGuns > 0 && ` (AC ${acGuns} / DC ${dcGuns})`}
          </div>
        </div>
        <button
          onClick={() => setExpanded((s) => !s)}
          aria-expanded={expanded}
          className="p-2 rounded-full"
          style={{ transform: expanded ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 150ms ease' }}
        >
          <ArrowIcon />
        </button>
      </div>

      {/* Expanded gun list */}
      {expanded && (
        <div className="px-4 pb-4">
          {gunsList.length === 0 ? (
            <div className="text-[13px] text-[#828282]">尚無電槍資料</div>
          ) : (
            <div className="flex flex-col gap-2 mt-2">
                {gunsList.map((g) => (
                  <div key={g.id} className="flex items-center justify-between text-[13px] p-3 bg-white rounded-lg shadow-sm">
                    <div className="flex-1 text-left">
                      <div className="font-medium text-[14px]">{g.cpsn || g.cpid || `槍 ${g.id}`}</div>
                      <div className="text-[#828282] text-[12px] mt-2">
                        {g.connector ? `Connector: ${g.connector}` : null}
                        {g.max_kw ? ` • ${g.max_kw}kW` : null}
                        {g.guns_status ? ` • ${g.guns_status}` : null}
                      </div>
                    </div>
                    <div className="ml-4 flex-shrink-0">
                      <div className="px-3 py-1 bg-gray-100 rounded-full text-[12px] text-[#616161]">{((g.acdc || '')).toString().toUpperCase()}</div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StationItem;
