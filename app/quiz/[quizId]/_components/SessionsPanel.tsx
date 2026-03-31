import { Box, Pagination, Typography } from '@mui/material';
import { useState, useEffect } from 'react';
import SessionCard from './SessionCard';
import { AdminGetQuizResponse, apiClient } from '@/app/lib/apiClient';
import { primaryColor } from '@/app/lib/colors';

const PAGE_SIZE = 5;

type SessionStatus = { position: number; questions: unknown[] };

export default function SessionsPanel({
  quiz,
  token,
}: {
  quiz: AdminGetQuizResponse | null;
  token: string;
}) {
  const [page, setPage] = useState(1);
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(
    null
  );

  useEffect(() => {
    const fetchStatus = async () => {
      if (!quiz?.active) return;

      const res = await apiClient.getSessionStatus(
        token,
        quiz.active.toString()
      );
      setSessionStatus(res.results);
    };

    void fetchStatus();
  }, [quiz?.active, token]);

  const activeSubText = sessionStatus
    ? sessionStatus.position === -1
      ? 'Active · Ready to begin'
      : `Current Question: ${sessionStatus.position} of ${sessionStatus.questions.length}`
    : 'Active';

  const oldSessions = quiz?.oldSessions ?? [];
  const pageCount = Math.ceil(oldSessions.length / PAGE_SIZE);
  const paginatedSessions = oldSessions.slice(
    (page - 1) * PAGE_SIZE,
    page * PAGE_SIZE
  );

  return (
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
          Active Session
        </Typography>
        {quiz?.active ? (
          <SessionCard
            heading={quiz.active.toString()}
            subText={activeSubText}
          />
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
            {paginatedSessions.map((session) => (
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
