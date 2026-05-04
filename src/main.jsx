import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { HelmetProvider } from "react-helmet-async";
import { ToastContainer } from "react-toastify";
import { registerSW } from "virtual:pwa-register";
import "react-toastify/dist/ReactToastify.css";
import { store } from "./app/store";
import App from "./App";
import "./styles.css";

registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Provider store={store}>
      <HelmetProvider>
        <App />
        <ToastContainer position="top-right" autoClose={3500} newestOnTop />
      </HelmetProvider>
    </Provider>
  </React.StrictMode>
);
