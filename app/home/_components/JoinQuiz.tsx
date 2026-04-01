'use client';
import { useState } from 'react';
import { GroupDiv } from './Dashboard';
import { FormControl, TextField } from '@mui/material';
import Title from '@/app/components/Title';
import FullButton from '@/app/components/FullButton';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/app/lib/apiClient';
import { useUser } from '@/app/lib/UserContext';

const formStyle = {
  margin: '20px auto 10px auto',
  width: '100%',
};

// This component is used to join an existing quiz on the
// quiz dashboard
const JoinQuiz = ({
  activatePopup,
  activateClicked,
  setDesc,
}: {
  activatePopup: () => void;
  activateClicked: () => void;
  setDesc: (desc: string) => void;
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
    <GroupDiv>
      <Title>Got a game code?</Title>
      <FormControl
        aria-label="join-game-form"
        style={{ width: '100%', gap: '5px' }}
      >
        <TextField
          id="game-title"
          label="Code"
          placeholder="Enter your game code"
          aria-label="Game code field"
          style={formStyle}
          value={quizCode}
          onChange={(e) => setQuizCode(e.target.value)}
        />
        {!nameFromToken && (
          <TextField
            id="player-name"
            label="Name"
            placeholder="Enter your name"
            aria-label="Player name field"
            style={formStyle}
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
        >
          Join
        </FullButton>
      </FormControl>
    </GroupDiv>
  );
};

export default JoinQuiz;
