'use client';
import { Box } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import AdminNavBar from '@/app/components/AdminNavBar';
import { GroupDiv } from '@/app/home/_components/Dashboard';
import { PublicQuestionReturn } from '@/app/api/play/[playerid]/question/route';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/app/lib/apiClient';
import LobbyView from './_components/LobbyView';
import GameView from './_components/GameView';

type HasStartedResponse = { started: boolean };

export default function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const playerId = useSearchParams().get('playerId') ?? '';
  const playerName = useSearchParams().get('name') ?? '';
  const [gameStarted, setGameStarted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [refetchQuestion, setRefetchQuestion] = useState(false);
  const [currentQuestion, setCurrentQuestion] =
    useState<PublicQuestionReturn | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [correctAnswer, setCorrectAnswer] = useState<number[] | null>(null);
  const [gameEnded, setGameEnded] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const router = useRouter();
  const timeUpRef = useRef<Date | null>(null);

  const hasGameStarted = useCallback(
    async (playerId: string): Promise<HasStartedResponse> => {
      const response = await apiClient.getPlayerStatus(playerId);
      return response;
    },
    []
  );

  const retrieveCurrentQuestion = useCallback(
    async (playerId: string): Promise<{ question: PublicQuestionReturn }> => {
      const response = await apiClient.getPlayerQuestion(playerId);
      return response;
    },
    []
  );

  const retrieveAndDisplayCorrectAnswer = useCallback(
    async (playerId: string) => {
      const res = await apiClient.getCorrectAnswerIds(playerId);
      setCorrectAnswer(res.answerIds);
    },
    []
  );

  // useEffect to control time and answer submission
  useEffect(() => {
    let timeOut: NodeJS.Timeout | null = null;
    if (gameStarted) {
      const remainingTimeMs = timeUpRef.current
        ? timeUpRef.current.getTime() - Date.now()
        : 0;
      timeOut = setTimeout(
        () => {
          void retrieveAndDisplayCorrectAnswer(playerId);
        },
        Math.max(0, remainingTimeMs)
      );
    }

    return () => {
      if (timeOut) {
        clearTimeout(timeOut);
      }
    };
  }, [gameStarted, currentQuestion, playerId, retrieveAndDisplayCorrectAnswer]);

  const fetchNextQuestion = useCallback(async () => {
    const res = await retrieveCurrentQuestion(playerId);
    if (
      currentQuestion &&
      JSON.stringify(res.question) === JSON.stringify(currentQuestion)
    ) {
      return;
    }

    if (!res.question.isoTimeLastQuestionStarted) {
      throw new Error('Question start time is null, possible payload error');
    }

    const deadline = new Date(res.question.isoTimeLastQuestionStarted);
    deadline.setSeconds(
      deadline.getSeconds() + (res.question.timeNeeded ?? 10)
    );
    timeUpRef.current = deadline;
    setCurrentQuestion(res.question);
    setQuestionNumber((n) => n + 1);
    setCorrectAnswer(null);
    setSelected([]);
    setAnswerSubmitted(false);
  }, [currentQuestion, playerId, retrieveCurrentQuestion]);

  const selectOption = (optionId: number) => {
    if (correctAnswer !== null) {
      return;
    }
    if (selected.includes(optionId)) {
      setSelected(selected.filter((id) => id !== optionId));
    } else {
      setSelected([...selected, optionId]);
    }
  };

  const submitAnswer = useCallback(async () => {
    if (selected.length === 0) {
      return;
    }

    await apiClient.submitPlayerAnswers(playerId, {
      answerIds: selected,
    });

    setAnswerSubmitted(true);
  }, [playerId, selected]);

  // check whether the game has started yet
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const retrieveInfo = async () => {
      try {
        setLoading(true);
        const response = await hasGameStarted(playerId);
        setGameStarted(response.started);

        if (response.started && interval) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error retrieving session info: ', error);
        clearInterval(interval);
      } finally {
        setLoading(false);
      }
    };

    if (sessionId !== '') {
      interval = setInterval(() => {
        void retrieveInfo();
      }, 500);
    }

    return () => clearInterval(interval);
  }, [sessionId, playerId, hasGameStarted]);

  useEffect(() => {
    const retrieveQuestion = async () => {
      try {
        if (!loading) {
          await fetchNextQuestion();
        }
      } finally {
        setLoadingQuestion(false);
      }
    };

    if (!loading && gameStarted) {
      void retrieveQuestion();
    }
  }, [gameStarted, loading, refetchQuestion, playerId, fetchNextQuestion]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (correctAnswer !== null) {
      if (currentQuestion?.lastQuestion) {
        setGameEnded(true);
        return;
      }
      interval = setInterval(() => {
        setRefetchQuestion((prev) => !prev);
      }, 500);
    }

    return () => clearInterval(interval);
  }, [correctAnswer, currentQuestion]);

  return (
    <>
      <header>
        <nav>
          <AdminNavBar />
        </nav>
      </header>
      <main>
        <GroupDiv style={{ marginTop: '100px' }}>
          <Box
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              width: '100%',
            }}
          >
            {(loading || loadingQuestion) && !currentQuestion && (
              <CircularProgress />
            )}
            {!gameStarted && (
              <LobbyView playerName={playerName} loading={loading} />
            )}
            {!!currentQuestion && (
              <GameView
                currentQuestion={currentQuestion}
                questionNumber={questionNumber}
                selected={selected}
                answerSubmitted={answerSubmitted}
                correctAnswer={correctAnswer}
                gameStarted={gameStarted}
                gameEnded={gameEnded}
                onSelectOption={selectOption}
                onSubmitAnswer={() => void submitAnswer()}
                onViewResults={() =>
                  router.push(`/play/${sessionId}/results?playerId=${playerId}`)
                }
              />
            )}
          </Box>
        </GroupDiv>
      </main>
    </>
  );
}
