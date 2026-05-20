function Input({ label, error, className = '', ...props }) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-sm text-text-secondary">{label}</label>
      )}
      <input
        className={`h-12 bg-bg-input border ${error ? 'border-danger' : 'border-border'} rounded-input px-4 text-text-primary placeholder:text-text-muted focus:outline-none focus:border-primary transition-colors ${className}`}
        {...props}
      />
      {error && (
        <span className="text-xs text-danger">{error}</span>
      )}
    </div>
  )
}

export default Input
