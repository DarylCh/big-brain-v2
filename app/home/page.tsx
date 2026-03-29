import { AdminNavBar } from '../components/AdminNavBar';
import Dashboard from './_components/Dashboard';
import { Box } from '@mui/material';

export default function HomePage() {
  return (
    <>
      <header>
        <nav>
          <AdminNavBar />
        </nav>
      </header>
      <main>
        <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
          <Dashboard />
        </Box>
      </main>
    </>
  );
}
