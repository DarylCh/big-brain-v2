'use client';
import { useState } from 'react';
import { Tab, Tabs } from '@mui/material';
import ConfirmDialog from './ConfirmDialog';
import QuestionsTable from './QuestionsTable';
import ActiveSessionBanner from './ActiveSessionBanner';
import SessionsTable from './SessionsTable';
import QuizDetailCard from './QuizDetailCard';
import QuizActionsBar from './QuizActionsBar';
import { AdminGetQuizResponse, apiClient } from '@/app/lib/apiClient';
import { primaryColor } from '@/app/lib/colors';
import { GroupDiv } from '@/app/user/_components/Dashboard';

interface Props {
  quiz: AdminGetQuizResponse | null;
  quizId: string;
  token: string;
  onMutated: () => void;
  onDelete: () => void;
  onAddQuestion: () => void;
  onAdvance: () => Promise<void>;
  onEditOpen: () => void;
}

export default function QuizPanel({
  quiz,
  quizId,
  token,
  onMutated,
  onDelete,
  onAddQuestion,
  onAdvance,
  onEditOpen,
}: Props) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);
  const [tab, setTab] = useState(0);

  const deleteQuestion = async (index: number) => {
    const updated = (quiz?.questions ?? []).filter(
      (_question, i) => i !== index
    );
    await apiClient.updateQuiz(token, quizId, { questions: updated });
    onMutated();
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
  console.log('quiz info: ', quiz);

  return (
    <GroupDiv style={{ padding: 0, width: '100%' }}>
      <QuizDetailCard
        quiz={quiz}
        quizId={quizId}
        token={token}
        onMutated={onMutated}
        onEditOpen={onEditOpen}
      />
      <QuizActionsBar
        isActive={isActive}
        onStartSession={() => setStartOpen(true)}
        onEndSession={() => setStopOpen(true)}
        onEdit={onEditOpen}
        onDelete={() => setConfirmOpen(true)}
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
