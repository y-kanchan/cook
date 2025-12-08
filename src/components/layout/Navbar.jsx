import { Link, NavLink } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

export default function Navbar(){
  const { user, logout } = useAuth()
  return (
    <header className="sticky top-0 z-40 border-b bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
        <Link to="/" className="font-bold text-primary-700">CookBook</Link>
        <nav className="flex items-center gap-4 text-sm">
          <NavLink
  to="/recipes"
  className={({ isActive }) =>
    isActive
      ? "text-white bg-primary-700 font-medium hover:text-white-800  hover:border hover:border-primary-700 rounded-[25px] px-4 py-2 mx-1 transition"
      : "text-gray-600 hover:text-primary-700 hover:border hover:border-primary-700 rounded-[25px] px-4 py-2 mx-1 transition"
  }
>
  All Recipes
</NavLink>

{user && (
  <>
    <NavLink
      to="/my-recipes"
      className={({ isActive }) =>
        isActive
          ? "text-white bg-primary-700 font-medium hover:text-white-800  hover:border hover:border-primary-700 rounded-[25px] px-4 py-2 mx-1 transition"
          : "text-gray-600 hover:text-primary-700 hover:border hover:border-primary-700 rounded-[25px] px-4 py-2 mx-1 transition"
      }
    >
      My Recipes
    </NavLink>

    <NavLink
      to="/my-cookbook"
      className={({ isActive }) =>
        isActive
          ? "text-white bg-primary-700 font-medium hover:text-white-800  hover:border hover:border-primary-700 rounded-[25px] px-4 py-2 mx-1 transition"
          : "text-gray-600 hover:text-primary-700 hover:border hover:border-primary-700 rounded-[25px] px-4 py-2 mx-1 transition"
      }
    >
      Saved
    </NavLink>

    <NavLink
      to="/add"
      className={({ isActive }) =>
        isActive
          ? "text-white bg-primary-700 font-medium hover:text-white-800 hover:border hover:border-primary-700 rounded-[25px] px-4 py-2 mx-1 transition"
          : "text-gray-600 hover:text-primary-700 hover:border hover:border-primary-700 rounded-[25px] px-4 py-2 mx-1 transition"
      }
    >
      Add Recipe
    </NavLink>
            </>
          )} 
        </nav>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <NavLink to="/profile" className="text-sm text-gray-700">{user.name}</NavLink>
              <button onClick={logout} className="rounded-[25px] bg-gray-100 px-5 py-2 text-sm hover:bg-red-600 hover:text-white">Logout</button>
            </>
          ) : (
            <>
              <NavLink to="/login" className="text-sm text-gray-700">Login</NavLink>
              <NavLink to="/register" className="rounded-[25px] bg-yellow-500 px-4 py-1.5 text-sm text-white shadow hover:bg-yellow-600 hover:text-white">Register</NavLink>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
 