import { Link, Outlet } from "react-router-dom";
import { Header } from "../components/organism/Hearder";
import { Footer } from "../components/organism/footer";
import MothersDaySwiper from "../components/mothersDaySwiper";

export default function AppLayout() {

  return (
    <div className="app-shell">
      <Header />
      <main className="main-content" style={{ width: "90%" }}>
        <Outlet />
      </main>
      <MothersDaySwiper />
      <Footer />
    </div>
  );
}
