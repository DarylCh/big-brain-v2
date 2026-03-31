import { Question } from "@/app/lib/types";

export const sampleQuestions: Question[] = [
  {
    question: 'What is the capital of France?',
    options: ['Berlin', 'Madrid', 'Paris', 'Rome'],
    Correct: [2],
    timeNeeded: 20,
  },
  {
    question: 'Which of these are prime numbers?',
    options: ['4', '7', '11', '9'],
    Correct: [1, 2],
    timeNeeded: 30,
  },
  {
    question: 'What does HTML stand for?',
    options: [
      'Hyper Text Markup Language',
      'High Tech Modern Language',
      'Hyper Transfer Markup Language',
      'Home Tool Markup Language',
    ],
    Correct: [0],
    timeNeeded: 15,
  },
];