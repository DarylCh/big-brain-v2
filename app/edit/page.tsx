import { useState, useEffect, useCallback } from 'react';
import { GroupDiv } from '../home/_components/Dashboard';
import { fetchGameInfo } from '../components/GameFeed';
import { TextField } from '@mui/material';
import FullButton from '../components/FullButton';
import Title from '../components/Title';
import ErrorPopup from '../components/ErrorPopup';
import { fileToDataUrl } from './components/file-converter';

const ThumbnailStyle = {
  marginTop: '12px',
  marginBottom: '20px',
};

const qStyle = {
  marginTop: '0',
  marginBottom: '5px',
  width: '100%',
};

// This component is used by the editGame page and
// allows one to edit the title and thumbnail of
// a game
const EditGameDetsPanel = ({
  quizId,
  token,
}: {
  quizId: string;
  token: string;
}) => {
  const [name, setName] = useState('');
  const [image, setImage] = useState('');
  const [questions, setQuestions] = useState([]);
  const [popup, setPopup] = useState(false);
  const [descTitle, setDescTitle] = useState('');
  const [desc, setDesc] = useState('');

  const getQuestion = useCallback(async (quizId: string, token: string) => {
    setQuestions([]);
    const gameInfo = await fetchGameInfo(quizId, token);
    setImage(gameInfo.thumbnail);
    setQuestions(gameInfo.questions);
  }, []);

  // This useEffect gathers the question details for the page
  useEffect(() => {
    // This function fetches the game details from the backend
    // and sets it to the states

    getQuestion(quizId, token);
  }, [getQuestion, quizId, token]);

  // This function allows the error popup to be activated
  const activatePopup = () => {
    setPopup(!popup);
  };

  // This function uploads the game detail changes to the
  // backend if the name and images uploaded are valid
  const updateData = async () => {
    if (name === '') {
      setDescTitle('Error!');
      setDesc('Please enter a title for your game.');
      activatePopup();
      return;
    }
    getQuestion(quizId, token);
    let imageProcessed = '';
    if (image !== null) {
      imageProcessed = await fileToDataUrl(image);
    }
    const req = await fetch(`http://localhost:5005/admin/quiz/${quizId}`, {
      method: 'PUT',
      headers: {
        'Content-type': 'application/json',
        Authorization: token,
      },
      body: JSON.stringify({
        questions: questions,
        name: name,
        thumbnail: imageProcessed,
      }),
    });
    if (req.ok) {
      setDescTitle('Success!');
      setDesc('Changes submitted');
      activatePopup();
    }
  };

  return (
    <GroupDiv>
      {popup && (
        <ErrorPopup title={descTitle} desc={desc} toggle={activatePopup} />
      )}
      <form aria-label="Edit game details">
        <Title>Edit game details</Title>
        <TextField
          style={qStyle}
          onChange={(e) => setName(e.target.value)}
          label="Game Title"
          variant="outlined"
          aria-label="Game title field"
        />
        <div style={ThumbnailStyle}>
          <label htmlFor="image">Upload Thumbnail:</label>
          <input
            id="image"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            aria-label="Thumbnail upload"
          />
        </div>
        <FullButton
          onClick={updateData}
          aria-label="Submit changes button"
          id={''}
        >
          Submit Changes
        </FullButton>
      </form>
    </GroupDiv>
  );
};

export default EditGameDetsPanel;
