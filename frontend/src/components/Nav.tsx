import { NavLink } from 'react-router-dom'

const linkBase =
  'rounded-full px-3 py-1.5 text-[13px] font-medium transition-colors duration-200'

export function Nav() {
  return (
    <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pt-5">
      <div className="flex items-center justify-between">
        <div className="font-display text-[22px] tracking-tight text-textDark">
          Future Fighter
        </div>
        <nav className="flex items-center gap-2 rounded-full border border-glassBorder bg-glassBg px-2 py-1 backdrop-blur-[16px] [-webkit-backdrop-filter:blur(16px)]">
          <NavLink
            to="/"
            className={({ isActive }) =>
              [
                linkBase,
                isActive ? 'bg-[rgba(200,192,216,0.22)] text-textDark' : 'text-textMid hover:bg-[rgba(200,192,216,0.15)]',
              ].join(' ')
            }
            end
          >
            Home Base
          </NavLink>
          <NavLink
            to="/journal"
            className={({ isActive }) =>
              [
                linkBase,
                isActive ? 'bg-[rgba(200,192,216,0.22)] text-textDark' : 'text-textMid hover:bg-[rgba(200,192,216,0.15)]',
              ].join(' ')
            }
          >
            Train
          </NavLink>
          <NavLink
            to="/selves"
            className={({ isActive }) =>
              [
                linkBase,
                isActive ? 'bg-[rgba(200,192,216,0.22)] text-textDark' : 'text-textMid hover:bg-[rgba(200,192,216,0.15)]',
              ].join(' ')
            }
          >
            Fighter Builder
          </NavLink>
          <NavLink
            to="/timeline"
            className={({ isActive }) =>
              [
                linkBase,
                isActive ? 'bg-[rgba(200,192,216,0.22)] text-textDark' : 'text-textMid hover:bg-[rgba(200,192,216,0.15)]',
              ].join(' ')
            }
          >
            Battle Log
          </NavLink>
        </nav>
      </div>
    </div>
  )
}

