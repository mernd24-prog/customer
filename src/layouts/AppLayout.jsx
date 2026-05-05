import { Link, Outlet, } from "react-router-dom";
// import { Bell, Package, Search, ShoppingCart, UserRound } from "lucide-react";
// import { useDispatch, useSelector } from "react-redux";
// import { logout } from "../features/auth/authSlice";
// import { AUTH_ROUTES } from "../features/auth/authRoutes";
// import { getRole, isSellerRole } from "../utils/roles";
import Header from "../components/Header/Hearder";
import Navbar from "../components/Navbar/NavBar";

export default function AppLayout() {
  // const dispatch = useDispatch();
  // const navigate = useNavigate();
  // const user = useSelector((state) => state.auth.current);
  // const role = getRole(user);
  // const seller = isSellerRole(role);

  // const links = seller
  //   ? [
  //       ["/seller/status", "Status"],
  //       ["/seller/tracking", "Tracking"],
  //     ]
  //   : [
  //       ["/products", "Products"],
  //       ["/products/search", "Search"],
  //       ["/orders", "Orders"],
  //       ["/returns", "Returns"],
  //       ["/wallet", "Wallet"],
  //       ["/loyalty", "Loyalty"],
  //     ];

  return (
    <div className="app-shell">
      {/* <header className="topbar">
        <Link to={seller ? "/seller/status" : "/"} className="brand">
          Sam Global
        </Link>
        <nav>
          {links.map(([href, label]) => (
            <NavLink key={href} to={href}>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="header-actions">
          {!seller && (
            <Link className="icon-button" to="/products/search" title="Search">
              <Search size={18} />
            </Link>
          )}
          {!seller && (
            <Link
              className="icon-button"
              to="/notifications"
              title="Notifications"
            >
              <Bell size={18} />
            </Link>
          )}
          {!seller && (
            <Link className="icon-button" to="/cart" title="Cart">
              <ShoppingCart size={18} />
            </Link>
          )}
          {!seller && (
            <Link className="icon-button" to="/warranty" title="Warranty">
              <Package size={18} />
            </Link>
          )}
          {!seller && (
            <Link className="icon-button" to="/account" title="Account">
              <UserRound size={18} />
            </Link>
          )}
          {!user ? (
            <Link className="button" to={AUTH_ROUTES.login}>
              Login
            </Link>
          ) : (
            <button
              className="button secondary"
              onClick={() => {
                dispatch(logout());
                navigate(AUTH_ROUTES.login);
              }}
            >
              Logout
            </button>
          )}
        </div>
      </header> */}
      <Navbar/>
      <Header />

      <main>
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
