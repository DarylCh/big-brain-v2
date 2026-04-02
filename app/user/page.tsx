import AppNavBar from '../components/AppNavBar';
import Dashboard from './_components/Dashboard';
import { Box } from '@mui/material';

export default function HomePage() {
  return (
    <>
      <AppNavBar />
      <main>
        <Box sx={{ backgroundColor: '#fafafa', minHeight: '100vh' }}>
          <Dashboard />
        </Box>
      </main>
    </>
  );
}
