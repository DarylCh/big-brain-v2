'use client';
import { Box, Button, Typography } from '@mui/material';
import { PublicQuestionReturn } from '@/app/api/play/[playerid]/question/route';
import { OptionBox } from './OptionBox';
import TimerBar from './TimerBar';
import { primaryColor } from '@/app/lib/colors';
import { useMemo } from 'react';

type GameViewProps = {
  currentQuestion: PublicQuestionReturn;
  questionNumber: number;
  selected: number[];
  answerSubmitted: boolean;
  correctAnswer: number[] | null;
  gameStarted: boolean;
  gameEnded: boolean;
  onSelectOption: (id: number) => void;
  onSubmitAnswer: () => void;
  onViewResults: () => void;
};

const buttonColor = (correct: boolean, isSelected: boolean) =>
  correct ? 'green' : isSelected ? primaryColor : 'grey';

export default function GameView({
  currentQuestion,
  questionNumber,
  selected,
  answerSubmitted,
  correctAnswer,
  gameStarted,
  gameEnded,
  onSelectOption,
  onSubmitAnswer,
  onViewResults,
}: GameViewProps) {
  const subTitleText = useMemo(() => {
    return gameEnded
      ? 'The game has ended. Please follow the link below to view results!'
      : correctAnswer !== null
        ? [...correctAnswer].sort().join() === [...selected].sort().join()
          ? 'Correct! Great job'
          : 'Incorrect, better luck next time!'
        : answerSubmitted
          ? 'Answer submitted, waiting for time to run out'
          : 'Select your answer and submit before time runs out!';
  }, [correctAnswer, selected, answerSubmitted, gameEnded]);

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '20px',
        width: '100%',
      }}
    >
      <Box
        sx={{
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          width: '100%',
          mt: 3,
        }}
      >
        <Box
          sx={{
            border: `3px solid ${primaryColor}`,
            borderRadius: '8px',
            px: 3,
            py: 2,
            width: '100%',
            minHeight: '100px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h5"
            fontStyle="initial"
            fontWeight="bold"
            color="text.primary"
          >
            Question {questionNumber}: {currentQuestion.question}
          </Typography>
        </Box>
        <Typography marginTop="16px" variant="subtitle1" color="textSecondary">
          {subTitleText}
        </Typography>
      </Box>
      <TimerBar
        startedAtMs={new Date(
          currentQuestion.isoTimeLastQuestionStarted ?? ''
        ).getTime()}
        durationMs={(currentQuestion.timeNeeded ?? 10) * 1000}
      />
      <Box
        width="100%"
        display="grid"
        gridTemplateColumns={{ xs: '1fr', sm: '1fr 1fr' }}
        gap="16px"
        rowGap="2px"
      >
        {currentQuestion.options.map((option: string, index: number) => (
          <OptionBox
            key={index}
            onClick={() => onSelectOption(index)}
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
        ))}
      </Box>
      {correctAnswer === null && (
        <Button
          variant="contained"
          color="primary"
          onClick={onSubmitAnswer}
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
        <Button variant="contained" color="primary" onClick={onViewResults}>
          View Results
        </Button>
      )}
    </Box>
  );
}
