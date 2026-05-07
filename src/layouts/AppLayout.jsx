import { Outlet } from "react-router-dom";
import { Header } from "../components/organism/Hearder";
import { Footer } from "../components/organism/footer";
import InfoSection from "../components/ui/sections/InfoSection";
// import Banner from "../components/organism/Banner";


export default function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
<InfoSection/>

       {/* <Banner /> */}
      <main className="main-content" style={{ width: "90%" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
