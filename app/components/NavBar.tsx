'use client';
import { navStyle } from './AdminNavBar';
import { Typography } from '@mui/material';

// This component forms the navigation bar for the login/register pages
const NavBar = () => {
  return (
    <div id="navBar" style={navStyle}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
        BigBrain
      </Typography>
    </div>
  );
};

export default NavBar;
