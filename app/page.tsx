'use client';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import AppNavBar from '@/app/components/AppNavBar';
import JoinQuiz from '@/app/home/_components/JoinQuiz';
import ErrorPopup from '@/app/components/ErrorPopup';
import { primaryColor } from '@/app/lib/colors';

export default function Home() {
  const [popup, setPopup] = useState(false);
  const [desc, setDesc] = useState('');

  return (
    <>
      <AppNavBar />
      {popup && (
        <ErrorPopup title="Error" desc={desc} toggle={() => setPopup(false)} />
      )}
      <main>
        <Box
          sx={{
            backgroundColor: '#fafafa',
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            pt: 8,
            px: 2,
          }}
        >
          <Box sx={{ maxWidth: 600, textAlign: 'center', mb: 4 }}>
            <Typography variant="h3" fontWeight="bold" color={primaryColor}>
              BigBrain
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 1 }}>
              A real-time quiz platform. Hosts create and run timed quizzes while
              players join with a game code and compete live — no account needed
              to play.
            </Typography>
          </Box>
          <JoinQuiz
            activatePopup={() => setPopup(true)}
            activateClicked={() => {}}
            setDesc={setDesc}
          />
        </Box>
      </main>
    </>
  );
}
