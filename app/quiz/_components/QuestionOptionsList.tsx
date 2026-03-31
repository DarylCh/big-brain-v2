import { Box, List, ListItem, ListItemText } from '@mui/material';
import CheckIcon from '@mui/icons-material/Check';
import { Question } from '@/app/lib/types';
import { primaryColor } from '@/app/lib/colors';

export default function QuestionOptionsList({
  question,
}: {
  question: Question;
}) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', gap: 1.5, mt: 0.5 }}>
      <Box
        sx={{
          width: '3px',
          margin: '8px 0',
          marginLeft: '14px',
          borderRadius: 1,
          backgroundColor: `${primaryColor}`,
          flexShrink: 0,
        }}
      />
      <List dense disablePadding sx={{ flex: 1 }}>
        {question.options.map((option, i) => (
          <ListItem key={i} disableGutters>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <ListItemText
                primary={`${'ABCD'[i]}) ${option}`}
                slotProps={{ primary: { variant: 'body2' } }}
              />
              {question.Correct.includes(i) && (
                <CheckIcon fontSize="small" color="success" />
              )}
            </Box>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
