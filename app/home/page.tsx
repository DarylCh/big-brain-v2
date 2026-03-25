import { AdminNavBar } from '../components/AdminNavBar';
import Dashboard from './_components/Dashboard';
import { Box } from '@mui/material';

export default function HomePage() {
  return (
    <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
      <header>
        <nav>
          <AdminNavBar />
        </nav>
      </header>
      <main>
        <Dashboard />
      </main>
    </Box>
  );
}
