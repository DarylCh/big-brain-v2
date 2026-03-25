'use client';
import { useState } from 'react';
import { styled } from '@mui/material/styles';
import GameFeed from '@/app/components/GameFeed';
import ErrorPopup from '@/app/components/ErrorPopup';
import CreateGame from './CreateGame';

export const GroupDiv = styled('div')`
  background-color: #fff;
  width: 90%;
  max-width: 700px;
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

  // This function tracks if the CreateGame has been clicked
  // to refresh the GameFeed data
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
      <CreateGame
        activatePopup={() => activatePopup()}
        activateClicked={() => changeClicked()}
        changed={changed}
        setChanged={setChanged}
        setDesc={setDesc}
      />
      <GroupDiv>
        <GameFeed click={isClicked} />
      </GroupDiv>
    </>
  );
};

export default Dashboard;
