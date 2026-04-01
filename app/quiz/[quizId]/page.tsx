'use client';
import { use, useState, useEffect } from 'react';
import ErrorPopup from '../../components/ErrorPopup';
import AdminNavBar from '@/app/components/AdminNavBar';
import NewQuestionForm from '../_components/NewQuestionForm';
import { useRouter } from 'next/navigation';
import { AdminGetQuizResponse, apiClient } from '@/app/lib/apiClient';
import QuizDetailCard from './_components/QuizDetailCard';
import SessionsPanel from './_components/SessionsPanel';
import { Question } from '@/app/lib/types';
import { useUser } from '@/app/lib/UserContext';

export default function QuizDetailsPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = use(params);
  const router = useRouter();
  const { token } = useUser();

  const [quiz, setQuiz] = useState<AdminGetQuizResponse | null>(null);
  const [refetchDetails, setRefetchDetails] = useState(false);
  const [desc] = useState('');
  const [popup, setPopup] = useState(false);
  const [formOpen, setFormOpen] = useState(false);

  const activatePopup = () => {
    setPopup(!popup);
  };

  const refetch = () => setRefetchDetails((v) => !v);

  const advanceQuiz = async () => {
    if (!token) return;
    await apiClient.advanceQuiz(token, quizId);
    refetch();
  };

  const updateQuestions = async (newQuestion: Question) => {
    await apiClient.updateQuiz(token, quizId, {
      questions: [...(quiz?.questions ?? []), newQuestion],
      thumbnail: 'imageProcessed',
    });
    refetch();
    setFormOpen(false);
  };

  useEffect(() => {
    const fetchQuiz = async (id: string, token: string) => {
      const quizInfo = await apiClient.getQuiz(token, id);
      setQuiz(quizInfo);
    };

    if (quizId !== '') {
      void fetchQuiz(quizId, token);
    }
  }, [quizId, token, refetchDetails]);

  return (
    <>
      <header>
        <nav>
          <AdminNavBar />
        </nav>
      </header>
      <QuizDetailCard
        quiz={quiz}
        quizId={quizId}
        token={token}
        onMutated={refetch}
        onDelete={() => router.back()}
        onAddQuestion={() => setFormOpen(true)}
      />
      <SessionsPanel
        quiz={quiz}
        token={token}
        quizId={quizId}
        onAdvance={() => void advanceQuiz()}
      />
      <NewQuestionForm
        gameId={quizId}
        open={formOpen}
        setOpen={setFormOpen}
        updateQuestions={updateQuestions}
      />
      {popup && <ErrorPopup title="Error" desc={desc} toggle={activatePopup} />}
    </>
  );
}
