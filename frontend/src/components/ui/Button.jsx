const variantClasses = {
  primary:
    "bg-primary text-white hover:bg-primary-hover focus:ring-primary/30",
  secondary:
    "bg-secondary text-white hover:bg-primary focus:ring-secondary/30",
  success:
    "bg-success text-white hover:bg-emerald-600 focus:ring-success/30",
  warning:
    "bg-warning text-slate-900 hover:bg-amber-600 focus:ring-warning/30",
  error:
    "bg-error text-white hover:bg-red-600 focus:ring-error/30",
  ghost:
    "bg-transparent text-primary border border-primary hover:bg-primary/10 focus:ring-primary/30",
};

const Button = ({
  variant = "primary",
  className = "",
  children,
  ...props
}) => {
  const classes = variantClasses[variant] || variantClasses.primary;

  return (
    <button
      className={`inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background ${classes} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
