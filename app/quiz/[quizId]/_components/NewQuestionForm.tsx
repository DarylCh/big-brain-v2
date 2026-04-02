import {
  Box,
  Checkbox,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  Tooltip,
  Typography,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import { Question } from '@/app/lib/types';

const AnswerOption = ({
  option,
  label,
  updateOption,
}: {
  option: { text: string; correct: boolean };
  label: string;
  updateOption: (newOption: { text?: string; correct?: boolean }) => void;
}) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <TextField
        label={label}
        value={option.text}
        onChange={(e) => updateOption({ text: e.target.value })}
        fullWidth
        margin="dense"
        slotProps={{ htmlInput: { maxLength: 80 } }}
      />
      <Tooltip title={option.correct ? 'Mark as incorrect' : 'Mark as correct'}>
        <Checkbox
          checked={option.correct}
          onChange={(e) => updateOption({ correct: e.target.checked })}
          color="success"
        />
      </Tooltip>
    </Box>
  );
};

type AnswerOptions = 'A' | 'B' | 'C' | 'D';

export const NewQuestionForm = ({
  open,
  setOpen,
  updateQuestions,
}: {
  gameId: string;
  open: boolean;
  setOpen: (open: boolean) => void;
  updateQuestions: (newQuestion: Question, formOpen: boolean) => Promise<void>;
}) => {
  const [newQuestionText, setNewQuestionText] = useState('');
  const [timeNeeded, setTimeNeeded] = useState(15);
  const [options, setOptions] = useState<
    Record<AnswerOptions, { text: string; correct: boolean }>
  >({
    A: { text: '', correct: false },
    B: { text: '', correct: false },
    C: { text: '', correct: false },
    D: { text: '', correct: false },
  });

  const isQuestionValid = useMemo(
    () =>
      newQuestionText.trim() !== '' &&
      Object.values(options).every((o) => o.text.trim() !== '') &&
      Object.values(options).some((o) => o.correct) &&
      !Object.values(options).every((o) => o.correct) &&
      timeNeeded > 0,
    [newQuestionText, options, timeNeeded]
  );

  const updateOption = useCallback(
    (option: AnswerOptions) =>
      ({ text, correct }: { text?: string; correct?: boolean }) => {
        setOptions((prev) => ({
          ...prev,
          [option]: {
            ...prev[option],
            ...(text !== undefined && { text }),
            ...(correct !== undefined && { correct }),
          },
        }));
      },
    [setOptions]
  );

  const resetForm = () => {
    setNewQuestionText('');
    setTimeNeeded(15);
    setOptions({
      A: { text: '', correct: false },
      B: { text: '', correct: false },
      C: { text: '', correct: false },
      D: { text: '', correct: false },
    });
  };

  const submitQuestion = async (keepOpen: boolean) => {
    const correct = Object.values(options)
      .map((o, i) => (o.correct ? i : null))
      .filter((i): i is number => i !== null);
    const newQuestionObj: Question = {
      question: newQuestionText,
      options: Object.values(options).map((o) => o.text),
      Correct: correct,
      timeNeeded,
    };
    await updateQuestions(newQuestionObj, keepOpen);
    resetForm();
    if (!keepOpen) {
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => setOpen(false)}>
      <DialogTitle
        sx={{
          backgroundColor: '#FF5003',
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        New Question
      </DialogTitle>
      <DialogContent>
        <FormControl>
          <TextField
            variant="outlined"
            label="Question"
            placeholder="Enter your question here"
            fullWidth
            margin="dense"
            sx={{ margin: '24px 0' }}
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            slotProps={{
              htmlInput: { maxLength: 150 },
            }}
          />
          <TextField
            variant="outlined"
            label="Duration (seconds)"
            type="number"
            fullWidth
            margin="dense"
            sx={{ marginBottom: '16px' }}
            value={timeNeeded}
            onChange={(e) => setTimeNeeded(Math.max(1, Number(e.target.value)))}
            slotProps={{ htmlInput: { min: 1, max: 300 } }}
          />
          <Typography variant="body2" gutterBottom>
            Add four options and check the box next to each correct answer.
          </Typography>

          {(Object.keys(options) as AnswerOptions[]).map((key) => (
            <AnswerOption
              key={key}
              option={options[key]}
              updateOption={updateOption(key)}
              label={`Option ${key}`}
            />
          ))}
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button
          variant="outlined"
          disabled={!isQuestionValid}
          onClick={() => {
            void submitQuestion(true);
          }}
        >
          Add Another
        </Button>
        <Button
          variant="contained"
          disabled={!isQuestionValid}
          onClick={() => {
            void submitQuestion(false);
          }}
        >
          Finish
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewQuestionForm;
