'use client';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Title from '../../components/Title';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { GroupDiv } from './Dashboard';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import { apiClient, QuizListItem } from '@/app/lib/clients/apiClient';
import QuizCard from '../../quiz/_components/QuizCard';
import { useUser } from '@/app/lib/UserContext';

export const Thumbnail = styled('img')`
  width: 100%;
  margin: 5px 0 10px 0;
`;

const QuizFeed = ({
  click,
  onCount,
}: {
  click: boolean;
  onCount?: (n: number) => void;
}) => {
  const { token, isInitialized } = useUser();
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const router = useRouter();

  const navEdit = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      const req = await apiClient.getAdminQuizzes(token);
      setQuizzes(req.quizzes);
      onCount?.(req.quizzes.length);
    };

    if (isInitialized) {
      void fetchQuizzes();
    }
  }, [click, isInitialized, token, onCount]);

  return (
    <>
      <GroupDiv style={{ marginTop: '8px' }}>
        <div
          style={{
            margin: '10px 0',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <Title>Your Quizzes ({quizzes.length})</Title>
        </div>
        <List style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {quizzes.map((quiz) => (
            <QuizCard
              key={quiz.id}
              quiz={quiz}
              onClick={() => navEdit(quiz.id?.toString() ?? '0')}
            />
          ))}
        </List>
        {quizzes.length === 0 && (
          <Typography
            textAlign="center"
            variant="body1"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            You haven&apos;t created any quizzes yet — create one to get
            started!
          </Typography>
        )}
      </GroupDiv>
    </>
  );
};

QuizFeed.propTypes = {
  click: PropTypes.bool,
};

export default QuizFeed;
