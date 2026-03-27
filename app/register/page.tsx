'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LRField, LRFieldBottom } from '../login/components/LoginRegField';
import {
  LoginRegBackgroundStyle,
  TitleStyle,
  CentredTextDiv,
} from '../login/components/OkForm';
import FullButton from '../components/FullButton';
import { navLinkStyle } from '../components/AdminNavBar';
import Link from 'next/link';
import NavBar from '../components/NavBar';

// This component is the register form that is used by the register page
const RegisterPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  // This function attempts to submit the user's registered
  // details to the backend
  const regFetch = async () => {
    console.log(email, name, password);
    const req = await fetch('/api/admin/auth/register', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
      },
      body: JSON.stringify({
        name: name,
        email: email,
        password: password,
      }),
    });
    if (req.ok) {
      const response = await req.json();
      localStorage.setItem('token', response.token);
      router.push('/home');
    }
  };

  return (
    <>
      <header>
        <nav>
          <NavBar></NavBar>
        </nav>
      </header>
      <div id="register-form" style={LoginRegBackgroundStyle}>
        <h3 style={TitleStyle}>Admin Registration</h3>
        <form aria-label="Register form">
          <LRField
            id="name"
            type="text"
            text="Name"
            onChange={(e) => setName(e.target.value)}
            aria="Name field"
          ></LRField>
          <LRField
            id="email"
            type="text"
            text="Email"
            onChange={(e) => setEmail(e.target.value)}
            aria="Email field"
          ></LRField>
          <LRFieldBottom
            id="password"
            type="password"
            text="Password"
            aria="Password field"
            onChange={(e) => setPassword(e.target.value)}
          ></LRFieldBottom>
          <FullButton
            id="Submit"
            aria-label="Submit Button"
            onClick={regFetch}
          >
            Submit
          </FullButton>
          <CentredTextDiv>
            <p>
              Have an account already?{' '}
              <Link href="/login" style={navLinkStyle}>
                Log in
              </Link>
            </p>
          </CentredTextDiv>
        </form>
      </div>
    </>
  );
};

export default RegisterPage;
