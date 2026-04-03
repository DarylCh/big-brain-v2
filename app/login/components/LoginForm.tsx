'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ErrorPopup from '@/app/components/ErrorPopup';
import { styled } from '@mui/material/styles';
import FullButton from '@/app/components/FullButton';
import { navLinkStyle } from '@/app/components/AdminNavBar';
import { useUser } from '@/app/lib/UserContext';
import { FormControl, TextField } from '@mui/material';
import { apiClient } from '@/app/lib/clients/apiClient';
import { primaryColor } from '@/app/lib/colors';

export const CentredTextDiv = styled('div')`
  text-align: center;
  margin: 20px 0 10px 0;
`;

export const LoginRegBackgroundStyle: React.CSSProperties = {
  backgroundColor: 'white',
  textAlign: 'left',
  width: '400px',
  margin: '50px auto',
  padding: '25px 40px',
  borderRadius: '8px',
  boxShadow: '0px 2px 2px 2px #dedede',
};

export const LoginRegPageStyle: React.CSSProperties = {
  backgroundColor: '#fafafa',
  minHeight: '100vh',
};

export const TitleStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '30px',
  fontWeight: 'bold',
  fontSize: '24px',
  color: primaryColor,
};

// This component is the login form used by
// the login page
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popup, setPopup] = useState(false);
  const [loading, setLoading] = useState(false);
  const descTitle = 'Login Error!';
  const desc = 'Invalid login credentials.';
  const router = useRouter();
  const { setToken } = useUser();

  // This function activates the popup
  const activatePopup = () => {
    setPopup(!popup);
  };

  // This function attempts to log the user into the system
  // by calling the backend
  const logFetch = async () => {
    try {
      setLoading(true);
      const response = await apiClient.login({ email, password });
      setToken(response.token);
      router.push('/user');
    } catch {
      activatePopup();
    } finally {
      setLoading(false);
    }
  };
  return (
    <div style={LoginRegPageStyle}>
      <div id="login-form" style={LoginRegBackgroundStyle}>
        {popup && (
          <ErrorPopup title={descTitle} desc={desc} toggle={activatePopup} />
        )}
        <h3 style={TitleStyle}>Account Login</h3>
        <FormControl
          aria-label="login form"
          style={{
            width: '100%',
            gap: '16px',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <TextField
            id="email"
            label="Email"
            type="text"
            placeholder="Email"
            aria-label="email field"
            onChange={(e) => setEmail(e.target.value)}
            sx={{ backgroundColor: 'white', borderRadius: '5px' }}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            placeholder="Password"
            aria-label="password field"
            onChange={(e) => setPassword(e.target.value)}
            sx={{ backgroundColor: 'white', borderRadius: '5px' }}
          />
          <FullButton
            id="login-button"
            aria-label="login button"
            onClick={() => void logFetch()}
            disabled={email === '' || password === ''}
            loading={loading}
          >
            Log In
          </FullButton>
          <CentredTextDiv>
            <p>
              Don&apos;t have an account?{' '}
              <Link
                href="/register"
                style={{ ...navLinkStyle, color: primaryColor }}
              >
                Sign Up
              </Link>
            </p>
          </CentredTextDiv>
        </FormControl>
      </div>
    </div>
  );
};

export default LoginForm;
