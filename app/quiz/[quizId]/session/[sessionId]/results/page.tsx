'use client';
import { use, useEffect, useMemo, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import { BarChart } from '@mui/x-charts/BarChart';
import AppNavBar from '@/app/components/AppNavBar';
import { GroupDiv } from '@/app/user/_components/Dashboard';
import { useUser } from '@/app/lib/UserContext';
import { apiClient } from '@/app/lib/apiClient';
import { primaryColor } from '@/app/lib/colors';
import { Player } from '@/app/lib/types';
import BackButton from '@/app/components/BackButton';

export default function SessionResultsPage({
  params,
}: {
  params: Promise<{ quizId: string; sessionId: string }>;
}) {
  const { quizId, sessionId } = use(params);
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

  const scoresObject = useMemo(
    () =>
      players
        .map((p) => ({
          name: p.name,
          score: p.answers.filter((a) => a.correct).length,
          answers: p.answers,
        }))
        .sort((a, b) => b.score - a.score),
    [players]
  );
  const scores = scoresObject.map((p) => p.score);
  const names = scoresObject.map((p) => p.name);
  const totalQuestions = players[0]?.answers.length ?? 0;

  return (
    <>
      <AppNavBar />
      <main>
        <GroupDiv>
          <BackButton sx={{ mb: 2 }} href={`/quiz/${quizId}`} />
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
                  yAxis={[
                    {
                      min: 0,
                      max: totalQuestions,
                      tickInterval: [...Array(totalQuestions + 1)].map(
                        (_value, index) => index
                      ),
                      tickNumber: totalQuestions + 1,
                      valueFormatter: (value: number | null) =>
                        value === null ? '' : String(value),
                    },
                  ]}
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
