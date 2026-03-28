'use client';
import { useState } from 'react';
import { GroupDiv } from './Dashboard';
import Title from '@/app/components/Title';
import { FormControl, TextField } from '@mui/material';
import FullButton from '@/app/components/FullButton';

// This component is used to create a new game on the
// game dashboard
const CreateGame = ({
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
  const [createGameLoading, setCreateGameLoading] = useState(false);

  // This function checks that the data is valid
  // then changes sends it to the backend to
  // create a new game
  const submit = async () => {
    try {
      setCreateGameLoading(true);
      const storedToken = localStorage.getItem('token');
      if (name === '') {
        setDesc('Please enter a name');
        activatePopup();
        return;
      }

      activateClicked();
      const req = await fetch('/api/admin/quiz', {
        method: 'POST',
        headers: {
          'Content-type': 'application/json',
          Authorization: storedToken ?? '',
        },
        body: JSON.stringify({
          name: name,
        }),
      });
      const response = await req.json();
      if (!req.ok) {
        setDesc(response.error);
        setDesc(storedToken ?? '');
        activatePopup();
      } else {
        setChanged(!changed);
      }
    } finally {
      setCreateGameLoading(false);
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
          onClick={submit}
          disabled={name.length === 0 || createGameLoading}
          loading={createGameLoading}
        >
          Create Game
        </FullButton>
      </FormControl>
    </GroupDiv>
  );
};

export default CreateGame;
