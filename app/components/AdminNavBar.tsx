import { Typography } from '@mui/material';
import Link from 'next/link';
import { primaryColor } from '../lib/colors';
import { useUser } from '../lib/UserContext';

export const navStyle = {
  display: 'flex',
  padding: '5px 20px',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: `${primaryColor}`,
  width: '100%',
};

export const navEleStyle = {
  padding: '15px 15px',
};

export const navLinkStyle = {
  color: 'white',
  fontWeight: 'bold',
};

// This component serves as the navbar for all pages with admin status
export const AdminNavBar = () => {
  const { logout } = useUser();

  return (
    <div id="navBar" style={navStyle}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
        BigBrain
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={navEleStyle}>
          <span>
            <Link id="nav-home" style={navLinkStyle} href="/user">
              Home
            </Link>
          </span>
        </div>
        <div style={navEleStyle}>
          <span>
            <Link
              id="nav-logout"
              style={navLinkStyle}
              href="/user/login"
              onClick={logout}
            >
              Logout
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminNavBar;
