'use client';
import { useState } from 'react';
import {
  Box,
  Collapse,
  FormControl,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FullButton from '@/app/components/FullButton';
import QuestionOptionsList from '../../_components/QuestionOptionsList';
import { Question } from '@/app/lib/types';

export default function QuestionsTable({
  questions,
  onAddQuestion,
}: {
  questions: Question[];
  onAddQuestion: () => void;
}) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const toggleRow = (index: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      next.has(index) ? next.delete(index) : next.add(index);
      return next;
    });
  };

  return (
    <TableContainer component={Paper}>
      <FormControl style={{ width: '100%' }} aria-label="questions-table">
        <Table>
          <TableHead>
            <TableRow>
              <TableCell style={{ width: '12px' }}>
                <Typography variant="body1" fontWeight="bold">
                  #
                </Typography>
              </TableCell>
              <TableCell>
                <Typography variant="body1" fontWeight="bold">
                  Question
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {questions.length > 0 &&
              questions.map((q, index) => (
                <TableRow
                  key={index}
                  onClick={() => toggleRow(index)}
                  sx={{ cursor: 'pointer' }}
                >
                  <TableCell sx={{ verticalAlign: 'top' }}>
                    <Typography variant="body2" fontWeight="semiBold">
                      {index + 1}
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="body2" fontWeight="semiBold">
                        {q.question}
                      </Typography>
                      {expandedRows.has(index) ? (
                        <ExpandMoreIcon fontSize="small" />
                      ) : (
                        <ChevronRightIcon fontSize="small" />
                      )}
                    </Box>
                    <Collapse in={expandedRows.has(index)}>
                      <QuestionOptionsList question={q} />
                    </Collapse>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {questions.length === 0 && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              paddingTop: '24px',
              paddingBottom: '12px',
            }}
          >
            <Typography variant="body2" color="#888">
              Add some questions to your quiz to get started!
            </Typography>
          </Box>
        )}
        <div
          style={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            padding: '16px',
            gap: '32px',
          }}
        >
          <FullButton
            variant="contained"
            style={{ margin: '0 30px' }}
            onClick={onAddQuestion}
          >
            <Typography variant="body2">
              {questions.length > 0 ? 'Add another' : 'Add a question'}
            </Typography>
          </FullButton>
        </div>
      </FormControl>
    </TableContainer>
  );
}
