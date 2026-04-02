'use client';
import { Box } from '@mui/material';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import AppNavBar from '@/app/components/AppNavBar';
import { GroupDiv } from '@/app/user/_components/Dashboard';
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
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [selected, setSelected] = useState<number[]>([]);
  const [currentQuestion, setCurrentQuestion] =
    useState<PublicQuestionReturn | null>(null);
  const [loadingQuestion, setLoadingQuestion] = useState(true);
  const [answerSubmitted, setAnswerSubmitted] = useState(false);
  const [submittingAnswer, setSubmittingAnswer] = useState(false);
  const [navigatingToResults, setNavigatingToResults] = useState(false);
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
    if (gameStarted && timeUpRef.current) {
      const remainingTimeMs = timeUpRef.current.getTime() - Date.now();
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

    setSubmittingAnswer(true);
    try {
      await apiClient.submitPlayerAnswers(playerId, {
        answerIds: selected,
      });
      setAnswerSubmitted(true);
    } finally {
      setSubmittingAnswer(false);
    }
  }, [playerId, selected]);

  // check whether the game has started yet
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const retrieveGameStatus = async () => {
      try {
        setLoadingStatus(true);
        const response = await hasGameStarted(playerId);
        setGameStarted(response.started);

        if (response.started && interval) {
          clearInterval(interval);
        }
      } catch (error) {
        console.error('Error retrieving game status: ', error);
        clearInterval(interval);
      } finally {
        setLoadingStatus(false);
      }
    };

    if (sessionId !== '') {
      interval = setInterval(() => {
        void retrieveGameStatus();
      }, 500);
    }

    return () => clearInterval(interval);
  }, [sessionId, playerId, hasGameStarted]);

  useEffect(() => {
    const retrieveQuestion = async () => {
      try {
        if (!loadingStatus) {
          await fetchNextQuestion();
        }
      } finally {
        setLoadingQuestion(false);
      }
    };

    if (!loadingStatus && gameStarted) {
      void retrieveQuestion();
    }
  }, [gameStarted, loadingStatus, playerId, fetchNextQuestion]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (correctAnswer !== null) {
      if (currentQuestion?.lastQuestion) {
        setGameEnded(true);
        return;
      }
      interval = setInterval(() => {
        void fetchNextQuestion();
      }, 500);
    }

    return () => clearInterval(interval);
  }, [correctAnswer, currentQuestion, fetchNextQuestion]);

  return (
    <>
      <AppNavBar />
      <main>
        <GroupDiv style={{ marginTop: '100px' }}>
          <Box
            style={{
              padding: '20px 0',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '20px',
              width: '100%',
            }}
          >
            {!gameStarted && (
              <LobbyView
                playerName={playerName}
                loading={loadingStatus || loadingQuestion}
              />
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
                submittingAnswer={submittingAnswer}
                navigatingToResults={navigatingToResults}
                onSelectOption={selectOption}
                onSubmitAnswer={() => void submitAnswer()}
                onViewResults={() => {
                  setNavigatingToResults(true);
                  router.push(
                    `/play/${sessionId}/results?playerId=${playerId}`
                  );
                }}
              />
            )}
          </Box>
        </GroupDiv>
      </main>
    </>
  );
}
