export default function Badge({ tone = 'gray', dot = false, children, ...rest }) {
  return (
    <span className={`badge badge-${tone}`} {...rest}>
      {dot && <span className="badge-dot" />}
      {children}
    </span>
  )
}
