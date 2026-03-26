'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LRField, LRFieldBottom } from './LoginRegField';
import { useRouter } from 'next/navigation';
import ErrorPopup from '@/app/components/ErrorPopup';
import { styled } from '@mui/material/styles';
import FullButton from '@/app/components/FullButton';
import { navLinkStyle } from '@/app/components/AdminNavBar';

export const CentredTextDiv = styled('div')`
  text-align: center;
  margin: 20px 0 10px 0;
`;

export const LoginRegBackgroundStyle: React.CSSProperties = {
  backgroundColor: '#FF8E00',
  textAlign: 'left',
  width: '400px',
  margin: '50px auto',
  padding: '25px 40px',
  borderRadius: '20px',
};

export const TitleStyle: React.CSSProperties = {
  textAlign: 'center',
  marginBottom: '30px',
  fontWeight: 'bold',
  fontSize: '24px',
};

// This component is the login form used by
// the login page
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [popup, setPopup] = useState(false);
  const descTitle = 'Login Error!';
  const desc = 'Invalid login credentials.';
  const router = useRouter();

  // This function activates the popup
  const activatePopup = () => {
    setPopup(!popup);
  };

  // This function attempts to log the user into the system
  // by calling the backend
  const logFetch = async () => {
    console.log(email, password);
    const req = await fetch('http://localhost:5005/admin/auth/login', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        email: email,
        password: password,
      }),
    });
    if (req.ok) {
      const response = await req.json();
      localStorage.setItem('token', response.token);
      router.push('/home');
    } else {
      activatePopup();
    }
  };
  return (
    <div id="login-form" style={LoginRegBackgroundStyle}>
      {popup && (
        <ErrorPopup title={descTitle} desc={desc} toggle={activatePopup} />
      )}
      <h3 style={TitleStyle}>Account Login</h3>
      <form aria-label="login form">
        <LRField
          id="email"
          text="Email"
          type="text"
          aria="email field"
          onChange={(e) => setEmail(e.target.value)}
        ></LRField>
        <LRFieldBottom
          id="password"
          text="Password"
          aria="password field"
          type="password"
          onChange={(e) => setPassword(e.target.value)}
        ></LRFieldBottom>
        <FullButton
          id="login-button"
          text="Log In"
          aria="login button"
          onClick={logFetch}
        ></FullButton>
        <CentredTextDiv>
          <p>
            Don&apos;t have an account?{' '}
            <Link href="/register" style={navLinkStyle}>
              Sign Up
            </Link>
          </p>
        </CentredTextDiv>
      </form>
    </div>
  );
};

export default LoginForm;
