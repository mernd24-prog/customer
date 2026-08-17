import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { store } from "./app/store";
import App from "./App";
import LazyToast from "./components/ui/LazyToast";
import "./styles.css";
// Defer SW registration to after the page is fully loaded
if (import.meta.env.PROD) {
  window.addEventListener("load", () => {
    // Use requestIdleCallback if available for even less main-thread impact
    const register = () => import("virtual:pwa-register").then(({ registerSW }) => registerSW({ immediate: true }));
    if ("requestIdleCallback" in window) {
      requestIdleCallback(register);
    } else {
      register();
    }
  }, { once: true });
} else if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <App />
        <LazyToast />
      </HelmetProvider>
    </Provider>
  </React.StrictMode>,
);
