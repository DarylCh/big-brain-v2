'use client';
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { Button } from '@mui/material';
import Title from '../../components/Title';
import { styled } from '@mui/material/styles';
import { useRouter } from 'next/navigation';
import { GroupDiv } from '../../home/_components/Dashboard';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import { apiClient, QuizListItem } from '@/app/lib/apiClient';
import { Quiz } from '@/app/lib/types';
import QuizCard from './QuizCard';

export const Thumbnail = styled('img')`
  width: 100%;
  margin: 5px 0 10px 0;
`;

const QuizFeed = ({ click }: { click: boolean }) => {
  const token =
    typeof window !== 'undefined' ? (localStorage.getItem('token') ?? '') : '';
  const [quizzes, setQuizzes] = useState<QuizListItem[]>([]);
  const router = useRouter();

  const navEdit = (quizId: string) => {
    router.push(`/quiz/${quizId}`);
  };

  useEffect(() => {
    const fetchQuizzes = async () => {
      const req = await apiClient.getAdminQuizzes(token);
      setQuizzes(req.quizzes);
    };

    void fetchQuizzes();
  }, [click, token]);

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
          <Title>Your Quizzes</Title>
          <Button variant="outlined">
            <Typography>Create</Typography>
          </Button>
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
      </GroupDiv>
    </>
  );
};

QuizFeed.propTypes = {
  click: PropTypes.bool,
};

export default QuizFeed;
