import React, { Suspense, useEffect, useState } from "react";

const ToastContainer = React.lazy(() => {
  return Promise.all([
    import("react-toastify"),
    import("react-toastify/dist/ReactToastify.css"),
    import("./toast.css"),
  ]).then(([module]) => ({
    default: (props) => (
      <module.ToastContainer {...props} transition={module.Slide} />
    ),
  }));
});

export default function LazyToast() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!("requestIdleCallback" in window)) {
      setReady(true);
      return undefined;
    }

    const callbackId = window.requestIdleCallback(() => setReady(true));
    return () => window.cancelIdleCallback(callbackId);
  }, []);

  if (!ready) return null;

  return (
    <Suspense fallback={null}>
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
        toastClassName="customer-toast"
        bodyClassName="customer-toast-body"
        progressClassName="customer-toast-progress"
      />
    </Suspense>
  );
}
