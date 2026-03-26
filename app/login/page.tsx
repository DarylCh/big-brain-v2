import LoginForm from './components/OkForm';
import NavBar from '../components/NavBar';

export function Login() {
  return (
    <>
      <header>
        <nav>
          <NavBar></NavBar>
        </nav>
      </header>
      <main>
        <LoginForm />
      </main>
    </>
  );
}

export default Login;
