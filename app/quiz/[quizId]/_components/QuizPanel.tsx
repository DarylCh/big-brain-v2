'use client';
import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Tab, Tabs, Snackbar, Alert } from '@mui/material';
import ConfirmDialog from './ConfirmDialog';
import QuestionsTable from './QuestionsTable';
import ActiveSessionBanner from './ActiveSessionBanner';
import SessionsTable from './SessionsTable';
import QuizDetailCard from './QuizDetailCard';
import QuizActionsBar from './QuizActionsBar';
import EditQuizDetailsForm from './EditQuizDetailsForm';
import { AdminGetQuizResponse, apiClient } from '@/app/lib/clients/apiClient';
import { primaryColor } from '@/app/lib/colors';
import { GroupDiv } from '@/app/user/_components/Dashboard';

interface Props {
  quiz: AdminGetQuizResponse | null;
  quizId: string;
  token: string;
  onMutated: () => Promise<void>;
  onDelete: () => void;
  onAddQuestion: () => void;
}

export default function QuizPanel({
  quiz,
  quizId,
  token,
  onMutated,
  onDelete,
  onAddQuestion,
}: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [redirectSnackbar, setRedirectSnackbar] = useState(false);
  const [tab, setTab] = useState(0);

  const deleteQuestion = async (questionId: string) => {
    await apiClient.deleteQuestion(token, quizId, questionId);
    await onMutated();
  };

  const deleteQuiz = async () => {
    await apiClient.deleteQuiz(token, quizId);
    onDelete();
  };

  const startQuiz = async () => {
    await apiClient.startQuiz(token, quizId);
    await onMutated();
  };

  const stopQuiz = async () => {
    await apiClient.endQuiz(token, quizId);
    await onMutated();
  };

  const onAdvanceQuiz = useCallback(async () => {
    if (!token) return;
    const sessionPosition = await apiClient.advanceQuiz(token, quizId);
    if (sessionPosition.stage === -2) {
      setTimeout(() => {
        router.push(`/quiz/${quizId}/session/${quiz?.active}/results`);
      }, 2000);
      setRedirectSnackbar(true);
    }
    await onMutated();
  }, [quiz, router, quizId, token, onMutated]);

  const onUpdateQuiz = useCallback(
    async (name: string, description: string) => {
      if (!token) return;
      await apiClient.updateQuiz(token, quizId, { name, description });
      setEditOpen(false);
      await onMutated();
    },
    [token, quizId, onMutated]
  );

  const isActive = !!quiz?.active;

  return (
    <GroupDiv style={{ padding: 0, width: '100%' }}>
      <QuizDetailCard
        quiz={quiz}
        quizId={quizId}
        token={token}
        onMutated={onMutated}
        onEditOpen={() => setEditOpen(true)}
      />
      <QuizActionsBar
        isActive={isActive}
        onStartSession={() => setStartOpen(true)}
        onEndSession={() => setStopOpen(true)}
        onEdit={() => setEditOpen(true)}
        onDelete={() => setConfirmOpen(true)}
      />
      <ConfirmDialog
        open={confirmOpen}
        setOpen={setConfirmOpen}
        variant="delete"
        onConfirm={deleteQuiz}
      />
      <ConfirmDialog
        open={startOpen}
        setOpen={setStartOpen}
        variant="start"
        onConfirm={startQuiz}
      />
      <ConfirmDialog
        open={stopOpen}
        setOpen={setStopOpen}
        variant="stop"
        onConfirm={stopQuiz}
      />
      <ActiveSessionBanner
        quiz={quiz}
        token={token}
        onAdvance={onAdvanceQuiz}
      />
      <EditQuizDetailsForm
        open={editOpen}
        initialName={quiz?.name ?? ''}
        initialDescription={quiz?.description ?? ''}
        onClose={() => setEditOpen(false)}
        onSave={onUpdateQuiz}
      />
      <Tabs
        value={tab}
        onChange={(_, v: number) => setTab(v)}
        sx={{ px: 2, borderBottom: 1, borderColor: 'divider' }}
        slotProps={{ indicator: { style: { backgroundColor: primaryColor } } }}
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
          onDeleteQuestion={(id) => void deleteQuestion(id)}
          disabled={isActive}
        />
      )}
      {tab === 1 && (
        <SessionsTable oldSessions={quiz?.oldSessions ?? []} quizId={quizId} />
      )}
      <Snackbar
        open={redirectSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled">
          Quiz complete — redirecting to results...
        </Alert>
      </Snackbar>
    </GroupDiv>
  );
}
