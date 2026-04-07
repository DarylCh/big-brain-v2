'use client';
import { use, useState, useEffect, useCallback } from 'react';
import AppNavBar from '@/app/components/AppNavBar';
import NewQuestionForm from './_components/NewQuestionForm';
import { useRouter } from 'next/navigation';
import { AdminGetQuizResponse, apiClient } from '@/app/lib/clients/apiClient';
import QuizPanel from './_components/QuizPanel';
import { Question } from '@/app/lib/types';
import { useUser } from '@/app/lib/UserContext';

export default function QuizDetailsPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = use(params);
  const router = useRouter();
  const { token, isInitialized } = useUser();

  const [quiz, setQuiz] = useState<AdminGetQuizResponse | null>(null);
  const [formOpen, setFormOpen] = useState(false);

  const fetchQuizDetails = useCallback(async () => {
    if (!token) return;
    const quizInfo = await apiClient.getQuiz(token, quizId);
    setQuiz(quizInfo);
  }, [quizId, token]);

  const onAddQuestions = useCallback(
    async (questions: Question[]) => {
      const result = await apiClient.addQuestions(token, quizId, { questions });
      await fetchQuizDetails();
      return result;
    },
    [quizId, token, fetchQuizDetails]
  );

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!token) return;
      const quizInfo = await apiClient.getQuiz(token, quizId);
      setQuiz(quizInfo);
    };

    if (quizId !== '' && token !== '' && isInitialized) {
      void fetchQuiz();
    }
  }, [quizId, token, isInitialized]);

  return (
    <>
      <AppNavBar />
      <QuizPanel
        quiz={quiz}
        quizId={quizId}
        token={token}
        onMutated={fetchQuizDetails}
        onDelete={() => router.back()}
        onAddQuestion={() => setFormOpen(true)}
      />
      <NewQuestionForm
        gameId={quizId}
        open={formOpen}
        setOpen={setFormOpen}
        addQuestions={onAddQuestions}
      />
    </>
  );
}
