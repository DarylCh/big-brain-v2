import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  Typography,
} from '@mui/material';
import { useCallback, useMemo, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
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
        justifyContent: 'space-between',
        ':hover': { backgroundColor: '#f0f0f0', cursor: 'pointer' },
        borderRadius: '8px',
      }}
      onClick={() => updateOption({ correct: !option.correct })}
    >
      <TextField
        label={label}
        value={option.text}
        onChange={(e) => updateOption({ text: e.target.value })}
        fullWidth
        margin="dense"
        slotProps={{ htmlInput: { maxLength: 80 } }}
      />
      <CheckIcon
        sx={{ color: option.correct ? 'green' : '#fafafa', marginLeft: '8px' }}
      />
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
  updateQuestions: (newQuestion: Question) => Promise<void>;
}) => {
  const [newQuestionText, setNewQuestionText] = useState('');
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
      !Object.values(options).every((o) => o.correct),
    [newQuestionText, options]
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

  const submitQuestion = async () => {
    const newQuestionObj: Question = {
      question: newQuestionText,
      options: Object.values(options).map((o) => o.text),
      Correct: [1, 2],
      timeNeeded: 100,
    };
    await updateQuestions(newQuestionObj);
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
          <Typography variant="body2" gutterBottom>
            Add four options below. Note that there is a character limit of 80
            for each option.
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
          variant="contained"
          disabled={!isQuestionValid}
          onClick={() => {
            submitQuestion();
          }}
        >
          Add
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NewQuestionForm;
