'use client';
import { use, useState, useEffect } from 'react';
import ErrorPopup from '../../components/ErrorPopup';
import AppNavBar from '@/app/components/AppNavBar';
import NewQuestionForm from './_components/NewQuestionForm';
import EditQuizDetailsForm from './_components/EditQuizDetailsForm';
import { useRouter } from 'next/navigation';
import { AdminGetQuizResponse, apiClient } from '@/app/lib/clients/apiClient';
import QuizPanel from './_components/QuizPanel';
import { Question } from '@/app/lib/types';
import { useUser } from '@/app/lib/UserContext';
import { Snackbar, Alert } from '@mui/material';

export default function QuizDetailsPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = use(params);
  const router = useRouter();
  const { token, isInitialized } = useUser();

  const [quiz, setQuiz] = useState<AdminGetQuizResponse | null>(null);
  const [refetchDetails, setRefetchDetails] = useState(false);
  const [desc] = useState('');
  const [popup, setPopup] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [redirectSnackbar, setRedirectSnackbar] = useState(false);

  const saveDetails = async (name: string, description: string) => {
    await apiClient.updateQuiz(token, quizId, { name, description });
    setEditOpen(false);
    refetch();
  };

  const activatePopup = () => {
    setPopup(!popup);
  };

  const refetch = () => setRefetchDetails((v) => !v);

  const advanceQuiz = async () => {
    if (!token) return;
    const sessionPosition = await apiClient.advanceQuiz(token, quizId);
    if (sessionPosition.stage === -2) {
      setTimeout(() => {
        router.push(`/quiz/${quizId}/session/${quiz?.active}/results`);
      }, 2000);
      setRedirectSnackbar(true);
    }

    refetch();
  };

  const updateQuestions = async (newQuestion: Question, formOpen: boolean) => {
    await apiClient.updateQuiz(token, quizId, {
      questions: [...(quiz?.questions ?? []), newQuestion],
      thumbnail: 'imageProcessed',
    });
    refetch();
    setFormOpen(formOpen);
  };

  useEffect(() => {
    const fetchQuiz = async (id: string, token: string) => {
      const quizInfo = await apiClient.getQuiz(token, id);
      setQuiz(quizInfo);
    };

    if (quizId !== '' && token !== '' && isInitialized) {
      void fetchQuiz(quizId, token);
    }
  }, [quizId, token, isInitialized, refetchDetails]);

  return (
    <>
      <AppNavBar />
      <QuizPanel
        quiz={quiz}
        quizId={quizId}
        token={token}
        onMutated={refetch}
        onDelete={() => router.back()}
        onAddQuestion={() => setFormOpen(true)}
        onAdvance={() => advanceQuiz()}
        onEditOpen={() => setEditOpen(true)}
      />
      <NewQuestionForm
        gameId={quizId}
        open={formOpen}
        setOpen={setFormOpen}
        updateQuestions={updateQuestions}
      />
      <EditQuizDetailsForm
        open={editOpen}
        initialName={quiz?.name ?? ''}
        initialDescription={quiz?.description ?? ''}
        onClose={() => setEditOpen(false)}
        onSave={saveDetails}
      />
      {popup && <ErrorPopup title="Error" desc={desc} toggle={activatePopup} />}
      <Snackbar
        open={redirectSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="info" variant="filled">
          Quiz complete — redirecting to results...
        </Alert>
      </Snackbar>
    </>
  );
}
