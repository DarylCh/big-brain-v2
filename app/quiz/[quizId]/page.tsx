'use client';
import { use, useState, useEffect } from 'react';
import { GroupDiv } from '../../home/_components/Dashboard';
import { Box, Typography } from '@mui/material';
import ErrorPopup from '../../components/ErrorPopup';
import AdminNavBar from '@/app/components/AdminNavBar';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import NewQuestionForm from '../_components/NewQuestionForm';
import { useRouter } from 'next/navigation';
import CircleIconButton from '@/app/components/CircleIconButton';
import ConfirmDialog from '../_components/ConfirmDialog';
import ForwardIcon from '@mui/icons-material/Forward';
import StopIcon from '@mui/icons-material/Stop';
import { AdminGetQuizResponse, apiClient } from '@/app/lib/apiClient';
import QuestionsTable from './_components/QuestionsTable';
import SessionsPanel from './_components/SessionsPanel';
import { Question } from '@/app/lib/types';
import { primaryColor, primaryHoverColor } from '@/app/lib/colors';

export default function QuizDetailsPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  const { quizId } = use(params);
  const router = useRouter();
  const [token] = useState(() =>
    typeof window !== 'undefined' ? (localStorage.getItem('token') ?? '') : ''
  );

  const [quiz, setQuiz] = useState<AdminGetQuizResponse | null>(null);
  const [refetchDetails, setRefetchDetails] = useState(false);
  const [desc] = useState('');
  const [popup, setPopup] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [startOpen, setStartOpen] = useState(false);
  const [stopOpen, setStopOpen] = useState(false);

  const activatePopup = () => {
    setPopup(!popup);
  };

  const deleteQuiz = async () => {
    const req = await fetch(`/api/admin/quiz/${quizId}`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        Authorization: token ?? '',
      },
    });
    if (req.ok) {
      router.back();
    }
  };

  const startQuiz = async () => {
    if (!token) return;
    const req = await fetch(`/api/admin/quiz/${quizId}/start`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: token ?? '',
      },
    });
    if (req.ok) {
      setRefetchDetails((v) => !v);
    }
  };

  const advanceQuiz = async () => {
    if (!token) return;
    const req = await fetch(`/api/admin/quiz/${quizId}/advance`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: token ?? '',
      },
    });
    if (req.ok) {
      setRefetchDetails((v) => !v);
    }
  };

  const stopQuiz = async () => {
    if (!token) return;
    const req = await fetch(`/api/admin/quiz/${quizId}/end`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: token ?? '',
      },
    });
    if (req.ok) {
      setRefetchDetails((v) => !v);
    }
  };

  const updateQuestions = async (newQuestion: Question) => {
    const req = await fetch(`/api/admin/quiz/${quizId}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({
        questions: [...(quiz?.questions ?? []), newQuestion],
        thumbnail: 'imageProcessed',
      }),
    });

    if (req.ok) {
      setRefetchDetails(!refetchDetails);
      setFormOpen(false);
    }
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
            ></Box>
            <Box>
              <Typography variant="body2">Quiz Details</Typography>
              <Typography variant="h4" color={`${primaryColor}`}>
                {quiz?.name}
              </Typography>
              <Typography variant="body2">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
                enim ad minim veniam, quis nostrud exercitation ullamco laboris
                nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor
                in reprehenderit in voluptate velit esse cillum dolore eu fugiat
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
            <PlayCircleIcon
              sx={{
                fontSize: 48,
                color: `${primaryColor}`,
                cursor: 'pointer',
                ':hover': { color: `${primaryHoverColor}` },
              }}
              onClick={() => setStartOpen(true)}
            />
            <StopIcon
              sx={{
                fontSize: 48,
                color: `${primaryColor}`,
                cursor: 'pointer',
                ':hover': { color: `${primaryHoverColor}` },
              }}
              onClick={() => setStopOpen(true)}
            />
            <ForwardIcon
              sx={{
                fontSize: 48,
                color: `${primaryColor}`,
                cursor: 'pointer',
                ':hover': { color: `${primaryHoverColor}` },
              }}
              onClick={() => void advanceQuiz()}
            />
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
          onAddQuestion={() => setFormOpen(true)}
        />
      </GroupDiv>
      <GroupDiv>
        <SessionsPanel quiz={quiz} />
      </GroupDiv>
      <NewQuestionForm
        gameId={quizId}
        open={formOpen}
        setOpen={setFormOpen}
        updateQuestions={updateQuestions}
      ></NewQuestionForm>
      {popup && <ErrorPopup title="Error" desc={desc} toggle={activatePopup} />}
    </>
  );
}
