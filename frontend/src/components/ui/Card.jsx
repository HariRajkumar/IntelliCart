const Card = ({ className = "", children }) => {
  return (
    <div className={`rounded-3xl border border-border bg-surface shadow-sm ${className}`}>
      {children}
    </div>
  );
};

export default Card;
