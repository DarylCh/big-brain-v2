import { Box, Pagination, Typography } from '@mui/material';
import { useState } from 'react';
import SessionCard from './SessionCard';
import { AdminGetQuizResponse } from '@/app/lib/apiClient';
import { primaryColor } from '@/app/lib/colors';

const PAGE_SIZE = 5;

export default function SessionsPanel({
  quiz,
}: {
  quiz: AdminGetQuizResponse | null;
}) {
  const [page, setPage] = useState(1);
  const oldSessions = quiz?.oldSessions ?? [];
  const pageCount = Math.ceil(oldSessions.length / PAGE_SIZE);
  const paginated = oldSessions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Box
      sx={{
        display: 'flex',
        gap: '12px',
        flexDirection: 'column',
        padding: '12px',
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h4" color={`${primaryColor}`}>
          Active Session
        </Typography>
        {quiz?.active ? (
          <SessionCard heading={quiz.active.toString()} subText="Active" />
        ) : (
          <Typography variant="body2" color="#888">
            No active session
          </Typography>
        )}
      </Box>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Typography variant="h4" color={`${primaryColor}`}>
          Old Sessions
        </Typography>
        {oldSessions.length > 0 ? (
          <>
            {paginated.map((session) => (
              <SessionCard key={session} heading={session.toString()} />
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
  );
}
