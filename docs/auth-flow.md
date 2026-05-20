# Customer Auth Flow

This document explains how authentication works in the customer React app, how sessions are restored, and how the app decides whether a logged-in user is a buyer, seller, or admin.

## Main Files

- `src/App.jsx`: session restore, top-level routes, and route guard placement.
- `src/routing/RouteGuards.jsx`: guest, protected, buyer, seller, and admin route decisions.
- `src/features/auth/authSlice.js`: auth Redux state, token storage, and current user updates.
- `src/features/domainThunks.js`: auth async thunks and API endpoint mapping.
- `src/api/client.js`: Axios client, bearer token attachment, and refresh-token retry.
- `src/api/tokenStorage.js`: localStorage access and refresh token helpers.
- `src/api/endpoints.js`: auth endpoint constants.
- `src/utils/roles.js`: frontend role detection helpers.

## Auth Routes

Defined in `src/features/auth/authRoutes.js`.

| Route | Page | Purpose |
| --- | --- | --- |
| `/login` | `LoginPage` | Password login for non-seller accounts |
| `/register` | `BuyerRegisterPage` | Buyer registration |
| `/register/otp` | `RegisterOtpPage` | Buyer registration with OTP verification |
| `/verify-registration` | `VerifyRegistrationPage` | Complete buyer registration OTP |
| `/verify-otp` | `VerifyOtpPage` | Seller OTP login |
| `/forgot-password` | `ForgotPasswordPage` | Request password reset OTP |
| `/reset-password` | `ResetPasswordPage` | Reset password with OTP |

These routes are wrapped in `GuestRoute`, so a logged-in user is redirected to `/` if they try to open login or registration screens.

## API Thunks

Auth thunks live in `src/features/domainThunks.js`.

| Thunk | API |
| --- | --- |
| `registerUser` | `POST /api/v1/auth/register` |
| `registerUserWithOtp` | `POST /api/v1/auth/register-otp` |
| `verifyRegistration` | `POST /api/v1/auth/verify-registration` |
| `loginUser` | `POST /api/v1/auth/login` |
| `socialLogin` | `POST /api/v1/auth/social` |
| `refreshSession` | `POST /api/v1/auth/refresh` |
| `sendOtp` | `POST /api/v1/auth/send-otp` |
| `verifyOtp` | `POST /api/v1/auth/verify-otp` |
| `resendOtp` | `POST /api/v1/auth/resend-otp` |
| `forgotPassword` | `POST /api/v1/auth/forgot-password` |
| `resetPassword` | `POST /api/v1/auth/reset-password` |
| `changePassword` | `POST /api/v1/auth/change-password` |
| `checkAuthStatus` | `GET /api/v1/auth/status` |

## Session Restore

On app boot, `App.jsx` checks localStorage through `tokenStorage`.

```text
App loads
-> check localStorage for access token or refresh token
-> if no token exists, mark session ready
-> if token exists, dispatch checkAuthStatus()
-> if status succeeds, set auth.current
-> if status fails, dispatch logout() and clear tokens
```

There is an 8 second safety timeout. If session restore hangs, the app logs out and continues instead of staying on the loading screen forever.

After `auth.current` exists, `App.jsx` also dispatches `fetchCart()`.

## Token Handling

`src/api/client.js` attaches the access token to every API request:

```text
Authorization: Bearer <accessToken>
```

If a request returns `401`, the client attempts one refresh:

```text
401 response
-> read refresh token from localStorage
-> POST /api/v1/auth/refresh
-> save new tokens
-> retry original request
```

If refresh fails, the client clears tokens and emits `auth:logout`. `App.jsx` listens for that event and dispatches `logout()`.

## Redux Auth State

`authSlice` stores session data in Redux.

Important state:

```text
state.auth.current
state.auth.loading
state.auth.error
state.auth.meta
```

For session-producing thunks such as login, registration verification, OTP login, social login, and refresh, `authSlice` extracts tokens and user data from the response.

```text
successful auth response
-> save accessToken and refreshToken in localStorage
-> set state.auth.current to the response user
```

`state.auth.current` is the frontend source of truth for whether a user is logged in.

## Password Login Flow

Handled by `src/pages/auth/LoginPage.jsx`.

```text
User opens /login
-> enters email and password
-> dispatch loginUser()
-> POST /api/v1/auth/login
-> authSlice saves tokens and user
-> navigate to location.state.from or "/"
```

`location.state.from` is set by `ProtectedRoute` when a logged-out user tries to open a protected page such as `/checkout` or `/orders`.

Example:

```text
logged-out user opens /checkout
-> ProtectedRoute redirects to /login with from="/checkout"
-> login succeeds
-> LoginPage navigates back to /checkout
```

## Buyer Registration Flow

Normal buyer registration is handled by `src/features/auth/BuyerRegisterPage.jsx`.

```text
User opens /register
-> form builds payload with role: "buyer"
-> dispatch registerUser()
-> POST /api/v1/auth/register
-> if backend returns session, navigate "/"
-> otherwise navigate /verify-registration with email
```

The buyer registration payload is created in `src/features/auth/buildBuyerRegistrationPayload.js`, and the role is locked to `buyer`.

```js
role: "buyer"
```

## Buyer OTP Registration Flow

Handled by `src/pages/auth/RegisterOtpPage.jsx` and `src/pages/auth/VerifyRegistrationPage.jsx`.

```text
User opens /register/otp
-> submits buyer registration data with role: "buyer"
-> dispatch registerUserWithOtp()
-> POST /api/v1/auth/register-otp
-> navigate /verify-registration with email
-> user enters OTP
-> dispatch verifyRegistration()
-> POST /api/v1/auth/verify-registration
-> authSlice saves tokens and user
-> navigate "/"
```

This OTP flow is for creating and verifying a buyer account.

## Seller OTP Login Flow

Handled by `src/pages/auth/VerifyOtpPage.jsx`.

```text
User opens /verify-otp
-> enters email
-> clicks Send OTP
-> dispatch sendOtp({ email, purpose: "login" })
-> POST /api/v1/auth/send-otp
-> enters OTP
-> dispatch verifyOtp({ email, otp, purpose: "login" })
-> POST /api/v1/auth/verify-otp
-> authSlice saves tokens and seller user
-> navigate to location.state.from or "/"
```

Backend rules make this login OTP flow seller-only:

```text
buyer/admin trying login OTP
-> backend returns "OTP login is only available for seller accounts"
```

If a seller lands on `/` after OTP login, `BuyerOnlyRoute` redirects them to `/seller/status`.

```text
seller user navigates to "/"
-> BuyerOnlyRoute detects seller role
-> redirect /seller/status
```

## Forgot Password Flow

Handled by `src/pages/auth/ForgotPasswordPage.jsx` and `src/pages/auth/ResetPasswordPage.jsx`.

```text
User opens /forgot-password
-> enters email
-> dispatch forgotPassword()
-> POST /api/v1/auth/forgot-password
-> navigate /reset-password with email
-> user enters email, OTP, and new password
-> dispatch resetPassword()
-> POST /api/v1/auth/reset-password
-> navigate /login with email
```

Password reset does not log the user in automatically.

## Role Detection

The frontend role helpers live in `src/utils/roles.js`.

```js
export const SELLER_ROLES = ["seller", "seller-sub-admin"];
export const ADMIN_ROLES = ["admin", "sub-admin", "super-admin"];

export function getRole(user) {
  return user?.role || user?.user?.role || user?.account?.role;
}
```

The app checks role from these possible locations:

```text
auth.current.role
auth.current.user.role
auth.current.account.role
```

Then it classifies users like this:

```text
"seller" or "seller-sub-admin"
-> seller

"admin", "sub-admin", or "super-admin"
-> admin

"buyer"
-> buyer
```

Important: `BuyerOnlyRoute` only blocks seller roles. It does not explicitly require `role === "buyer"`.

## Route Guards

Defined in `src/routing/RouteGuards.jsx`.

### GuestRoute

Used around auth pages.

```text
if auth.current exists
-> redirect "/"
else
-> allow route
```

### ProtectedRoute

Used around logged-in buyer pages.

```text
if auth.current exists
-> allow route
else
-> redirect /login with state.from = current path
```

### BuyerOnlyRoute

Used around buyer storefront and buyer account pages.

```text
if role is seller or seller-sub-admin
-> redirect /seller/status
else
-> allow route
```

### SellerOnlyRoute

Used around seller status and seller tracking pages.

```text
if role is seller or seller-sub-admin
-> allow route
else
-> redirect "/"
```

### AdminOnlyRoute

Used around admin pages.

```text
if role is admin, sub-admin, or super-admin
-> allow route
else
-> redirect "/"
```

## Practical Redirect Examples

### Buyer login from checkout

```text
/checkout while logged out
-> /login with from="/checkout"
-> password login succeeds
-> /checkout
```

### Seller OTP login

```text
/verify-otp
-> OTP login succeeds as seller
-> navigate "/"
-> BuyerOnlyRoute redirects to /seller/status
```

### Logged-in buyer opens seller page

```text
/seller/status
-> SellerOnlyRoute sees buyer role
-> redirect "/"
```

### Logged-in seller opens product page

```text
/products
-> BuyerOnlyRoute sees seller role
-> redirect /seller/status
```

### Logged-in admin opens admin page

```text
/admin/products
-> AdminOnlyRoute sees admin role
-> allow route
```

## Backend Role Constants

The backend role constants are defined in `backend/src/shared/constants/roles.js`.

```js
admin
sub-admin
seller
seller-sub-admin
buyer
super-admin
```

The backend includes the user's role in token payloads and login responses. The customer frontend reads the role from the returned user object and from restored auth status.

## Current Behavior Summary

```text
Buyer:
can use password login
can register normally or with OTP
can use buyer storefront and protected buyer pages

Seller:
must use OTP login
is redirected away from buyer pages
can view /seller/status and /seller/tracking

Admin:
can access admin routes if role is admin, sub-admin, or super-admin
is not treated as seller
```

