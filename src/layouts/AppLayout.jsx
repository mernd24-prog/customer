import { Outlet } from "react-router-dom";
import { Header } from "../components/organism/Hearder";
import { Footer } from "../components/organism/footer";

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Header />
      <main className="main-content" style={{ width: "90%" }}>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
