import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  TextField,
} from '@mui/material';
import { useState } from 'react';
import { primaryColor } from '@/app/lib/colors';

interface Props {
  open: boolean;
  initialName: string;
  initialDescription: string;
  onClose: () => void;
  onSave: (name: string, description: string) => Promise<void>;
}

export default function EditQuizDetailsForm({
  open,
  initialName,
  initialDescription,
  onClose,
  onSave,
}: Props) {
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);

  // Sync fields when the dialog opens with new initial values
  const handleEntered = () => {
    setName(initialName);
    setDescription(initialDescription);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{ transition: { onEnter: handleEntered } }}
    >
      <DialogTitle
        sx={{
          backgroundColor: primaryColor,
          color: 'white',
          fontWeight: 'bold',
        }}
      >
        Edit Quiz Details
      </DialogTitle>
      <DialogContent>
        <FormControl fullWidth>
          <TextField
            label="Name"
            placeholder="Quiz name"
            fullWidth
            margin="dense"
            sx={{ margin: '24px 0 8px' }}
            value={name}
            onChange={(e) => setName(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 100 } }}
          />
          <TextField
            label="Description"
            placeholder="Describe your quiz"
            fullWidth
            multiline
            minRows={3}
            margin="dense"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            slotProps={{ htmlInput: { maxLength: 400 } }}
          />
        </FormControl>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          disabled={!name.trim()}
          onClick={() => void onSave(name.trim(), description)}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
}
