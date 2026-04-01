'use client';
import { Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import CircleIconButton from '@/app/components/CircleIconButton';
import { primaryColor, primaryHoverColor } from '@/app/lib/colors';

interface Props {
  isActive: boolean;
  onStartSession: () => void;
  onEndSession: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export default function QuizActionsBar({
  isActive,
  onStartSession,
  onEndSession,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: '16px 20px',
        alignItems: 'center',
      }}
    >
      <div>
        <Button
          variant="contained"
          startIcon={isActive ? <StopIcon /> : <PlayArrowIcon />}
          onClick={() => (isActive ? onEndSession() : onStartSession())}
          sx={{
            backgroundColor: primaryColor,
            '&:hover': {
              backgroundColor: primaryHoverColor,
            },
            marginLeft: '12px',
          }}
        >
          {isActive ? 'End Session' : 'Start Session'}
        </Button>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '10px',
          alignItems: 'center',
        }}
      >
        <CircleIconButton onClick={onEdit}>
          <EditIcon />
        </CircleIconButton>
        <CircleIconButton onClick={onDelete}>
          <DeleteIcon />
        </CircleIconButton>
      </div>
    </div>
  );
}
