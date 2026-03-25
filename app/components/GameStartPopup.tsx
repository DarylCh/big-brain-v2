import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';

// This popup component is used to announce the starting
// and ending of a game session when called by the GameFeed component
export const GamePopup = ({
  title,
  desc,
  toggle,
  sessionId,
  isStart,
}: {
  title: string;
  desc: string;
  toggle: () => void;
  sessionId: string;
  isStart: boolean;
}) => {
  const [open, setOpen] = React.useState(true);
  const router = useRouter();
  const handleClose = () => {
    setOpen(false);
  };

  // This function creates a copied url for the user
  const copyToClipboard = (sessionId: string) => {
    const text = `http:/localhost:3000/play/game/${sessionId}`;
    navigator.clipboard.writeText(text);
  };

  // This function navigates to the admin results pages
  const gotoResults = (sessionId: string) => {
    router.push(`/edit/game/${sessionId}/results`);
  };

  return (
    <div id="game-dialogue">
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="game-popup"
        aria-describedby="provides the link to the stated game"
        aria-modal="true"
      >
        <DialogTitle id="alert-dialog-title">{title}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {desc}
            {isStart && sessionId}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          {isStart && (
            <Button
              id="copy-button"
              aria-label="Copy link button"
              onClick={() => copyToClipboard(sessionId)}
            >
              Copy Link
            </Button>
          )}
          {isStart && (
            <Button
              id="close-button"
              aria-label="Close button"
              onClick={toggle}
              autoFocus
            >
              Close
            </Button>
          )}
          {!isStart && (
            <Button
              id="yes-button"
              aria-label="Get game results button"
              onClick={() => gotoResults(sessionId)}
            >
              Yes
            </Button>
          )}
          {!isStart && (
            <Button
              id="no-button"
              aria-label="Return to dashboard button"
              onClick={toggle}
            >
              No
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </div>
  );
};

GamePopup.propTypes = {
  title: PropTypes.string,
  desc: PropTypes.string,
  toggle: PropTypes.func,
  sessionId: PropTypes.string,
  isStart: PropTypes.bool,
};
