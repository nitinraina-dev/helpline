/**
 * Primary action button with consistent black styling.
 * @param {string} [className] - Additional Tailwind classes to merge
 * @param {React.ReactNode} children - Button label or content
 * @param {React.ButtonHTMLAttributes} props - Any native button attribute (onClick, disabled, type, …)
 */
export default function Button({
  children,
  className = "",
  ...props
}) {
  return (
    <button
      className={`px-4 py-2 rounded-lg text-white bg-black disabled:opacity-50 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}