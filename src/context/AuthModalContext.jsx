import { createContext, useCallback, useContext, useState } from "react";
import AuthModal from "../components/common/overlay/AuthModal";

/**
 * Context shape: { openAuthModal, closeAuthModal, isOpen }
 *
 * Scalable: add `openSignupModal`, `openOtpModal`, etc. to this context
 * in the future without touching consumers.
 */
const AuthModalContext = createContext(null);

export function AuthModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);

  const openAuthModal = useCallback(() => setIsOpen(true), []);
  const closeAuthModal = useCallback(() => setIsOpen(false), []);

  return (
    <AuthModalContext.Provider value={{ openAuthModal, closeAuthModal, isOpen }}>
      {children}
      <AuthModal open={isOpen} onClose={closeAuthModal} />
    </AuthModalContext.Provider>
  );
}

/**
 * Hook to open/close the global auth required modal from anywhere in the app.
 *
 * Usage:
 *   const { openAuthModal } = useAuthModal();
 *   if (!user) { openAuthModal(); return; }
 */
export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) {
    throw new Error("useAuthModal must be used within <AuthModalProvider>");
  }
  return ctx;
}
