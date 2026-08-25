const fs = require('fs');

const replacements = [
  // pages/auth -> modules/auth/pages
  { file: 'src/routing/AppRoutes.jsx', find: '../pages/auth/LoginPage', replace: '../modules/auth/pages/LoginPage' },
  { file: 'src/routing/AppRoutes.jsx', find: '../pages/auth/RegisterOtpPage', replace: '../modules/auth/pages/RegisterOtpPage' },
  { file: 'src/routing/AppRoutes.jsx', find: '../pages/auth/VerifyRegistrationPage', replace: '../modules/auth/pages/VerifyRegistrationPage' },
  { file: 'src/routing/AppRoutes.jsx', find: '../pages/auth/ForgotPasswordPage', replace: '../modules/auth/pages/ForgotPasswordPage' },
  { file: 'src/routing/AppRoutes.jsx', find: '../pages/auth/ResetPasswordPage', replace: '../modules/auth/pages/ResetPasswordPage' },
  { file: 'src/routing/AppRoutes.jsx', find: '../features/auth/BuyerRegisterPage', replace: '../modules/auth/pages/BuyerRegisterPage' },

  // features/auth -> modules/auth/{slices,context,routes}
  { file: 'src/modules/auth/pages/RegisterOtpPage.jsx', find: '../../features/auth/authRoutes', replace: '../routes/authRoutes' },
  { file: 'src/modules/auth/pages/RegisterOtpPage.jsx', find: '../../features/auth/authSlice', replace: '../slices/authSlice' },
  { file: 'src/modules/auth/pages/LoginPage.jsx', find: '../../features/auth/authRoutes', replace: '../routes/authRoutes' },
  { file: 'src/modules/auth/pages/LoginPage.jsx', find: '../../features/auth/authSlice', replace: '../slices/authSlice' },
  { file: 'src/modules/auth/pages/LoginPage.jsx', find: '../../features/auth/AuthModalContext', replace: '../context/AuthModalContext' },
  { file: 'src/modules/auth/pages/ResetPasswordPage.jsx', find: '../../features/auth/authRoutes', replace: '../routes/authRoutes' },
  { file: 'src/modules/auth/pages/ResetPasswordPage.jsx', find: '../../features/auth/authSlice', replace: '../slices/authSlice' },
  { file: 'src/modules/auth/pages/VerifyRegistrationPage.jsx', find: '../../features/auth/authRoutes', replace: '../routes/authRoutes' },
  { file: 'src/modules/auth/pages/VerifyRegistrationPage.jsx', find: '../../features/auth/authSlice', replace: '../slices/authSlice' },
  { file: 'src/modules/auth/pages/ForgotPasswordPage.jsx', find: '../../features/auth/authRoutes', replace: '../routes/authRoutes' },
  { file: 'src/modules/auth/pages/ForgotPasswordPage.jsx', find: '../../features/auth/authSlice', replace: '../slices/authSlice' },
  
  { file: 'src/modules/products/controllers/actions/useWishlistActions.js', find: '../../../../features/auth/AuthModalContext', replace: '../../../../modules/auth/context/AuthModalContext' },
  { file: 'src/modules/products/components/ProductReviewsSection.jsx', find: '../../../features/auth/AuthModalContext', replace: '../../../modules/auth/context/AuthModalContext' },
  { file: 'src/modules/support/pages/SupportHelpCenter.jsx', find: '../../../features/auth/AuthModalContext', replace: '../../../modules/auth/context/AuthModalContext' },
  { file: 'src/modules/support/components/RaiseTicketModal.jsx', find: '../../../features/auth/AuthModalContext', replace: '../../../modules/auth/context/AuthModalContext' },
  { file: 'src/modules/cart/controllers/useCart.js', find: '../../../features/auth/AuthModalContext', replace: '../../auth/context/AuthModalContext' },
  { file: 'src/pages/account/SecurityTab.jsx', find: '../../features/auth/authSlice', replace: '../../modules/auth/slices/authSlice' },
  { file: 'src/pages/reviewAndRating/ReviewDetailsPage.jsx', find: '../../features/auth/AuthModalContext', replace: '../../modules/auth/context/AuthModalContext' },
  
  { file: 'src/app/store.js', find: '../features/auth/authSlice', replace: '../modules/auth/slices/authSlice' },
  { file: 'src/layouts/Header.jsx', find: '../features/auth/authSlice', replace: '../modules/auth/slices/authSlice' },
  { file: 'src/layouts/header/TopHeader.jsx', find: '../../features/auth/authSlice', replace: '../../modules/auth/slices/authSlice' },
  { file: 'src/layouts/AppLayout.jsx', find: '../features/auth/authRoutes', replace: '../modules/auth/routes/authRoutes' },
  { file: 'src/routing/AppRoutes.jsx', find: '../features/auth/authRoutes', replace: '../modules/auth/routes/authRoutes' },
  { file: 'src/App.jsx', find: './features/auth/AuthModalContext', replace: './modules/auth/context/AuthModalContext' },
  { file: 'src/App.jsx', find: './features/auth/authSlice', replace: './modules/auth/slices/authSlice' },
  { file: 'src/layouts/header/Navbar.jsx', find: '../../features/auth/authSlice', replace: '../../modules/auth/slices/authSlice' },
  { file: 'src/components/ui/overlay/AuthModal.jsx', find: '../../../features/auth/authRoutes', replace: '../../../modules/auth/routes/authRoutes' },
  { file: 'src/components/ui/overlay/GuestOtpAuthModal.jsx', find: '../../../features/auth/authSlice', replace: '../../../modules/auth/slices/authSlice' }
];

for (const {file, find, replace} of replacements) {
  try {
    if (!fs.existsSync(file)) continue;
    let content = fs.readFileSync(file, 'utf8');
    content = content.replace(new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replace);
    fs.writeFileSync(file, content);
    console.log(`Replaced in ${file}`);
  } catch (err) {
    console.error(`Error in ${file}: ${err.message}`);
  }
}
