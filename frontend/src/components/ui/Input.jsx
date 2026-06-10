const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full rounded-lg border border-border bg-surface px-4 py-3 text-text placeholder:text-muted shadow-sm transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 ${className}`}
      {...props}
    />
  );
};

export default Input;
