import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

type ConfirmDialogVariant = 'delete' | 'advance' | 'start' | 'stop';

const config: Record<
  ConfirmDialogVariant,
  {
    title: string;
    description: string;
    confirmLabel: string;
    confirmColor: 'error' | 'warning' | 'success';
  }
> = {
  delete: {
    title: 'Delete Game',
    description:
      'Are you sure you want to delete this game? This action cannot be undone.',
    confirmLabel: 'Delete',
    confirmColor: 'error',
  },
  advance: {
    title: 'Advance Question',
    description: 'Are you sure you want to advance to the next question?',
    confirmLabel: 'Advance',
    confirmColor: 'warning',
  },
  start: {
    title: 'Start Game',
    description:
      'Are you sure you want to start this game? Players will be able to join once the session begins.',
    confirmLabel: 'Start',
    confirmColor: 'success',
  },
  stop: {
    title: 'Stop Game',
    description:
      'Are you sure you want to stop this game? Players will no longer be able to continue this session.',
    confirmLabel: 'Stop',
    confirmColor: 'warning',
  },
};

export const ConfirmDialog = ({
  open,
  setOpen,
  variant,
  onConfirm,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  variant: ConfirmDialogVariant;
  onConfirm: () => void;
}) => {
  const { title, description, confirmLabel, confirmColor } = config[variant];

  return (
    <Dialog
      open={open}
      style={{ width: '400px', margin: '0 auto' }}
      onClose={() => setOpen(false)}
    >
      <DialogTitle
        sx={{
          backgroundColor: '#FF5003',
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        {title}
      </DialogTitle>
      <DialogContent sx={{ marginTop: '16px' }}>
        <Typography variant="body1">{description}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setOpen(false)}>Cancel</Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={() => {
            onConfirm();
            setOpen(false);
          }}
        >
          {confirmLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmDialog;
