import { Question } from "./types";


/*
 For a given data structure of a question, produce another
 object that doesn't contain any important meta data (e.g. the answer)
 to return to a "player"
*/
export const quizQuestionPublicReturn = (question: Question) => {
  console.log('See question: ', question);
  const newQuestion = JSON.parse(JSON.stringify(question));
  delete newQuestion.Correct;
  return newQuestion;
};

/*
 For a given data structure of a question, get the IDs of
 the correct answers (minimum 1).
*/
export const quizQuestionGetCorrectAnswers = (question: Question) => {
  return question.Correct; // For a single answer
};

/*
 For a given data structure of a question, get the IDs of
 all of the answers, correct or incorrect.
*/
export const quizQuestionGetAnswers = (question: Question) => {
  const optionLength = question.options.length;
  const allAnswers = [];
  let i = 0;
  while (i < optionLength) {
    allAnswers.push(i);
    i++;
  }
  return allAnswers; // For a single answer
};

/*
 For a given data structure of a question, get the duration
 of the question once it starts. (Seconds)
*/
export const quizQuestionGetDuration = (question: Question) => {
  return question.timeNeeded;
};
