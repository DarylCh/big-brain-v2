import { Box, SxProps, Theme } from '@mui/material';
import { ReactNode } from 'react';

const CircleIconButton = ({
  onClick,
  children,
  size = 36,
  iconSize = 20,
  sx,
}: {
  onClick?: () => void;
  children: ReactNode;
  size?: number;
  iconSize?: number;
  sx?: SxProps<Theme>;
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '50%',
        width: size,
        height: size,
        cursor: 'pointer',
        '&:hover': { backgroundColor: '#e0e0e0' },
        '& svg': { fontSize: iconSize },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
};

export default CircleIconButton;
