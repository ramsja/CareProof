"use client";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}

export function Dialog({ open, onClose, title, description, children, className }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    if (open) el.showModal();
    else el.close();
  }, [open]);

  // Close on backdrop click
  const handleClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current) onClose();
  };

  // Close on Escape
  const handleCancel = (e: React.SyntheticEvent) => {
    e.preventDefault();
    onClose();
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      onClick={handleClick}
      onCancel={handleCancel}
      className={cn(
        "w-full max-w-md rounded-xl border border-gray-200 bg-white p-0 shadow-xl",
        "backdrop:bg-gray-900/50",
        className,
      )}
      aria-labelledby="dialog-title"
      aria-describedby={description ? "dialog-desc" : undefined}
    >
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 id="dialog-title" className="text-base font-semibold text-gray-900">{title}</h2>
        {description && (
          <p id="dialog-desc" className="mt-1 text-sm text-gray-500">{description}</p>
        )}
      </div>
      <div className="px-6 py-4">{children}</div>
    </dialog>
  );
}
