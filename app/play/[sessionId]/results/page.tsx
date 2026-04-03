'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import AppNavBar from '@/app/components/AppNavBar';
import { GroupDiv } from '@/app/user/_components/Dashboard';
import { apiClient } from '@/app/lib/clients/apiClient';
import { primaryColor } from '@/app/lib/colors';
import { PlayerAnswer } from '@/app/lib/types';

export default function ResultsPage() {
  const searchParams = useSearchParams();
  const playerId = searchParams.get('playerId') ?? '';

  const [answers, setAnswers] = useState<PlayerAnswer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!playerId) return;
    const fetch = async () => {
      try {
        const res = await apiClient.getPlayerResults(playerId);
        setAnswers(res);
      } finally {
        setLoading(false);
      }
    };
    void fetch();
  }, [playerId]);

  const correct = answers.filter((a) => a.correct).length;

  return (
    <>
      <AppNavBar />
      <main>
        <GroupDiv>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4" fontWeight="bold" color={primaryColor}>
              Your Results
            </Typography>
            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <CircularProgress />
              </Box>
            )}
            {!loading && (
              <>
                <Typography variant="h6" color="textSecondary">
                  {correct} / {answers.length} correct
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {answers.map((answer, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        padding: '12px 16px',
                        backgroundColor: '#fafafa',
                        borderRadius: '8px',
                        boxShadow: '0px 1px 2px #dedede',
                        borderLeft: `4px solid ${answer.correct ? 'green' : '#e53935'}`,
                      }}
                    >
                      {answer.correct ? (
                        <CheckCircleIcon sx={{ color: 'green' }} />
                      ) : (
                        <CancelIcon sx={{ color: '#e53935' }} />
                      )}
                      <Typography variant="body1" fontWeight="bold">
                        Question {i + 1}
                      </Typography>
                      <Typography variant="body2" color="textSecondary">
                        You answered:{' '}
                        {answer.answerIds.length > 0
                          ? answer.answerIds
                              .map((id) => String.fromCharCode(65 + id))
                              .join(', ')
                          : 'No answer'}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="textSecondary"
                        sx={{ marginLeft: 'auto' }}
                      >
                        {answer.correct ? 'Correct' : 'Incorrect'}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </>
            )}
          </Box>
        </GroupDiv>
      </main>
    </>
  );
}
