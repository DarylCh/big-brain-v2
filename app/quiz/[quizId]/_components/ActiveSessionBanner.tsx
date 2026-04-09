'use client';
import {
  Box,
  Chip,
  Divider,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import ForwardIcon from '@mui/icons-material/Forward';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { AdminGetQuizResponse, apiClient } from '@/app/lib/clients/apiClient';
import { primaryColor } from '@/app/lib/colors';
import { CircularProgress } from '@mui/material';

type SessionStatus = { position: number; questions: unknown[] };

interface Props {
  quiz: AdminGetQuizResponse | null;
  token: string;
  onAdvance: () => Promise<void>;
}

export default function ActiveSessionBanner({ quiz, token, onAdvance }: Props) {
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(
    null
  );
  const [copied, setCopied] = useState(false);
  const [advancing, setAdvancing] = useState(false);

  const fetchStatus = async () => {
    if (!quiz?.active) return;
    const res = await apiClient.getSessionStatus(token, quiz.active.toString());
    console.log('Fetched session status: ', res);
    setSessionStatus(res.results);
  };

  const copyCode = () => {
    void navigator.clipboard.writeText(quiz?.active?.toString() ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  useEffect(() => {
    if (!quiz?.active) return;
    const active = quiz.active;
    void (async () => {
      const res = await apiClient.getSessionStatus(token, active.toString());
      console.log('Fetched session status: ', res);
      setSessionStatus(res.results);
    })();
  }, [quiz?.active, token]);

  const handleAdvance = async () => {
    setAdvancing(true);
    try {
      await onAdvance();
      await fetchStatus();
    } finally {
      setAdvancing(false);
    }
  };

  if (!quiz?.active) return null;

  console.log('Session status: ', sessionStatus);
  const statusText =
    sessionStatus !== null
      ? sessionStatus.position === -1
        ? 'Ready to begin'
        : `Question ${sessionStatus.position + 1} of ${sessionStatus.questions.length}`
      : 'Loading…';

  return (
    <>
      <Divider />
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          px: 3,
          py: 1.5,
          backgroundColor: '#fff8f0',
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Chip
            label="LIVE"
            size="small"
            sx={{
              backgroundColor: primaryColor,
              color: '#fff',
              fontWeight: 'bold',
              fontSize: 11,
            }}
          />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Typography variant="body2" fontWeight="bold">
              Session {quiz.active}
            </Typography>
            <Tooltip title={copied ? 'Copied!' : 'Copy session code'}>
              <IconButton
                size="small"
                onClick={copyCode}
                sx={{ color: copied ? 'success.main' : 'text.secondary' }}
              >
                {copied ? (
                  <CheckIcon sx={{ fontSize: 14 }} />
                ) : (
                  <ContentCopyIcon sx={{ fontSize: 14 }} />
                )}
              </IconButton>
            </Tooltip>
          </Box>
          <Typography variant="body2" color="text.secondary">
            · {statusText}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <Tooltip
            title={
              sessionStatus?.position === -1 ? 'Start' : 'Advance question'
            }
          >
            <span>
              <IconButton
                size="small"
                onClick={() => void handleAdvance()}
                disabled={advancing}
                sx={{ color: primaryColor }}
              >
                {advancing ? (
                  <CircularProgress size={18} sx={{ color: primaryColor }} />
                ) : (
                  <ForwardIcon />
                )}
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Box>
      <Divider />
    </>
  );
}
