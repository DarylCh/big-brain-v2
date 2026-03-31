'use client';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';
import GameFeed from '@/app/quiz/_components/QuizFeed';
import ErrorPopup from '@/app/components/ErrorPopup';
import CreateQuiz from './CreateQuiz';
import JoinQuiz from './JoinQuiz';

export const GroupDiv = styled('div')`
  background-color: #fff;
  width: 100%;
  max-width: 750px;
  margin: 20px auto 30px auto;
  padding: 23px;
  border-radius: 8px;
  box-shadow: 0px 2px 2px 2px #dedede;
`;

export const FormDiv = styled('div')`
  background-color: #fff;
  width: 90%;
  max-width: 700px;
  margin: 20px auto;
  padding: 23px;
  border-radius: 8px;
  box-shadow: 0px 2px 2px 2px #dedede;
`;

// This component is the Dashboard for the dashboard page
// This is where all of the games are shown
const Dashboard = () => {
  const [isClicked, setisClicked] = useState(true);
  const [popup, setPopup] = useState(false);
  const [desc, setDesc] = useState('');
  const [changed, setChanged] = useState(false);

  // This function allows the popup to be triggered
  const activatePopup = () => {
    console.log(desc);
    setPopup(!popup);
  };

  // This function tracks if the CreateQuiz has been clicked
  // to refresh the QuizFeed data
  const changeClicked = () => {
    setisClicked(!isClicked);
  };

  return (
    <>
      {popup && (
        <ErrorPopup
          title="Error"
          desc={desc}
          toggle={() => activatePopup()}
        ></ErrorPopup>
      )}
      <Typography
        variant="h4"
        sx={{ marginTop: '48px', marginBottom: '18px', textAlign: 'center' }}
      >
        Welcome Daryl
      </Typography>
      <Box
        sx={{
          margin: '0 auto',
          display: 'flex',
          flex: '1',
          flexDirection: 'row',
          alignItems: 'center',
          maxWidth: '750px',
          gap: '16px',
        }}
      >
        <JoinQuiz
          activatePopup={() => activatePopup()}
          activateClicked={() => changeClicked()}
          changed={changed}
          setChanged={setChanged}
          setDesc={setDesc}
        />
        <CreateQuiz
          activatePopup={() => activatePopup()}
          activateClicked={() => changeClicked()}
          changed={changed}
          setChanged={setChanged}
          setDesc={setDesc}
        />
      </Box>
      <GameFeed click={isClicked} />
    </>
  );
};

export default Dashboard;
