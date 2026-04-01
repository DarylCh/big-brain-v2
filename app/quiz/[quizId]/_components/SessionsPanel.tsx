'use client';
import { Box, Pagination, Typography } from '@mui/material';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import SessionCard from './SessionCard';
import { AdminGetQuizResponse } from '@/app/lib/apiClient';
import { primaryColor } from '@/app/lib/colors';
import { GroupDiv } from '@/app/home/_components/Dashboard';

const PAGE_SIZE = 5;

export default function SessionsPanel({
  quiz,
  quizId,
}: {
  quiz: AdminGetQuizResponse | null;
  token: string;
  quizId: string;
  onAdvance: () => void;
}) {
  const [page, setPage] = useState(1);
  const router = useRouter();

  const oldSessions = quiz?.oldSessions ?? [];
  const pageCount = Math.ceil(oldSessions.length / PAGE_SIZE);
  const paginatedSessions = oldSessions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
    <GroupDiv>
      <Box
        sx={{
          display: 'flex',
          gap: '24px',
          flexDirection: 'column',
          padding: '12px',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Typography variant="h4" color={`${primaryColor}`}>
            Old Sessions
          </Typography>
          {oldSessions.length > 0 ? (
            <>
              {paginatedSessions.map((session) => (
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
            <Typography variant="body2" color="#888">
              No previous sessions
            </Typography>
          )}
        </Box>
      </Box>
    </GroupDiv>
  );
}
