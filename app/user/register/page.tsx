'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  LoginRegBackgroundStyle,
  TitleStyle,
  CentredTextDiv,
} from '../login/components/LoginForm';
import FullButton from '../../components/FullButton';
import { navLinkStyle } from '../../components/AdminNavBar';
import Link from 'next/link';
import AppNavBar from '../../components/AppNavBar';
import { FormControl, TextField } from '@mui/material';
import { apiClient } from '@/app/lib/clients/apiClient';
import { useUser } from '@/app/lib/UserContext';
import { primaryColor } from '@/app/lib/colors';
import { LoginRegPageStyle } from '../login/components/LoginForm';

// This component is the register form that is used by the register page
const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setToken } = useUser();

  const passwordsMatch = password === confirmPassword;
  const isValid =
    name !== '' && email !== '' && password !== '' && passwordsMatch;

  const regFetch = async () => {
    try {
      setLoading(true);
      const response = await apiClient.register({ name, email, password });
      setToken(response.token);
      router.push('/user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AppNavBar />
      <div style={LoginRegPageStyle}>
        <div id="register-form" style={LoginRegBackgroundStyle}>
          <h3 style={TitleStyle}>Admin Registration</h3>
          <FormControl
            aria-label="Register form"
            style={{
              width: '100%',
              gap: '16px',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <TextField
              id="name"
              label="Name"
              type="text"
              placeholder="Name"
              aria-label="Name field"
              onChange={(e) => setName(e.target.value)}
              sx={{ backgroundColor: 'white', borderRadius: '5px' }}
            />
            <TextField
              id="email"
              label="Email"
              type="text"
              placeholder="Email"
              aria-label="Email field"
              onChange={(e) => setEmail(e.target.value)}
              sx={{ backgroundColor: 'white', borderRadius: '5px' }}
            />
            <TextField
              id="password"
              label="Password"
              type="password"
              placeholder="Password"
              aria-label="Password field"
              onChange={(e) => setPassword(e.target.value)}
              sx={{ backgroundColor: 'white', borderRadius: '5px' }}
            />
            <TextField
              id="confirm-password"
              label="Confirm Password"
              type="password"
              placeholder="Confirm Password"
              aria-label="Confirm password field"
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPassword !== '' && !passwordsMatch}
              helperText={
                confirmPassword !== '' && !passwordsMatch
                  ? 'Passwords do not match'
                  : ''
              }
              sx={{ backgroundColor: 'white', borderRadius: '5px' }}
            />
            <FullButton
              id="Submit"
              aria-label="Submit Button"
              onClick={() => void regFetch()}
              disabled={!isValid}
              loading={loading}
            >
              Submit
            </FullButton>
            <CentredTextDiv>
              <p>
                Have an account already?{' '}
                <Link
                  href="/user/login"
                  style={{ ...navLinkStyle, color: primaryColor }}
                >
                  Log in
                </Link>
              </p>
            </CentredTextDiv>
          </FormControl>
        </div>
      </div>
    </>
  );
};

export default RegisterPage;
