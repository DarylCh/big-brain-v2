'use client';
import { Box, Button, Typography } from '@mui/material';
import CircularProgress from '@mui/material/CircularProgress';
import { use, useCallback, useEffect, useRef, useState } from 'react';
import AdminNavBar from '@/app/components/AdminNavBar';
import { GroupDiv } from '@/app/home/_components/Dashboard';
import { OptionBox } from './_components/OptionBox';
import TimerBar from './_components/TimerBar';
import { PublicQuestionReturn } from '@/app/api/play/[playerid]/question/route';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiClient } from '@/app/lib/apiClient';
import { primaryColor } from '@/app/lib/colors';

type HasStartedResponse = { started: boolean };

export default function SessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = use(params);
  const playerId = useSearchParams().get('playerId') ?? '';
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
  const router = useRouter();
  const timeUpRef = useRef<Date | null>(null);

  const hasGameStarted = useCallback(
    async (playerId: string): Promise<HasStartedResponse> => {
      const response = await fetch(`/api/play/${playerId}/status`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Client - Failed to retrieve session details');
      }
      return response.json() as Promise<HasStartedResponse>;
    },
    []
  );

  const retrieveCurrentQuestion = useCallback(
    async (playerId: string): Promise<{ question: PublicQuestionReturn }> => {
      const response = await fetch(`/api/play/${playerId}/question`, {
        cache: 'no-store',
      });
      if (!response.ok) {
        throw new Error('Failed to retrieve session details');
      }
      return response.json() as Promise<{ question: PublicQuestionReturn }>;
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
    console.log('Submitting answer: ', selected);
    if (selected.length === 0) {
      return;
    }

    await apiClient.submitPlayerAnswers(playerId, {
      answerIds: selected,
    });

    setAnswerSubmitted(true);
  }, [playerId, selected]);

  const buttonColor = (correct: boolean, selected: boolean) =>
    correct ? 'green' : selected ? primaryColor : 'grey';

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
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
              Game Lobby
            </Typography>
            {(loading || loadingQuestion) && <CircularProgress />}
            {!loading && !gameStarted && (
              <Typography variant="h6" color="textSecondary">
                Sit tight! The host should be starting the game soon...
              </Typography>
            )}
            {!!currentQuestion && (
              <>
                <Box
                  sx={{
                    textAlign: 'center',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                  }}
                >
                  <Typography
                    variant="h4"
                    fontStyle="initial"
                    fontWeight="bold"
                    color={primaryColor}
                  >
                    {currentQuestion?.question ?? ''}
                  </Typography>
                  {answerSubmitted && !correctAnswer && (
                    <Typography variant="subtitle1" color="textSecondary">
                      Answer submitted, waiting for time to run out
                    </Typography>
                  )}
                  {correctAnswer && (
                    <>
                      <Typography variant="body1" color="textSecondary">
                        {[...correctAnswer].sort().join() ===
                        [...selected].sort().join()
                          ? 'Correct! Great job'
                          : 'Incorrect, better luck next time!'}
                      </Typography>
                    </>
                  )}
                </Box>
                <TimerBar
                  startedAtMs={new Date(
                    currentQuestion?.isoTimeLastQuestionStarted ?? ''
                  ).getTime()}
                  durationMs={(currentQuestion?.timeNeeded ?? 10) * 1000}
                />
                <Box
                  width="100%"
                  display="grid"
                  gridTemplateColumns="1fr 1fr"
                  gap="16px"
                  rowGap="2px"
                >
                  {currentQuestion?.options.map(
                    (option: string, index: number) => (
                      <OptionBox
                        key={index}
                        onClick={() => selectOption(index)}
                        isCorrect={correctAnswer?.includes(index) ?? false}
                        sx={{
                          backgroundColor: buttonColor(
                            correctAnswer?.includes(index) ?? false,
                            correctAnswer === null && selected.includes(index)
                          ),
                        }}
                      >
                        {option}
                      </OptionBox>
                    )
                  )}
                </Box>
                {correctAnswer === null && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => void submitAnswer()}
                    disabled={
                      !gameStarted ||
                      answerSubmitted ||
                      correctAnswer !== null ||
                      selected.length === 0
                    }
                  >
                    Submit
                  </Button>
                )}
                {gameEnded && (
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() =>
                      router.push(
                        `/play/${sessionId}/results?playerId=${playerId}`
                      )
                    }
                  >
                    View Results
                  </Button>
                )}
              </>
            )}
          </Box>
        </GroupDiv>
      </main>
    </>
  );
}
