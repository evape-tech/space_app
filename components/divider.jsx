const Divider = ({ children }) => {
  return (
    <div className="">
      <div className="inline-block bg-white px-[15px]">{children}</div>
      <div
        className="
        -mt-[30px]
          border-b-[1px] 
          border-[##FBFBFB]
          h-[20px]
      "
      ></div>
    </div>
  );
};

export default Divider;
