import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "../components/layout/Header";
import { Footer } from "../components/layout/Footer";
import AddedToCartModal from "../components/cart/AddedToCartModal";
import { closeAddedToCartModal } from "../features/cart/cartUiSlice";

const EMPTY_ITEMS = [];

export default function AppLayout() {
  const dispatch = useDispatch();
  const addedModalOpen = useSelector((state) => state.cartUi.addedModalOpen);
  const addedProduct = useSelector((state) => state.cartUi.addedProduct);
  const cartItems = useSelector((state) => state.cart.current?.items ?? EMPTY_ITEMS);

  return (
    <div className="app-shell">
      <Header />

      <main className="main-content" style={{ width: "90%" }}>
        <Outlet />
      </main>
      <Footer />
      <AddedToCartModal
        open={addedModalOpen}
        onClose={() => dispatch(closeAddedToCartModal())}
        addedProduct={addedProduct}
        cartItems={cartItems}
      />
    </div>
  );
}
