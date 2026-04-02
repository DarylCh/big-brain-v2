import { Button, ButtonProps, CircularProgress } from '@mui/material';

type FullButtonProps = ButtonProps & {
  loading?: boolean;
};

const buttonStyles = {
  width: '100%',
};

// This component is a button that is used
// by other components
const FullButton = ({
  style,
  children,
  loading,
  disabled,
  ...props
}: FullButtonProps) => {
  return (
    <Button
      variant="contained"
      style={{ ...buttonStyles, ...style }}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <CircularProgress size={22} sx={{ color: 'inherit' }} />
      ) : (
        children
      )}
    </Button>
  );
};

export default FullButton;
