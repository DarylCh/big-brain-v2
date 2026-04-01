'use client';
import { IconButton, SxProps, Theme } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useRouter } from 'next/navigation';

export default function BackButton({
  href,
  sx,
}: {
  href: string;
  sx?: SxProps<Theme>;
}) {
  const router = useRouter();
  return (
    <IconButton
      size="small"
      onClick={() => router.push(href)}
      sx={{
        color: 'text.secondary',
        '&:hover': { color: 'text.primary' },
        ...sx,
      }}
    >
      <ArrowBackIcon fontSize="small" />
    </IconButton>
  );
}
