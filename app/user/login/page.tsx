'use client';
import LoginForm from './components/LoginForm';
import AppNavBar from '../../components/AppNavBar';

export function Login() {
  return (
    <>
      <AppNavBar />
      <main>
        <LoginForm />
      </main>
    </>
  );
}

export default Login;
