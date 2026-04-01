'use client';
import { Typography } from '@mui/material';
import Link from 'next/link';
import { useUser } from '@/app/lib/UserContext';
import { navStyle, navEleStyle, navLinkStyle } from './AdminNavBar';

const AppNavBar = () => {
  const { token } = useUser();

  return (
    <header>
      <nav>
        <div id="navBar" style={navStyle}>
          <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'white' }}>
            BigBrain
          </Typography>
          {token && (
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
          )}
        </div>
      </nav>
    </header>
  );
};

export default AppNavBar;
