import { ListItem, ListItemAvatar, Avatar, Typography } from '@mui/material';
import ImageIcon from '@mui/icons-material/Image';

type QuizCardProps = {
  heading: string;
  subText?: string;
  onClick?: () => void;
};

const QuizCard = ({ heading, subText, onClick }: QuizCardProps) => {
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
          <Avatar>
            <ImageIcon />
          </Avatar>
        </ListItemAvatar>
        <div>
          <Typography variant="h6">{heading}</Typography>
          {subText && (
            <Typography variant="body2" color="textSecondary">
              {subText}
            </Typography>
          )}
        </div>
      </div>
    </ListItem>
  );
};

export default QuizCard;
