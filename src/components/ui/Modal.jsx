// import React from "react";
// export default function Modal({ open, title, children, onClose }) {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center">
//       <div className="absolute inset-0 bg-black/30" onClick={onClose} />
//       <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-soft p-6">
//         <div className="font-semibold text-lg mb-2">{title}</div>
//         {children}
//       </div>
//     </div>
//   );
// }

import React from "react";

export default function Modal({ open, title, children, onClose, size = "md" }) {
  if (!open) return null;

  // Map sizes to Tailwind max-width classes
  const sizeMap = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-3xl",
    xl: "max-w-5xl",
    full: "max-w-7xl",
  };
  const maxWidth = sizeMap[size] || sizeMap.md;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/30"
        onClick={onClose}
      />

      {/* Dialog */}
      <div
        className={`relative z-10 w-full ${maxWidth} bg-white rounded-2xl shadow-xl p-6`}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-lg">{title}</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Body */}
        {children}
      </div>
    </div>
  );
}
