'use client';
import { useState } from 'react';
import {
  Box,
  InputAdornment,
  Pagination,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useRouter } from 'next/navigation';
import SessionCard from './SessionCard';

const PAGE_SIZE = 5;

export default function SessionsTable({
  oldSessions,
  quizId,
}: {
  oldSessions: string[];
  quizId: string;
}) {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');

  const filtered = oldSessions.filter((s) =>
    s.toString().includes(search.trim())
  );
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <Paper variant="outlined" sx={{ borderRadius: 0, border: 'none' }}>
      <Box sx={{ px: 2, pt: 2 }}>
        <TextField
          size="small"
          fullWidth
          placeholder="Search by quiz code"
          value={search}
          onChange={(e) => handleSearch(e.target.value)}
          slotProps={{
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            },
          }}
        />
      </Box>
      <Box
        sx={{
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 1,
          minHeight: PAGE_SIZE * 60,
        }}
      >
        {filtered.length > 0 ? (
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
            {oldSessions.length === 0
              ? 'No previous sessions'
              : 'No sessions match your search'}
          </Typography>
        )}
      </Box>
    </Paper>
  );
}
