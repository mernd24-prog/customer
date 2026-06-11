import { Outlet } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "./Header";
import { Footer } from "./Footer";
import AddedToCartModal from "../components/cart/AddedToCartModal";
import { closeAddedToCartModal } from "../features/cart/cartUiSlice";
import ScrollTopButton from "../components/common/ScrollTopButton";
import { footerData } from "../data/footer";

const EMPTY_ITEMS = [];

export default function AppLayout() {
  const dispatch = useDispatch();
  const addedModalOpen = useSelector((state) => state.cartUi.addedModalOpen);
  const addedProduct = useSelector((state) => state.cartUi.addedProduct);
  const cartItems = useSelector(
    (state) => state.cart.current?.items ?? EMPTY_ITEMS,
  );

  return (
    <div className="customer-shell app-shell">
      <Header />

      <main className="main-content customer-container pt-[90px] lg:pt-[150px]">
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
