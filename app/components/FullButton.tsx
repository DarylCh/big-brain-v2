import { Button } from '@mui/material';

const buttonStyles = {
  marginTop: '10px',
  width: '100%',
};

// This component is a button that is used
// by other components
const FullButton = ({
  id,
  text,
  onClick,
  aria,
}: {
  id: string;
  text: string;
  onClick: () => void;
  aria: string;
}) => {
  return (
    <Button
      id={id}
      style={buttonStyles}
      variant="contained"
      onClick={onClick}
      aria-label={aria}
    >
      {text}
    </Button>
  );
};

export default FullButton;
