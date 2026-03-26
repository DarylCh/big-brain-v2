'use client';
import { useState } from 'react';
import { GroupDiv } from './Dashboard';
import Title from '@/app/components/Title';

const formStyle = {
  margin: '20px auto 10px auto',
};
const buttonStyle = {
  width: '100%',
};

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

  // This function checks that the data is valid
  // then changes sends it to the backend to
  // create a new game
  const submit = async () => {
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
  };

  return (
    <GroupDiv>
      <Title name="Create a game!"></Title>
      <form aria-label="Create game form">
        <input
          id="game-title"
          type="text"
          className="form-control"
          placeholder="Enter game name..."
          aria-label="Edit game title field"
          style={formStyle}
          onChange={(e) => setName(e.target.value)}
        ></input>
      </form>
      <button
        id="create-game-button"
        className="btn btn-primary"
        aria-label="Create new game field"
        style={buttonStyle}
        onClick={submit}
      >
        Create New Game
      </button>
    </GroupDiv>
  );
};

export default CreateGame;
