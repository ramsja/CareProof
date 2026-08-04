import { cn } from "@/lib/utils";

interface FormFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <label
        htmlFor={htmlFor}
        className="text-sm font-medium text-gray-700"
      >
        {label}
        {required && (
          <span className="ml-1 text-red-500" aria-hidden="true">*</span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className="text-xs text-gray-500">{hint}</p>
      )}
      {error && (
        <p role="alert" className="text-xs text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function Input({ error, className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors",
        "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1",
        error
          ? "border-red-400 focus:ring-red-500"
          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
        className,
      )}
      {...props}
    />
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function Textarea({ error, className, ...props }: TextareaProps) {
  return (
    <textarea
      className={cn(
        "w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors",
        "placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-1",
        "resize-y min-h-[80px]",
        error
          ? "border-red-400 focus:ring-red-500"
          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
        className,
      )}
      {...props}
    />
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
}

export function Select({ error, className, children, ...props }: SelectProps) {
  return (
    <select
      className={cn(
        "w-full rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors",
        "focus:outline-none focus:ring-2 focus:ring-offset-1 bg-white",
        error
          ? "border-red-400 focus:ring-red-500"
          : "border-gray-300 focus:border-blue-500 focus:ring-blue-500",
        "disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-500",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
