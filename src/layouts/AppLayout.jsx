import { Outlet, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Header, CategoryBar } from "./Header";
import { Footer } from "./Footer";
import AddedToCartModal from "../components/cart/AddedToCartModal";
import { closeAddedToCartModal } from "../features/cart/cartUiSlice";
import ScrollTopButton from "../components/common/ScrollTopButton";
import { footerData } from "../data/footer";

const EMPTY_ITEMS = [];

/** Pages where the CategoryBar should NOT render from the layout
 *  (homepage already has its own CategoryBar instance). */
const HIDE_CATEGORY_BAR_ROUTES = [
  "/",           // homepage renders its own CategoryBar
  "/login",
  "/register",
  "/checkout",
];

export default function AppLayout() {
  const dispatch = useDispatch();
  const location = useLocation();
  const addedModalOpen = useSelector((state) => state.cartUi.addedModalOpen);
  const addedProduct = useSelector((state) => state.cartUi.addedProduct);
  const cartItems = useSelector(
    (state) => state.cart.current?.items ?? EMPTY_ITEMS,
  );

  const showCategoryBar = !HIDE_CATEGORY_BAR_ROUTES.some(
    (route) =>
      location.pathname === route ||
      (route !== "/" && location.pathname.startsWith(route + "/")),
  );

  return (
    <div className="customer-shell app-shell">
      <Header />

      <main className={`main-content customer-container pt-[var(--customer-header-height,0px)] ${showCategoryBar ? 'mt-[46px]' : ''}`}>
        {showCategoryBar && <CategoryBar compact />}
        <Outlet />
      </main>
      <Footer data={footerData} />
      <ScrollTopButton />
      <AddedToCartModal
        open={addedModalOpen}
        onClose={() => dispatch(closeAddedToCartModal())}
        addedProduct={addedProduct}
        cartItems={cartItems}
      />
    </div>
  );
}
