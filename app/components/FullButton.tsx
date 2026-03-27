import { Button, ButtonProps } from '@mui/material';

const buttonStyles = {
  width: '100%',
};

// This component is a button that is used
// by other components
const FullButton = ({ style, children, ...props }: ButtonProps) => {
  return (
    <Button
      variant="contained"
      style={{ ...buttonStyles, ...style }}
      {...props}
    >
      {children}
    </Button>
  );
};

export default FullButton;
