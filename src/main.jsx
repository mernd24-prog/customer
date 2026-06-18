import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { Slide, ToastContainer } from "react-toastify";
import { registerSW } from "virtual:pwa-register";
import "react-toastify/dist/ReactToastify.css";
import { store } from "./app/store";
import App from "./App";
import "./styles.css";

if (import.meta.env.PROD) {
  registerSW({ immediate: true });
} else if ("serviceWorker" in navigator) {
  // Prevent stale SW from hijacking dev assets and returning HTML for JS chunk requests.
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        {/* <AppErrorBoundary> */}
          <App />
        {/* </AppErrorBoundary> */}
        <ToastContainer
          position="bottom-center"
          autoClose={2000}
          newestOnTop
          closeOnClick
          pauseOnHover
          draggable
          hideProgressBar={false}
          pauseOnFocusLoss={false}
          limit={1}
          theme="light"
          transition={Slide}
          toastClassName="customer-toast"
          bodyClassName="customer-toast-body"
          progressClassName="customer-toast-progress"
        />
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);
