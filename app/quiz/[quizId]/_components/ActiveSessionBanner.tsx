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
import { useRouter } from 'next/navigation';
import ForwardIcon from '@mui/icons-material/Forward';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckIcon from '@mui/icons-material/Check';
import { AdminGetQuizResponse, apiClient } from '@/app/lib/apiClient';
import { primaryColor } from '@/app/lib/colors';

type SessionStatus = { position: number; questions: unknown[] };

interface Props {
  quiz: AdminGetQuizResponse | null;
  token: string;
  quizId: string;
  onAdvance: () => void;
}

export default function ActiveSessionBanner({
  quiz,
  token,
  quizId,
  onAdvance,
}: Props) {
  const router = useRouter();
  const [sessionStatus, setSessionStatus] = useState<SessionStatus | null>(
    null
  );
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    void navigator.clipboard.writeText(quiz?.active?.toString() ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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

  if (!quiz?.active) return null;

  const statusText = sessionStatus
    ? sessionStatus.position === -1
      ? 'Ready to begin'
      : `Question ${sessionStatus.position + 1} of ${sessionStatus.questions.length}`
    : 'Loading…';

  const isOnLastQuestion =
    sessionStatus !== null &&
    sessionStatus.position >= 0 &&
    sessionStatus.position >= sessionStatus.questions.length - 1;

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
          {isOnLastQuestion ? (
            <Tooltip title="View results">
              <IconButton
                size="small"
                onClick={() =>
                  router.push(`/quiz/${quizId}/session/${quiz.active}/results`)
                }
                sx={{ color: primaryColor }}
              >
                <OpenInNewIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          ) : (
            <Tooltip
              title={
                sessionStatus?.position === -1 ? 'Start' : 'Advance question'
              }
            >
              <IconButton
                size="small"
                onClick={onAdvance}
                sx={{ color: primaryColor }}
              >
                <ForwardIcon />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </Box>
      <Divider />
    </>
  );
}
