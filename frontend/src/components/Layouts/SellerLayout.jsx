import SellerSidebar from "../Sidebar/SellerSidebar";

const SellerLayout = ({ children }) => {
  return (
    <>
      <SellerSidebar />
      <div className="pt-20 px-4">{children}</div>
    </>
  );
};

export default SellerLayout;
