'use client';
import { useState } from 'react';
import { GroupDiv } from './Dashboard';
import { FormControl, TextField } from '@mui/material';
import Title from '@/app/components/Title';
import FullButton from '@/app/components/FullButton';
import { useRouter } from 'next/navigation';

const formStyle = {
  margin: '20px auto 10px auto',
  width: '100%',
};

// This component is used to join an existing game on the
// game dashboard
const JoinGame = ({
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
  const [gameCode, setGameCode] = useState('');
  const [joinGameLoading, setJoinGameLoading] = useState(false);
  const router = useRouter();

  // This function checks that the data is valid
  // then changes sends it to the backend to
  // create a new game
  const joinGame = async () => {
    try {
      setJoinGameLoading(true);
      const storedToken = localStorage.getItem('token');
      if (gameCode === '') {
        setDesc('Please enter a game code');
        activatePopup();
        return;
      }

      activateClicked();

      const req = await fetch(
        `/api/play/join/${encodeURIComponent(gameCode)}`,
        {
          method: 'POST',
          headers: {
            'Content-type': 'application/json',
            Authorization: storedToken ?? '',
          },
          body: JSON.stringify({
            name: 'Daryl',
          }),
        }
      );

      const response = (await req.json()) as Promise<{
        playerId: string;
      }>;

      console.log('Join game response: ', response);
      const params = new URLSearchParams({
        playerId: (await response).playerId,
      });
      if (req.ok) {
        router.push(`/play/${gameCode}?${params.toString()}`);
      }

      if (!req.ok) {
        setDesc(response.error);
        setDesc(storedToken ?? '');
        activatePopup();
      } else {
        setChanged(!changed);
      }
    } finally {
      setGameCode('');
      setJoinGameLoading(false);
    }
  };

  return (
    <GroupDiv>
      <Title>Got a game code?</Title>
      <FormControl
        aria-label="join-game-form"
        style={{ width: '100%', gap: '10px' }}
      >
        <TextField
          id="game-title"
          label="Code"
          placeholder="Enter your game code"
          aria-label="Game code field"
          style={formStyle}
          onChange={(e) => setGameCode(e.target.value)}
        />
        <FullButton
          id="join-game-button"
          aria-label="Join game button"
          onClick={joinGame}
          disabled={gameCode.length === 0 || joinGameLoading}
          loading={joinGameLoading}
        >
          Join
        </FullButton>
      </FormControl>
    </GroupDiv>
  );
};

export default JoinGame;
