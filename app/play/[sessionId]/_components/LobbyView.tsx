'use client';
import { Box, CircularProgress, Typography } from '@mui/material';

type LobbyViewProps = {
  playerName: string;
  loading: boolean;
};

export default function LobbyView({ playerName, loading }: LobbyViewProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
      }}
    >
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        Welcome{playerName ? `, ${playerName}` : ''}!
      </Typography>
      {loading && <CircularProgress />}
      {!loading && (
        <Typography variant="h6" color="textSecondary">
          Sit tight! The host should be starting the game soon...
        </Typography>
      )}
    </Box>
  );
}
