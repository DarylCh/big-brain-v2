'use client';
import { useState } from 'react';
import { Box, Pagination, Paper, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import SessionCard from './SessionCard';

const PAGE_SIZE = 5;

export default function SessionsTable({
  oldSessions,
  quizId,
}: {
  oldSessions: number[];
  quizId: string;
}) {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const pageCount = Math.ceil(oldSessions.length / PAGE_SIZE);
  const paginated = oldSessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Paper variant="outlined" sx={{ borderRadius: 0, border: 'none' }}>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          minHeight: PAGE_SIZE * 60,
        }}
      >
        {oldSessions.length > 0 ? (
          <>
            {paginated.map((session) => (
              <SessionCard
                key={session}
                heading={session.toString()}
                onClick={() =>
                  router.push(`/quiz/${quizId}/session/${session}/results`)
                }
              />
            ))}
            {pageCount > 1 && (
              <Pagination
                count={pageCount}
                page={page}
                onChange={(_, value) => setPage(value)}
                sx={{ alignSelf: 'center', mt: 1 }}
              />
            )}
          </>
        ) : (
          <Typography
            variant="body2"
            color="#888"
            sx={{ py: 2, textAlign: 'center' }}
          >
            No previous sessions
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
