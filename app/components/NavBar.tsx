import Link from 'next/link';
import { navStyle, navEleStyle, navLinkStyle } from './AdminNavBar';

// This component forms the navigation bar for the login/register pages
const NavBar = () => {
  return (
    <div id="navBar" style={navStyle}>
      <div style={navEleStyle}>
        <span>
          <Link id="nav-login" style={navLinkStyle} href="/login">
            Login
          </Link>
        </span>
      </div>
      <div style={navEleStyle}>
        <span>
          <Link id="nav-register" style={navLinkStyle} href="/register">
            Register
          </Link>
        </span>
      </div>
    </div>
  );
};

export default NavBar;
