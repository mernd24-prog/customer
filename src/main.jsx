import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { store } from "./app/store";
import App from "./App";
import LazyToast from "./components/ui/LazyToast";
import { BrowserRouter } from "react-router-dom";
import "./styles.css";

// Remove passwords retained by older versions; never persist credentials here.
for (const storageName of ["localStorage", "sessionStorage"]) {
  try {
    window[storageName].removeItem("sam_global_previous_password");
  } catch {
    // Storage may be disabled by the browser.
  }
}

// Defer SW registration to after the page is fully loaded
if (import.meta.env.PROD) {
  window.addEventListener("load", () => {
    const register = () => import("virtual:pwa-register").then(({ registerSW }) => registerSW({ immediate: true }));
    setTimeout(() => {
      if ("requestIdleCallback" in window) {
        requestIdleCallback(register);
      } else {
        register();
      }
    }, 3000);
  }, { once: true });
} else if ("serviceWorker" in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => registration.unregister());
  });
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <Provider store={store}>
    <HelmetProvider>
      <BrowserRouter>
        <App />
        <LazyToast />
      </BrowserRouter>
    </HelmetProvider>
  </Provider>,
);
