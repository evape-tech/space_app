import CpItem from "./cp-item";

const CpList = ({ cpListData }) => {
  return cpListData.map((park) => <CpItem key={park.cpIdKey} park={park} />);
};

export default CpList;
