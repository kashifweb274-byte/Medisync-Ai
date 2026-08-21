import { initials } from '../../lib/format'

export function Avatar({ name = '', size = 'md', style }) {
  const cls = `avatar avatar-${size}`
  return (
    <span className={cls} style={style} title={name} aria-hidden>
      {initials(name)}
    </span>
  )
}
