'use client';
import { useState } from 'react';
import {
  Box,
  Collapse,
  FormControl,
  IconButton,
  Pagination,
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
import DeleteIcon from '@mui/icons-material/Delete';
import FullButton from '@/app/components/FullButton';
import QuestionOptionsList from '../../_components/QuestionOptionsList';
import { Question } from '@/app/lib/types';

export default function QuestionsTable({
  questions,
  onAddQuestion,
  onDeleteQuestion,
  disabled,
}: {
  questions: Question[];
  onAddQuestion: () => void;
  onDeleteQuestion: (index: number) => void;
  disabled?: boolean;
}) {
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [page, setPage] = useState(1);
  const PAGE_SIZE = 5;
  const pageCount = Math.ceil(questions.length / PAGE_SIZE);
  const paginated = questions.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const ROW_HEIGHT = 53;
  const minBodyHeight = PAGE_SIZE * ROW_HEIGHT;

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
              <TableCell align="right" style={{ width: '80px' }}>
                <Typography variant="body1" fontWeight="bold">
                  Duration
                </Typography>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{ minHeight: minBodyHeight, display: 'table-row-group' }}
          >
            {paginated.map((q, pageIndex) => {
              const index = (page - 1) * PAGE_SIZE + pageIndex;
              return (
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
                      sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}
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
                  <TableCell
                    align="right"
                    sx={{ verticalAlign: 'top', whiteSpace: 'nowrap' }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'flex-end',
                        gap: 0.5,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {q.timeNeeded}s
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteQuestion(index);
                        }}
                        sx={{
                          color: '#aaa',
                          '&:hover': { color: 'error.main' },
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
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
            justifyContent: 'space-between',
            padding: '16px',
            gap: '32px',
          }}
        >
          <FullButton
            variant="contained"
            style={{ margin: '0 30px' }}
            onClick={onAddQuestion}
            disabled={disabled}
          >
            <Typography variant="body2">
              {questions.length > 0 ? 'Add another' : 'Add a question'}
            </Typography>
          </FullButton>
          {pageCount > 1 && (
            <Pagination
              count={pageCount}
              page={page}
              onChange={(_, v) => {
                setPage(v);
                setExpandedRows(new Set());
              }}
              sx={{ mr: 2 }}
            />
          )}
        </div>
      </FormControl>
    </TableContainer>
  );
}
