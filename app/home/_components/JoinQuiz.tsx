'use client';
import { useState } from 'react';
import { GroupDiv } from './Dashboard';
import { FormControl, TextField } from '@mui/material';
import Title from '@/app/components/Title';
import FullButton from '@/app/components/FullButton';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/app/lib/apiClient';

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
  const [joinQuizLoading, setJoinQuizLoading] = useState(false);
  const router = useRouter();

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

      activateClicked();
      const res = await apiClient.joinSession(quizCode, {
        // TODO: Change this to the actual player name
        name: 'Daryl',
      });

      console.log('Join quiz response: ', res);
      const params = new URLSearchParams({
        playerId: res.playerId.toString(),
      });

      if (res) {
        router.push(`/play/${quizCode}?${params.toString()}`);
      }
    } finally {
      setQuizCode('');
      setJoinQuizLoading(false);
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
          onChange={(e) => setQuizCode(e.target.value)}
        />
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
