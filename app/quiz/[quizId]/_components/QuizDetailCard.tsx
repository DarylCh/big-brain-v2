'use client';
import { useState } from 'react';
import { Box, Typography } from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import StopIcon from '@mui/icons-material/Stop';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CircleIconButton from '@/app/components/CircleIconButton';
import ConfirmDialog from '../../_components/ConfirmDialog';
import QuestionsTable from './QuestionsTable';
import { AdminGetQuizResponse, apiClient } from '@/app/lib/apiClient';
import { primaryColor, primaryHoverColor } from '@/app/lib/colors';
import { GroupDiv } from '@/app/home/_components/Dashboard';

interface Props {
  quiz: AdminGetQuizResponse | null;
  quizId: string;
  token: string;
  onMutated: () => void;
  onDelete: () => void;
  onAddQuestion: () => void;
}

export default function QuizDetailCard({
  quiz,
  quizId,
  token,
  onMutated,
  onDelete,
  onAddQuestion,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);

  const deleteQuiz = async () => {
    await apiClient.deleteQuiz(token, quizId);
    onDelete();
  };

  const startQuiz = async () => {
    await apiClient.startQuiz(token, quizId);
    onMutated();
  };

  const stopQuiz = async () => {
    await apiClient.endQuiz(token, quizId);
    onMutated();
  };

  const isActive = !!quiz?.active;

  return (
    <GroupDiv style={{ padding: 0, width: '100%' }}>
      <Box
        style={{
          padding: '30px',
          backgroundColor: '#fafafa',
          display: 'flex',
          gap: '2px',
          flexDirection: 'column',
        }}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              height: '220px',
              width: '180px',
              flexShrink: 0,
              backgroundColor: '#3f3f3f',
            }}
          />
          <Box>
            <Typography variant="body2">Quiz Details</Typography>
            <Typography variant="h4" color={primaryColor}>
              {quiz?.name}
            </Typography>
            <Typography variant="body2">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur.
            </Typography>
            <Typography variant="body2" style={{ marginTop: '10px' }}>
              {`Quiz by Daryl · ${(quiz?.questions?.length ?? 0) > 0 ? quiz!.questions.length : 'No'} questions`}
            </Typography>
          </Box>
        </Box>
      </Box>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: '10px 20px',
          alignItems: 'center',
        }}
      >
        <div>
          {!isActive ? (
            <PlayCircleIcon
              sx={{
                fontSize: 48,
                color: primaryColor,
                cursor: 'pointer',
                ':hover': { color: primaryHoverColor },
              }}
              onClick={() => setStartOpen(true)}
            />
          ) : (
            <StopIcon
              sx={{
                fontSize: 48,
                color: primaryColor,
                cursor: 'pointer',
                ':hover': { color: primaryHoverColor },
              }}
              onClick={() => setStopOpen(true)}
            />
          )}
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <CircleIconButton>
            <EditIcon />
          </CircleIconButton>
          <CircleIconButton onClick={() => setConfirmOpen(true)}>
            <DeleteIcon />
          </CircleIconButton>
        </div>
      </div>
      <ConfirmDialog
        open={confirmOpen}
        setOpen={setConfirmOpen}
        variant="delete"
        onConfirm={() => void deleteQuiz()}
      />
      <ConfirmDialog
        open={startOpen}
        setOpen={setStartOpen}
        variant="start"
        onConfirm={() => void startQuiz()}
      />
      <ConfirmDialog
        open={stopOpen}
        setOpen={setStopOpen}
        variant="stop"
        onConfirm={() => void stopQuiz()}
      />
      <QuestionsTable
        questions={quiz?.questions ?? []}
        onAddQuestion={onAddQuestion}
      />
    </GroupDiv>
  );
}
