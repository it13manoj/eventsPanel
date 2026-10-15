import { useRef, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
  children: React.ReactNode;
  showCloseButton?: boolean;
  isFullscreen?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className = "",
  showCloseButton = true,
  isFullscreen = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow || "unset";
      };
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full min-h-screen rounded-none"
    : "relative z-10 w-full max-h-[92vh] flex flex-col rounded-2xl sm:rounded-3xl bg-white dark:bg-gray-900 shadow-2xl border border-gray-100 dark:border-gray-800 transition-all";

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center p-3 sm:p-5 md:p-6 overflow-hidden overscroll-none">
      {/* Backdrop with consistent modern opacity and blur */}
      {!isFullscreen && (
        <div
          className="fixed inset-0 h-full w-full bg-black/60 backdrop-blur-sm transition-opacity duration-300"
          style={{ transform: "translateZ(0)" }}
          onClick={onClose}
        />
      )}

      {/* Modal Dialog Card */}
      <div
        ref={modalRef}
        className={`${contentClasses} ${className}`}
        style={{ transform: "translateZ(0)" }}
        onClick={(e) => e.stopPropagation()}
      >
        {showCloseButton && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="absolute right-3 top-3 sm:right-5 sm:top-5 z-50 flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full bg-gray-100/90 text-gray-500 hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-800/90 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white transition-all shadow-xs"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
        <div className="w-full flex-1 min-h-0 flex flex-col overflow-hidden">{children}</div>
      </div>
    </div>
  );
};
