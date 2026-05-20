function Badge({ score }) {
  const getColor = () => {
    if (score >= 70) return 'bg-primary text-white'
    if (score >= 40) return 'bg-warning text-white'
    return 'bg-danger text-white'
  }

  return (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getColor()}`}>
      Score: {score}%
    </span>
  )
}

export default Badge
