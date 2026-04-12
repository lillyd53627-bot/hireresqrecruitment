import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";

const Layout = () => {
  return (
    <>
      <Header />
      
      <main>
        <Outlet />   {/* 🔥 THIS IS WHAT YOU ARE MISSING */}
      </main>
      
      <Footer />
    </>
  );
};

export default Layout;