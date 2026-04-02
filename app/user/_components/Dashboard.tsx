'use client';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import { Box, Button, CircularProgress, Typography } from '@mui/material';
import QuizFeed from '@/app/user/_components/QuizFeed';
import ErrorPopup from '@/app/components/ErrorPopup';
import { apiClient } from '@/app/lib/apiClient';
import { useUser } from '@/app/lib/UserContext';
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
  const { token, isInitialized } = useUser();
  const [isClicked, setisClicked] = useState(true);
  const [popup, setPopup] = useState(false);
  const [desc, setDesc] = useState('');
  const [resetLoading, setResetLoading] = useState(false);

  // This function allows the popup to be triggered
  const activatePopup = () => {
    setPopup(!popup);
  };

  // This function tracks if the CreateQuiz has been clicked
  // to refresh the QuizFeed data
  const changeClicked = () => {
    setisClicked(!isClicked);
  };

  const handleResetData = async () => {
    try {
      setResetLoading(true);
      await apiClient.deleteStore(token);
      setisClicked((c) => !c);
    } catch (err) {
      setDesc(err instanceof Error ? err.message : 'Failed to reset data');
      activatePopup();
    } finally {
      setResetLoading(false);
    }
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
        sx={{ paddingTop: '48px', marginBottom: '18px', textAlign: 'center' }}
      >
        Welcome Daryl
      </Typography>
      <Box
        sx={{
          margin: '0 auto',
          display: 'flex',
          flex: '1',
          flexDirection: 'row',
          alignItems: 'stretch',
          maxWidth: '750px',
          gap: '16px',
        }}
      >
        <CreateQuiz
          activatePopup={() => activatePopup()}
          activateClicked={() => changeClicked()}
          setDesc={setDesc}
        />
        <JoinQuiz
          activatePopup={() => activatePopup()}
          activateClicked={() => changeClicked()}
          setDesc={setDesc}
        />
      </Box>
      <QuizFeed click={isClicked} />
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2, mb: 4 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={() => void handleResetData()}
          disabled={resetLoading || !isInitialized}
          startIcon={
            resetLoading ? (
              <CircularProgress size={16} color="error" />
            ) : undefined
          }
        >
          Reset All Data
        </Button>
      </Box>
    </>
  );
};

export default Dashboard;
