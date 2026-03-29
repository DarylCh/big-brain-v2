import { Typography } from '@mui/material';
import Link from 'next/link';

export const navStyle = {
  display: 'flex',
  padding: '5px 20px',
  alignItems: 'center',
  justifyContent: 'space-between',
  backgroundColor: 'red',
  width: '100%',
};

export const navEleStyle = {
  padding: '15px 15px',
};

export const navLinkStyle = {
  color: 'black',
  fontWeight: 'bold',
};

// This component serves as the navbar for all pages with admin status
export const AdminNavBar = () => {
  return (
    <div id="navBar" style={navStyle}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
        BigBrain
      </Typography>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <div style={navEleStyle}>
          <span>
            <Link id="nav-home" style={navLinkStyle} href="/home">
              Home
            </Link>
          </span>
        </div>
        <div style={navEleStyle}>
          <span>
            <Link id="nav-logout" style={navLinkStyle} href="/login">
              Logout
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
};

export default AdminNavBar;
