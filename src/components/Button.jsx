function Button({ children, variant = 'primary', className = '', ...props }) {
  const baseStyles = 'min-h-[44px] px-6 py-3 rounded-lg font-medium transition-all duration-200'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary-light active:bg-primary-dark',
    secondary: 'bg-transparent border border-border text-text-primary hover:bg-bg-hover',
    danger: 'bg-danger text-white hover:bg-danger/90',
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button
