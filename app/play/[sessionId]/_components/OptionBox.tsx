import { ReactNode } from 'react';
import { Box, SxProps, Theme, Typography } from '@mui/material';

export const OptionBox = ({
  children,
  onClick,
  sx,
}: {
  children?: ReactNode;
  onClick?: () => void;
  isCorrect?: boolean;
  sx?: SxProps<Theme>;
}) => {
  return (
    <Box
      onClick={onClick}
      sx={{
        display: 'flex',
        minHeight: '70px',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexDirection: 'row',
        color: 'white',
        borderRadius: '8px',
        padding: '16px',
        margin: '8px 0',
        width: '100%',
        cursor: 'pointer',
        ...sx,
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
        {children ?? 'Option Text'}
      </Typography>
    </Box>
  );
};
