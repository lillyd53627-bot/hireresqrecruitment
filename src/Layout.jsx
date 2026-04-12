const DashboardLayout = ({ children }) => {
  return (
    <>
      <Header />
      <main>
        {children}   {/* THIS IS CRITICAL */}
      </main>
      <Footer />
    </>
  );
};

export default DashboardLayout;