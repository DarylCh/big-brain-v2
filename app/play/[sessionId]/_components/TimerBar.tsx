'use client';
import { useState, useEffect } from 'react';
import { Box, LinearProgress, Typography } from '@mui/material';

const calcRemaining = (startedAtMs: number, durationMs: number) =>
  Math.max(0, Math.ceil((durationMs - (Date.now() - startedAtMs)) / 1000));

// TODO: optimise later
export default function TimerBar({
  startedAtMs,
  durationMs,
  onExpire,
}: {
  startedAtMs: number;
  durationMs: number;
  onExpire?: () => void;
}) {
  const [progress, setProgress] = useState(() => {
    const elapsed = Date.now() - startedAtMs;
    return Math.min((elapsed / durationMs) * 100, 100);
  });
  const [secondsLeft, setSecondsLeft] = useState(() =>
    calcRemaining(startedAtMs, durationMs)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      const elapsed = Date.now() - startedAtMs;
      const next = Math.min((elapsed / durationMs) * 100, 100);
      setProgress(next);
      setSecondsLeft(calcRemaining(startedAtMs, durationMs));
      if (next >= 100) {
        clearInterval(timer);
        onExpire?.();
      }
    }, 50);

    return () => clearInterval(timer);
  }, [startedAtMs, durationMs, onExpire]);

  return (
    <Box sx={{ width: '100%' }}>
      <Typography variant="body2" sx={{ textAlign: 'right', mb: 0.5 }}>
        {secondsLeft}s
      </Typography>
      <LinearProgress variant="determinate" value={progress} />
    </Box>
  );
}
