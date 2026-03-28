'use client';
import { CSSProperties, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { GamePopup } from './GameStartPopup';
import { Button, IconButton } from '@mui/material';
import Title from './Title';
import { styled } from '@mui/material/styles';
import ErrorPopup from './ErrorPopup';
import { useRouter } from 'next/navigation';
import { GroupDiv } from '../home/_components/Dashboard';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ImageIcon from '@mui/icons-material/Image';
import Typography from '@mui/material/Typography';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';

interface Game {
  id: string;
  name: string;
  active: null | number | string;
  thumbnail: string | null;
  number: number;
  totalTime: number;
  questions: string[];
}

export const fetchGameInfo = async (quizId: string, token: string) => {
  const req = await fetch(`/api/admin/quiz/${quizId}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json',
      Authorization: token,
    },
  });
  const gameInfo = await req.json();
  return gameInfo;
};

export const Thumbnail = styled('img')`
  width: 100%;
  margin: 5px 0 10px 0;
`;

// This component is used in the dashboard and generates
// a feed of all of the games
const GameFeed = ({ click }: { click: boolean }) => {
  const token = localStorage.getItem('token');
  const [games, setGames] = useState<Game[]>([]);
  const [popup, setPopup] = useState(false);
  const [popup2, setPopup2] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const [desc, setDesc] = useState('');
  const [descTitle, setDescTitle] = useState('');
  const [isStart, setIsStart] = useState(true);
  const router = useRouter();

  // if (!token) {
  //   router.push('/login');
  // }

  // This function is used to call the popup
  const activatePopup = () => {
    setPopup(!popup);
  };

  // This function is used to call the secondary popup
  const activatePopup2 = () => {
    setPopup2(!popup2);
  };

  // This function calculates the total time that
  // each game will take
  const calculateTotalTime = (questions: { timeNeeded: string }[]) => {
    let sum = 0;
    questions.forEach((question) => {
      sum += parseInt(question.timeNeeded);
    });
    return sum;
  };

  // This function updates the game state withxw
  // makes a certain game active
  const updateButton = (quizId: string, sId: string | null) => {
    const updateGames = [...games];
    for (const game of updateGames) {
      if (game.id === quizId) {
        game.active = sId;
      }
    }
    setGames(updateGames);
  };

  // This function executes the state changes needed
  // to halt a game
  const haltGame = (quizId: string, title: string) => {
    setDesc('Would you like to view the results?');
    setDescTitle(title);
    setIsStart(false);
    activatePopup();
    updateButton(quizId, null);
  };

  // This function navigates to the editGame page
  const navEdit = (gameId: string) => {
    router.push(`/game/${gameId}`);
  };

  // This useEffect calls for games to be fetched
  // and processed every time a click is executed
  useEffect(() => {
    // This function updates the info state with the
    // relevent details of each game
    const processGames = async (games: Game[]) => {
      const newGames = [];
      if (games && token) {
        for (const game of games) {
          const info = await fetchGameInfo(game.id, token);
          const totalTime = calculateTotalTime(info.questions);
          info.totalTime = totalTime;
          info.number = info.questions.length;
          info.id = game.id;
          newGames.push(info);
        }
        setGames(newGames);
      }
    };

    const fetchGames = async () => {
      const req = await fetch('/api/admin/quiz', {
        method: 'GET',
        headers: {
          'Content-type': 'application/json',
          Authorization: token ?? '',
        },
      });
      const games = await req.json();
      await processGames(games.quizzes);
    };

    fetchGames();
  }, [click, token]);

  // This function attempts to start a game by
  // calling the backend
  const startGame = async (quizId: string) => {
    if (!token) {
      return;
    }

    const req = await fetch(`/api/admin/quiz/${quizId}/start`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: token ?? '',
      },
    });
    if (req.ok) {
      // console.log(quizId);
      const info = await fetchGameInfo(quizId, token);
      setSessionId(info.active.toString());
      setDesc('The session ID for the game is: ');
      setDescTitle('Game Started!');
      setIsStart(true);
      activatePopup();
      updateButton(quizId, info.active);
    }
  };

  // This function attemps to advance a game by
  // calling the backend
  const advanceGame = async (quizId: string) => {
    const req = await fetch(`/api/admin/quiz/${quizId}/advance`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: token ?? '',
      },
    });
    if (req.ok) {
      setDescTitle('Game Advanced!');
      setDesc('Game has successfully moved forward one question.');
      activatePopup2();
    } else {
      // Game over
      haltGame(quizId, 'Game Over!');
    }
  };

  // This function attempts to stop a game by
  // calling the backend
  const stopGame = async (quizId: string) => {
    await fetch(`/api/admin/quiz/${quizId}/end`, {
      method: 'POST',
      headers: {
        'Content-type': 'application/json',
        Authorization: token ?? '',
      },
    });
    haltGame(quizId, 'Game Stopped!');
  };

  // This function attempts to delete a game by
  // calling the backend
  const deleteGame = async (quizId: string) => {
    const req = await fetch(`/api/admin/quiz/${quizId}`, {
      method: 'DELETE',
      headers: {
        'Content-type': 'application/json',
        Authorization: token ?? '',
      },
    });
    if (req.ok) {
      const newGames = [...games];
      newGames.forEach((game, index) => {
        if (game.id === quizId) {
          newGames.splice(index, 1);
        }
      });
      setGames(newGames);
    }
  };

  const eleStyle = {
    backgroundColor: '#fafafa',
    margin: '20px 10px 20px 10px',
    img: '80%',
    padding: '10px',
    borderRadius: '8px',
  };

  const buttonDiv = {
    display: 'flex',
    justifyContent: 'space-between',
  };

  const textStyle = {
    lineHeight: '1.5',
    marginBottom: '5px',
    marginTop: '5px',
  };

  const gameTitleStyle: CSSProperties = {
    marginBottom: '15px',
    position: 'relative',
    top: '7px',
    color: '#003366',
  };

  const titleDiv = {
    display: 'flex',
    justifyContent: 'space-between',
  };

  return (
    <GroupDiv>
      {popup && (
        <GamePopup
          title={descTitle}
          desc={desc}
          toggle={activatePopup}
          sessionId={sessionId}
          isStart={isStart}
        />
      )}
      {popup2 && (
        <ErrorPopup title={descTitle} desc={desc} toggle={activatePopup2} />
      )}
      <div
        style={{
          margin: '20px 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Title>Your Games</Title>
        <Button variant="outlined">
          <Typography>Create</Typography>
        </Button>
      </div>
      <List style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {games.map((game) => {
          return (
            <ListItem
              key={game.id}
              sx={{
                padding: '0 20px',
                height: '80px',
                backgroundColor: '#fafafa',
                borderRadius: '12px',
                '&:hover': { backgroundColor: '#f0f0f0', cursor: 'pointer' },
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
              onClick={() => navEdit(game.id)}
            >
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <ListItemAvatar>
                  <Avatar>
                    <ImageIcon />
                  </Avatar>
                </ListItemAvatar>
                <div>
                  <Typography variant="h6">{game.name}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {`Questions: ${game.questions.length}`}
                  </Typography>
                </div>
              </div>
              <div>
                <IconButton sx={{ padding: '5px' }}>
                  <PlayCircleFilledIcon sx={{ fontSize: 35 }} />
                </IconButton>
              </div>
              {/* </Box> */}
            </ListItem>
          );
        })}
      </List>
      <div id="games-container">
        {games.map((game) => {
          return (
            <div key={game.id} className="game" style={eleStyle}>
              <div style={titleDiv}>
                <h3 style={gameTitleStyle} className="game-name">
                  {game.name}
                </h3>
                {game.active === null && (
                  <IconButton
                    onClick={() => navEdit(game.id)}
                    aria-label="Edit Button"
                    sx={{ padding: '6px' }}
                  >
                    <PlayCircleFilledIcon sx={{ fontSize: 40 }} />
                  </IconButton>
                )}
              </div>
              {game.thumbnail !== null && (
                <Thumbnail
                  alt="Game Thumbnail"
                  src={game.thumbnail}
                ></Thumbnail>
              )}
              <p style={textStyle}>Questions: {game.number}</p>
              <p>Total game time: {game.totalTime} seconds</p>
              <div style={buttonDiv}>
                {game.active === null && (
                  <Button
                    variant="contained"
                    aria-label="start game button"
                    className="start-button"
                    onClick={() => startGame(game.id)}
                  >
                    Start
                  </Button>
                )}
                {game.active === null && (
                  <Button
                    variant="contained"
                    aria-label="delete game button"
                    className="delete-button"
                    color="error"
                    onClick={() => deleteGame(game.id)}
                  >
                    Delete{' '}
                  </Button>
                )}
                {game.active !== null && (
                  <Button
                    variant="contained"
                    aria-label="advance game button"
                    onClick={() => advanceGame(game.id)}
                  >
                    Advance
                  </Button>
                )}
                {game.active !== null && (
                  <Button
                    variant="contained"
                    aria-label="stop game button"
                    className="stop-button"
                    color="error"
                    onClick={() => stopGame(game.id)}
                  >
                    Stop Game
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </GroupDiv>
  );
};

export default GameFeed;
GameFeed.propTypes = {
  click: PropTypes.bool,
};
