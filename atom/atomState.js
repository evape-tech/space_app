import { atom } from 'recoil';

export const userPosState = atom({
  key: 'userPos', // 必須唯一，不可有相同的key
  default: null, // 預設值
});

export const currStationInfoState = atom({
  key: 'currStationInfo',
  default: null,
});

export const currPSInfoState = atom({
  key: 'currPSInfo',
  default: null,
});

