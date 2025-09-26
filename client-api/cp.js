import request from "@/utils/request";

const cpApiUrl = process.env.NEXT_PUBLIC_CP_URL;
const cpApiUrl_sim = process.env.NEXT_PUBLIC_CP_URL_SIM;

// cmd="get_cp_status"
// cmd="cmd_stop_charging"
export function cpCmd(cmd, cpid) {
  let cpBaseUrl = cpid === "2001" ? cpApiUrl_sim : cpApiUrl;
  const data = {
    apikey: "cp_api_key16888",
    cmd,
    cp_id: cpid,
    cpBaseUrl,
  };
  return request({
    url: `/cpCmd`,
    method: "post",
    data,
  });
}

// cmd="cmd_start_charging"
export function cpStartCmd(cmd, cpid, roundId) {
  let cpBaseUrl = cpid === "2001" ? cpApiUrl_sim : cpApiUrl;
  const data = {
    apikey: "cp_api_key16888",
    cmd: "cmd_start_charging",
    cp_id: cpid,
    start_charging_id: roundId, // data6
    cpBaseUrl,
  };
  return request({
    url: `/cpCmd`,
    method: "post",
    data,
  });
}

// old version
// export function cpCmd(cmd, cpid) {
//     const data = {
//         "apikey": "cp_api_key16888",
//         cmd,
//         "cp_id": cpid
//     }
//     return request({
//         url: cpApiUrl,
//         method: 'post',
//         data
//     })
// }

export function getCpByKey(cpid) {
  return request({
    url: `/cp/${cpid}`,
    method: "get",
  });
}

export function cpReport(cpid) {
  return request({
    url: `/cp/${cpid}`,
    method: "post",
  });
}

export function cpRoundCheckout(roundId) {
  return request({
    url: `/cp/checkout/${roundId}`,
    method: "get",
  });
}

// {
//     "stationId": 1,
//     "cpIdKey": "1001",
//     "userId": 30,
// }
export function cpRoundStart(data) {
  return request({
    url: `/cp/round`,
    method: "post",
    data,
  });
}

// {
//     "fee": 100, 10 x kWh
//     "kWh": 0.5
// }
// export function cpRoundEnd(data, cpId) {
//   return request({
//     url: `/cp/round/${cpId}`,
//     method: "post",
//     data,
//   });
// }
