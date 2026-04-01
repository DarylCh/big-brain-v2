'use client';
import { use, useEffect, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import AppNavBar from '@/app/components/AppNavBar';
import { GroupDiv } from '@/app/home/_components/Dashboard';
import { useUser } from '@/app/lib/UserContext';
import { apiClient } from '@/app/lib/apiClient';
import { primaryColor } from '@/app/lib/colors';
import { Player } from '@/app/lib/types';

export default function SessionResultsPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const { token } = useUser();
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      try {
        const res = await apiClient.getSessionResults(token, sessionId);
        setPlayers(res.results as unknown as Player[]);
      } finally {
        setLoading(false);
      }
    };
    if (token) void fetchResults();
  }, [token, sessionId]);

  const scores = players.map((p) => p.answers.filter((a) => a.correct).length);
  const names = players.map((p) => p.name);

  return (
    <>
      <AppNavBar />
      <main>
        <GroupDiv>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4" fontWeight="bold" color={primaryColor}>
              Session Results
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Session ID: {sessionId}
            </Typography>
            {loading && <CircularProgress />}
            {!loading && players.length === 0 && (
              <Typography variant="body2" color="#888">
                No players participated in this session.
              </Typography>
            )}
            {!loading && players.length > 0 && (
              <>
                <Typography variant="h6">Score per Player</Typography>
                <BarChart
                  xAxis={[{ scaleType: 'band', data: names }]}
                  series={[
                    {
                      data: scores,
                      label: 'Correct Answers',
                      color: primaryColor,
                    },
                  ]}
                  height={320}
                />
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {players.map((player, i) => (
                    <Box
                      key={i}
                      sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '10px 16px',
                        backgroundColor: '#fafafa',
                        borderRadius: '8px',
                        boxShadow: '0px 1px 2px #dedede',
                      }}
                    >
                      <Typography variant="body1" fontWeight="bold">
                        {player.name}
                      </Typography>
                      <Typography
                        variant="body1"
                        color={primaryColor}
                        fontWeight="bold"
                      >
                        {scores[i]} / {player.answers.length}
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
