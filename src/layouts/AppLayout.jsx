import { Outlet } from "react-router-dom";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import AboutBanner from "../components/about/AboutBanner";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      {/* <AboutBanner /> */}
      <main className="main-content" style={{ width: "90%" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
