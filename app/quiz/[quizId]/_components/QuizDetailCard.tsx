'use client';
import { useRef, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Box, Button, IconButton, Tab, Tabs, Typography } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Image from 'next/image';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CircleIconButton from '@/app/components/CircleIconButton';
import ConfirmDialog from '../../_components/ConfirmDialog';
import EditQuizDetailsForm from './EditQuizDetailsForm';
import QuestionsTable from './QuestionsTable';
import ActiveSessionBanner from './ActiveSessionBanner';
import SessionsTable from './SessionsTable';
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
  onAdvance: () => void;
}

export default function QuizDetailCard({
  quiz,
  quizId,
  token,
  onMutated,
  onDelete,
  onAddQuestion,
  onAdvance,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [tab, setTab] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const saveDetails = async (name: string, description: string) => {
    await apiClient.updateQuiz(token, quizId, { name, description });
    setEditOpen(false);
    onMutated();
  };

  const deleteQuestion = async (index: number) => {
    const updated = (quiz?.questions ?? []).filter(
      (_question, i) => i !== index
    );
    await apiClient.updateQuiz(token, quizId, { questions: updated });
    onMutated();
  };

  const uploadThumbnail = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      await apiClient.updateQuiz(token, quizId, { thumbnail: base64 });
      onMutated();
    };
    reader.readAsDataURL(file);
  };

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
  const isValidThumbnail = useMemo(
    () =>
      /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[A-Za-z0-9+/]+=*$/.test(
        quiz?.thumbnail ?? ''
      ),
    [quiz?.thumbnail]
  );

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
        <Box sx={{ mt: 0, mb: 1 }}>
          <IconButton
            size="small"
            onClick={() => router.push('/home')}
            sx={{
              color: 'text.secondary',
              '&:hover': { color: 'text.primary' },
            }}
          >
            <ArrowBackIcon fontSize="small" />
          </IconButton>
        </Box>
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
              height: '200px',
              width: '200px',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                height: '200px',
                width: '200px',
                backgroundColor: '#3f3f3f',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover .upload-overlay': { opacity: 1 },
              }}
            >
              {isValidThumbnail ? (
                <Image
                  src={quiz!.thumbnail!}
                  alt="Quiz thumbnail"
                  fill
                  unoptimized
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <PhotoCameraIcon sx={{ color: '#888', fontSize: 36 }} />
              )}
              <Box
                className="upload-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
              >
                <PhotoCameraIcon sx={{ color: '#fff', fontSize: 36 }} />
              </Box>
            </Box>
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadThumbnail(file);
              e.target.value = '';
            }}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '200px',
              pt: 1,
              pb: 1,
            }}
          >
            <Typography variant="body2">Quiz Details</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Typography variant="h4" color={primaryColor}>
                {quiz?.name}
              </Typography>
              <IconButton
                size="small"
                onClick={() => setEditOpen(true)}
                sx={{ color: primaryColor }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography
              variant="body2"
              color={quiz?.description ? 'text.primary' : 'text.disabled'}
              sx={{ flexGrow: 1, overflow: 'auto', marginTop: '4px' }}
            >
              {quiz?.description ?? 'No description provided'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`Quiz by Daryl · ${(quiz?.questions?.length ?? 0) > 0 ? quiz!.questions.length : 'No'} questions`}
              {(quiz?.questions?.length ?? 0) > 0 && (
                <>
                  {' '}
                  · {quiz!.questions.reduce((sum, q) => sum + q.timeNeeded, 0)}s
                  total
                </>
              )}
            </Typography>
          </Box>
        </Box>
      </Box>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          padding: '16px 20px',
          alignItems: 'center',
        }}
      >
        <div>
          <Button
            variant="contained"
            startIcon={isActive ? <StopIcon /> : <PlayArrowIcon />}
            onClick={() => (isActive ? setStopOpen(true) : setStartOpen(true))}
            sx={{
              backgroundColor: primaryColor,
              '&:hover': {
                backgroundColor: primaryHoverColor,
              },
              marginLeft: '12px',
            }}
          >
            {isActive ? 'End Session' : 'Start Session'}
          </Button>
        </div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '10px',
            alignItems: 'center',
          }}
        >
          <CircleIconButton onClick={() => setEditOpen(true)}>
            <EditIcon />
          </CircleIconButton>
          <CircleIconButton onClick={() => setConfirmOpen(true)}>
            <DeleteIcon />
          </CircleIconButton>
        </div>
      </div>
      <EditQuizDetailsForm
        open={editOpen}
        initialName={quiz?.name ?? ''}
        initialDescription={quiz?.description ?? ''}
        onClose={() => setEditOpen(false)}
        onSave={saveDetails}
      />
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
      <ActiveSessionBanner
        quiz={quiz}
        token={token}
        quizId={quizId}
        onAdvance={onAdvance}
      />
      <Tabs
        value={tab}
        onChange={(_, v: number) => setTab(v)}
        sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        TabIndicatorProps={{ style: { backgroundColor: primaryColor } }}
      >
        <Tab
          label="Questions"
          sx={{ '&.Mui-selected': { color: primaryColor } }}
        />
        <Tab
          label={`Sessions (${quiz?.oldSessions?.length ?? 0})`}
          sx={{ '&.Mui-selected': { color: primaryColor } }}
        />
      </Tabs>
      {tab === 0 && (
        <QuestionsTable
          questions={quiz?.questions ?? []}
          onAddQuestion={onAddQuestion}
          onDeleteQuestion={(i) => void deleteQuestion(i)}
          disabled={isActive}
        />
      )}
      {tab === 1 && (
        <SessionsTable oldSessions={quiz?.oldSessions ?? []} quizId={quizId} />
      )}
    </GroupDiv>
  );
}
