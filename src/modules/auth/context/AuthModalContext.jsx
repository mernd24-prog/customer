import {
  createContext,
  lazy,
  useCallback,
  useContext,
  useRef,
  useState,
  Suspense,
} from "react";

const AuthModal = lazy(() => import("../../../components/ui/overlay/AuthModal"));
const GuestOtpAuthModal = lazy(
  () => import("../../../components/ui/overlay/GuestOtpAuthModal"),
);

const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isOtpOpen, setIsOtpOpen] = useState(false);
  const pendingActionRef = useRef(null);

  const openAuthModal = useCallback((onSuccess) => {
    pendingActionRef.current =
      typeof onSuccess === "function" ? onSuccess : null;

    setIsOtpOpen(false);
    setIsOpen(true);
  }, []);

  const openGuestOtpModal = useCallback((onSuccess) => {
    pendingActionRef.current =
      typeof onSuccess === "function" ? onSuccess : null;

    setIsOpen(false);
    setIsOtpOpen(true);
  }, []);

  const closeAuthModal = useCallback(() => {
    pendingActionRef.current = null;
    setIsOpen(false);
    setIsOtpOpen(false);
  }, []);

  const handleAuthSuccess = useCallback(async () => {
    const pendingAction = pendingActionRef.current;

    pendingActionRef.current = null;
    setIsOpen(false);
    setIsOtpOpen(false);

    if (typeof pendingAction === "function") {
      await pendingAction();
    }
  }, []);

  return (
    <AuthModalContext.Provider
      value={{
        openAuthModal,
        openGuestOtpModal,
        closeAuthModal,
        isOpen,
        isOtpOpen,
      }}
    >
      {children}

      <Suspense fallback={null}>
        {isOpen && (
          <AuthModal
            open={isOpen}
            onClose={closeAuthModal}
            onSuccess={handleAuthSuccess}
            onGuestLogin={() => {
              setIsOpen(false);
              setIsOtpOpen(true);
            }}
          />
        )}

        {isOtpOpen && (
          <GuestOtpAuthModal
            open={isOtpOpen}
            onClose={closeAuthModal}
            onSuccess={handleAuthSuccess}
            onNormalLogin={() => {
              setIsOtpOpen(false);
              setIsOpen(true);
            }}
          />
        )}
      </Suspense>
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const context = useContext(AuthModalContext);

  if (!context) {
    throw new Error(
      "useAuthModal must be used within <AuthModalProvider>",
    );
  }

  return context;
}
