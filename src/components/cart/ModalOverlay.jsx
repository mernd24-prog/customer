export default function ModalOverlay({
    children,
    onClose,
}) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
            <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-xl">
                {children}

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-xl font-bold transition hover:bg-gray-100"
                >
                    ×
                </button>
            </div>
        </div>
    );
}