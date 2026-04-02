'use client';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import Link from 'next/link';
import JoinQuiz from '@/app/user/_components/JoinQuiz';
import ErrorPopup from '@/app/components/ErrorPopup';
import { primaryColor } from '@/app/lib/colors';

export default function Home() {
  const [popup, setPopup] = useState(false);
  const [desc, setDesc] = useState('');

  return (
    <>
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
            <Typography variant="body1" color="text.secondary" sx={{ mt: 2 }}>
              A real-time quiz platform. Hosts create and run timed quizzes
              while players join with a game code and compete live — no account
              needed to play.
            </Typography>
          </Box>
          <JoinQuiz
            sx={{ width: '100%', maxWidth: 400 }}
            activatePopup={() => setPopup(true)}
            activateClicked={() => {}}
            setDesc={setDesc}
          />
          <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
            Want to host?{' '}
            <Link
              href="/login"
              style={{ color: primaryColor, fontWeight: 'bold' }}
            >
              Log in
            </Link>{' '}
            or{' '}
            <Link
              href="/register"
              style={{ color: primaryColor, fontWeight: 'bold' }}
            >
              create an account
            </Link>
            .
          </Typography>
        </Box>
      </main>
    </>
  );
}
