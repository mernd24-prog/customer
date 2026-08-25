const fs = require('fs');

const replacements = [
  { file: 'src/modules/products/pages/ProductDetailPage.jsx', find: '../../../pages/cart/components/QuantitySelector', replace: '../../cart/components/QuantitySelector' },
  { file: 'src/pages/products/ProductDetailPage.jsx', find: '../../pages/cart/components/QuantitySelector', replace: '../../modules/cart/components/QuantitySelector' },
  { file: 'src/pages/watchList/WatchListPage.jsx', find: '../../pages/cart/components/CartItemCard', replace: '../../modules/cart/components/CartItemCard' },
  { file: 'src/layouts/AppLayout.jsx', find: '../pages/cart/components/AddedToCartModal', replace: '../modules/cart/components/AddedToCartModal' },
  { file: 'src/routing/AppRoutes.jsx', find: '../pages/cart/CartPage', replace: '../modules/cart/pages/CartPage' },

  { file: 'src/modules/products/controllers/actions/useCartActions.js', find: '../../../../features/cart/cartSlice', replace: '../../../../modules/cart/slices/cartSlice' },
  { file: 'src/modules/products/controllers/actions/useCartActions.js', find: '../../../../features/cart/cartUiSlice', replace: '../../../../modules/cart/slices/cartUiSlice' },
  { file: 'src/modules/products/controllers/actions/useWishlistActions.js', find: '../../../../features/cart/cartSlice', replace: '../../../../modules/cart/slices/cartSlice' },
  { file: 'src/modules/products/controllers/actions/useWishlistActions.js', find: '../../../../features/cart/cartUiSlice', replace: '../../../../modules/cart/slices/cartUiSlice' },
  
  { file: 'src/modules/checkout/controllers/useCheckout.js', find: '../../../features/cart/cartSlice', replace: '../../../modules/cart/slices/cartSlice' },
  { file: 'src/modules/cart/controllers/useCart.js', find: '../../../features/cart/cartSlice', replace: '../slices/cartSlice' },
  { file: 'src/pages/auth/LoginPage.jsx', find: '../../features/cart/cartSlice', replace: '../../modules/cart/slices/cartSlice' },
  { file: 'src/app/store.js', find: '../features/cart/cartSlice', replace: '../modules/cart/slices/cartSlice' },
  { file: 'src/app/store.js', find: '../features/cart/cartUiSlice', replace: '../modules/cart/slices/cartUiSlice' },
  { file: 'src/layouts/AppLayout.jsx', find: '../features/cart/cartUiSlice', replace: '../modules/cart/slices/cartUiSlice' },
  { file: 'src/components/ui/overlay/GuestOtpAuthModal.jsx', find: '../../../features/cart/cartSlice', replace: '../../../modules/cart/slices/cartSlice' },
  { file: 'src/App.jsx', find: './features/cart/cartSlice', replace: './modules/cart/slices/cartSlice' },
];

for (const {file, find, replace} of replacements) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
    fs.writeFileSync(file, content);
    console.log(`Replaced in ${file}`);
  } catch (err) {
    console.error(`Error in ${file}: ${err.message}`);
  }
}
