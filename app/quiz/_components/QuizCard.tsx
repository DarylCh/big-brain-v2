import {
  IconButton,
  ListItem,
  ListItemAvatar,
  Avatar,
  Typography,
} from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';
import PlayCircleFilledIcon from '@mui/icons-material/PlayCircleFilled';
import { QuizListItem } from '@/app/lib/apiClient';

const isValidThumbnail = (thumbnail: string | null) =>
  /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[A-Za-z0-9+/]+=*$/.test(
    thumbnail ?? ''
  );

type QuizCardProps = {
  quiz: QuizListItem;
  onClick: () => void;
};

const QuizCard = ({ quiz, onClick }: QuizCardProps) => {
  const hasThumbnail = isValidThumbnail(quiz.thumbnail);
  return (
    <ListItem
      sx={{
        padding: '0 20px',
        height: '80px',
        backgroundColor: '#fafafa',
        borderRadius: '12px',
        '&:hover': { backgroundColor: '#f0f0f0', cursor: 'pointer' },
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      onClick={onClick}
    >
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <ListItemAvatar>
          {hasThumbnail ? (
            <Avatar
              src={quiz.thumbnail!}
              variant="rounded"
              sx={{ width: 48, height: 48 }}
            />
          ) : (
            <Avatar sx={{ width: 48, height: 48 }}>
              <ImageIcon sx={{ fontSize: 28 }} />
            </Avatar>
          )}
        </ListItemAvatar>
        <div>
          <Typography variant="h6">{quiz.name}</Typography>
          <Typography variant="body2" color="textSecondary">
            {`Questions: ${quiz.numQuestions ?? 0}`}
          </Typography>
        </div>
      </div>
      <div>
        <IconButton sx={{ padding: '5px' }}>
          <PlayCircleFilledIcon sx={{ fontSize: 35 }} />
        </IconButton>
      </div>
    </ListItem>
  );
};

export default QuizCard;
