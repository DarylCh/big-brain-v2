'use client';
import { useRef, useMemo } from 'react';
import { Box, IconButton, Typography } from '@mui/material';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import Image from 'next/image';
import EditIcon from '@mui/icons-material/Edit';
import BackButton from '@/app/components/BackButton';
import { AdminGetQuizResponse, apiClient } from '@/app/lib/apiClient';
import { primaryColor } from '@/app/lib/colors';

interface Props {
  quiz: AdminGetQuizResponse | null;
  quizId: string;
  token: string;
  onMutated: () => void;
  onEditOpen: () => void;
}

export default function QuizDetailCard({
  quiz,
  quizId,
  token,
  onMutated,
  onEditOpen,
}: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isValidThumbnail = useMemo(
    () =>
      /^data:image\/(png|jpe?g|gif|webp|svg\+xml);base64,[A-Za-z0-9+/]+=*$/.test(
        quiz?.thumbnail ?? ''
      ),
    [quiz?.thumbnail]
  );

  const uploadThumbnail = async (file: File) => {
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target?.result as string;
      await apiClient.updateQuiz(token, quizId, { thumbnail: base64 });
      onMutated();
    };
    reader.readAsDataURL(file);
  };

  const totalQuestions = quiz?.questions.length ?? 0;
  const totalTime = useMemo(
    () => quiz?.questions.reduce((sum, q) => sum + q.timeNeeded, 0) ?? 0,
    [quiz?.questions]
  );

  return (
    <>
      <BackButton sx={{ marginTop: '20px', marginLeft: '20px' }} href="/home" />
      <Box
        style={{
          padding: '30px',
          display: 'flex',
          gap: '2px',
          flexDirection: 'column',
        }}
      >
        <Box
          style={{
            display: 'flex',
            flexDirection: 'row',
            gap: '20px',
            alignItems: 'center',
          }}
        >
          <Box
            sx={{
              height: '200px',
              width: '200px',
              flexShrink: 0,
              position: 'relative',
            }}
          >
            <Box
              onClick={() => fileInputRef.current?.click()}
              sx={{
                height: '200px',
                width: '200px',
                backgroundColor: '#3f3f3f',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                '&:hover .upload-overlay': { opacity: 1 },
              }}
            >
              {isValidThumbnail ? (
                <Image
                  src={quiz!.thumbnail!}
                  alt="Quiz thumbnail"
                  fill
                  unoptimized
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <PhotoCameraIcon sx={{ color: '#888', fontSize: 36 }} />
              )}
              <Box
                className="upload-overlay"
                sx={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.45)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
              >
                <PhotoCameraIcon sx={{ color: '#fff', fontSize: 36 }} />
              </Box>
            </Box>
          </Box>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadThumbnail(file);
              e.target.value = '';
            }}
          />
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              height: '200px',
              pt: 1,
              pb: 1,
            }}
          >
            <Typography variant="body2">Quiz Details</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Typography variant="h4" color={primaryColor}>
                {quiz?.name}
              </Typography>
              <IconButton
                size="small"
                onClick={onEditOpen}
                sx={{ color: primaryColor }}
              >
                <EditIcon fontSize="small" />
              </IconButton>
            </Box>
            <Typography
              variant="body2"
              color={quiz?.description ? 'text.primary' : 'text.disabled'}
              sx={{ flexGrow: 1, overflow: 'auto', marginTop: '4px' }}
            >
              {quiz?.description ?? 'No description provided'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`Quiz by Daryl · ${totalQuestions > 0 ? totalQuestions : 'No'} questions`}
              {totalQuestions > 0 && <> · {totalTime}s total</>}
            </Typography>
          </Box>
        </Box>
      </Box>
    </>
  );
}
