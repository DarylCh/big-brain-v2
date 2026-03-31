'use client';
import { useState } from 'react';
import { GroupDiv } from './Dashboard';
import Title from '@/app/components/Title';
import { FormControl, TextField } from '@mui/material';
import FullButton from '@/app/components/FullButton';
import { apiClient } from '@/app/lib/apiClient';

// This component is used to create a new quiz on the
// quiz dashboard
const CreateQuiz = ({
  activatePopup,
  activateClicked,
  setDesc,
  changed,
  setChanged,
}: {
  activatePopup: () => void;
  activateClicked: () => void;
  setDesc: (desc: string) => void;
  changed: boolean;
  setChanged: (changed: boolean) => void;
}) => {
  const [name, setName] = useState('');
  const [createQuizLoading, setCreateQuizLoading] = useState(false);

  // This function checks that the data is valid
  // then changes sends it to the backend to
  // create a new game
  const submit = async () => {
    try {
      setCreateQuizLoading(true);
      const storedToken = localStorage.getItem('token');
      if (name === '') {
        setDesc('Please enter a name');
        activatePopup();
        return;
      }

      activateClicked();
      await apiClient.createQuiz(storedToken ?? '', { name });
      // const req = await fetch('/api/admin/quiz', {
      //   method: 'POST',
      //   headers: {
      //     'Content-type': 'application/json',
      //     Authorization: storedToken ?? '',
      //   },
      //   body: JSON.stringify({
      //     name: name,
      //   }),
      // });
    } finally {
      setCreateQuizLoading(false);
    }
  };

  return (
    <GroupDiv>
      <Title>Create a game</Title>
      <FormControl
        aria-label="create-game-form"
        style={{ width: '100%', gap: '20px', marginTop: '20px' }}
      >
        <TextField
          id="game-title"
          label="Name"
          placeholder="Enter game name..."
          aria-label="Edit game name field"
          onChange={(e) => setName(e.target.value)}
        />
        <FullButton
          id="create-game-button"
          aria-label="create-new-game-button"
          onClick={void submit}
          disabled={name.length === 0 || createQuizLoading}
          loading={createQuizLoading}
        >
          Create Game
        </FullButton>
      </FormControl>
    </GroupDiv>
  );
};

export default CreateQuiz;
