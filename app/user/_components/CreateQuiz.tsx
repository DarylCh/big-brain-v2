'use client';
import { useState } from 'react';
import { GroupDiv } from './Dashboard';
import Title from '@/app/components/Title';
import { FormControl, TextField } from '@mui/material';
import FullButton from '@/app/components/FullButton';
import { apiClient } from '@/app/lib/apiClient';
import { useUser } from '@/app/lib/UserContext';

// This component is used to create a new quiz on the
// quiz dashboard
const CreateQuiz = ({
  activatePopup,
  activateClicked,
  setDesc,
}: {
  activatePopup: () => void;
  activateClicked: () => void;
  setDesc: (desc: string) => void;
}) => {
  const [name, setName] = useState('');
  const [createQuizLoading, setCreateQuizLoading] = useState(false);
  const { token } = useUser();

  // This function checks that the data is valid
  // then changes sends it to the backend to
  // create a new game
  const submit = async () => {
    try {
      setCreateQuizLoading(true);
      if (name === '') {
        setDesc('Please enter a name');
        activatePopup();
        return;
      }

      activateClicked();
      await apiClient.createQuiz(token, { name });
    } finally {
      setCreateQuizLoading(false);
    }
  };

  return (
    <GroupDiv style={{ display: 'flex', flexDirection: 'column' }}>
      <Title>Create a quiz</Title>
      <FormControl
        aria-label="create-quiz-form"
        style={{
          width: '100%',
          gap: '10px',
          marginTop: '10px',
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <TextField
          id="quiz-title"
          label="Name"
          placeholder="Enter new quiz name..."
          aria-label="Edit quiz name field"
          onChange={(e) => setName(e.target.value)}
        />
        <FullButton
          id="create-quiz-button"
          aria-label="create-new-quiz-button"
          onClick={() => void submit()}
          disabled={name.length === 0 || createQuizLoading}
          loading={createQuizLoading}
          style={{ marginTop: 'auto' }}
        >
          Create Quiz
        </FullButton>
      </FormControl>
    </GroupDiv>
  );
};

export default CreateQuiz;
