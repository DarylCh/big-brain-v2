'use client';
import { useState } from 'react';
import { GroupDiv } from './Dashboard';
import { FormControl, TextField, SxProps, Theme } from '@mui/material';
import Title from '@/app/components/Title';
import FullButton from '@/app/components/FullButton';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/app/lib/clients/apiClient';
import { useUser } from '@/app/lib/UserContext';

// This component is used to join an existing quiz on the
// quiz dashboard
const JoinQuiz = ({
  activatePopup,
  activateClicked,
  setDesc,
  sx,
}: {
  activatePopup: () => void;
  activateClicked: () => void;
  setDesc: (desc: string) => void;
  sx?: SxProps<Theme>;
}) => {
  const [quizCode, setQuizCode] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [joinQuizLoading, setJoinQuizLoading] = useState(false);
  const router = useRouter();
  const { token } = useUser();

  const nameFromToken = (() => {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return (payload.name as string | null) ?? null;
    } catch {
      return null;
    }
  })();

  // This function checks that the data is valid
  // then changes sends it to the backend to
  // create a new game
  const joinQuiz = async () => {
    try {
      setJoinQuizLoading(true);
      if (quizCode === '') {
        setDesc('Please enter a game code');
        activatePopup();
        return;
      }
      const resolvedName = nameFromToken ?? playerName;
      if (resolvedName === '') {
        setDesc('Please enter your name');
        activatePopup();
        return;
      }

      activateClicked();
      const res = await apiClient.joinSession(quizCode, {
        name: resolvedName,
      });

      const params = new URLSearchParams({
        playerId: res.playerId.toString(),
        name: resolvedName,
      });

      if (res) {
        router.push(`/play/${quizCode}?${params.toString()}`);
      }
    } finally {
      setQuizCode('');
      setPlayerName('');
      setJoinQuizLoading(false);
    }
  };

  return (
    <GroupDiv sx={{ display: 'flex', flexDirection: 'column', ...sx }}>
      <Title style={{ marginBottom: '10px' }}>Got a quiz code?</Title>
      <FormControl
        aria-label="join-game-form"
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
          id="game-title"
          label="Code"
          placeholder="Enter your game code"
          aria-label="Game code field"
          value={quizCode}
          onChange={(e) => setQuizCode(e.target.value)}
        />
        {!nameFromToken && (
          <TextField
            id="player-name"
            label="Name"
            placeholder="Enter your name"
            aria-label="Player name field"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
          />
        )}
        <FullButton
          id="join-quiz-button"
          aria-label="Join quiz button"
          onClick={() => void joinQuiz()}
          disabled={quizCode.length === 0 || joinQuizLoading}
          loading={joinQuizLoading}
          style={{ marginTop: 'auto' }}
        >
          Join
        </FullButton>
      </FormControl>
    </GroupDiv>
  );
};

export default JoinQuiz;
