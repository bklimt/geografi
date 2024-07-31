'use client';

import _ from "underscore";
import styles from "./page.module.css";
import { useState } from "react";
import { CITIES, STATES } from "./cities";

class Answer {
  constructor(
    public city: string,
    public correct: boolean,
  ) { }
}

class Question {
  constructor(
    public state: string,
    public answers: Answer[],
  ) { }
}

function generateQuestions(n: number): Question[] {
  let states = _.sample(STATES, n);
  return _.map(states, state => {
    let capital = _.find(state.cities, city => city.isCapital);
    if (_.isUndefined(capital)) {
      throw new Error(`${state.name} has no capital`);
    }

    let cities = _.without(_.sample(CITIES, 4), capital.name);
    let wrongAnswers = cities.map(city => new Answer(city, false));
    let rightAnswer = new Answer(capital.name, true);
    let answers = _.shuffle(wrongAnswers.concat(rightAnswer));

    return new Question(state.name, answers);
  });
}

type AnswerTileAttributes = {
  question: Question,
  answer: Answer,
  checked: boolean,
  finished: boolean,
  onChange: (correct: boolean) => void
};

function AnswerTile({ question, answer, checked, finished, onChange }: AnswerTileAttributes) {
  let mark = "";
  if (finished) {
    if (answer.correct) {
      mark = "✅";
    } else if (checked) {
      mark = "🚫";
    }
  }
  return (
    <>
      <input type="radio"
        className={styles.answer}
        name={question.state}
        id={answer.city}
        value={answer.city}
        checked={checked}
        disabled={finished}
        onChange={() => onChange(answer.correct)}
      />
      &nbsp;
      <label htmlFor={answer.city}>{answer.city}</label>
      &nbsp;
      {mark}
      <br />
    </>
  );
}

type QuestionTileAttributes = {
  question: Question,
  index: number,
  finished: boolean,
  onChange: (correct: boolean) => void,
};

function QuestionTile({ question, index, finished, onChange }: QuestionTileAttributes) {
  const [selected, setSelected] = useState(-1);

  let answers = _.map(question.answers, (answer, i) => {
    return (
      <AnswerTile
        key={answer.city}
        question={question}
        answer={answer}
        checked={i === selected}
        finished={finished}
        onChange={correct => {
          setSelected(i);
          onChange(correct);
        }}
      />)
  });

  return (
    <div className={styles.question}>
      <h2> {index + 1}. What is the capital of {question.state}? </h2>
      <div className={styles.answers}> {answers} </div>
    </div>
  )
}

type Response = boolean | null;

function generateResponseArray(n: number): Response[] {
  return _.times(n, i => null);
}

function withSet(array: Response[], i: number, value: Response): Response[] {
  return _.map(array, (existing, j) => {
    if (i === j) {
      return value;
    } else {
      return existing;
    }
  });
}

type SubmitTileAttributes = {
  responses: Response[],
  onClick: () => void,
};

function SubmitTile({ responses, onClick }: SubmitTileAttributes) {
  let canSubmit = _.filter(responses, _.isNull).length === 0;
  return (
    <>
      <button onClick={onClick} disabled={!canSubmit}>Submit</button>
    </>
  );
}

type QuizAttributes = {
  questions: Question[],
  finished: boolean,
  onSubmit: (score: number) => void
};

function Quiz({ questions, finished, onSubmit }: QuizAttributes) {
  let [responses, setResponses] = useState(_.partial(generateResponseArray, questions.length));

  let questionTiles = _.map(questions, (question, i) => {
    return (
      <QuestionTile
        key={question.state}
        question={question}
        index={i}
        finished={finished}
        onChange={correct => setResponses(withSet(responses, i, correct))}
      />
    );
  });

  let points: number[] = _.map(responses, response => (response ? 1 : 0));
  let score = _.reduce(points, (x, y) => x + y, 0);

  return (
    <>
      {questionTiles}
      <SubmitTile responses={responses} onClick={() => onSubmit(score)} />
    </>
  )
}

type StartButtonAttributes = {
  onClick: () => void,
};

function StartButton({ onClick }: StartButtonAttributes) {
  return <button onClick={onClick}>Start</button>
}

type ScoreTileAttributes = {
  score: number;
};

function ScoreTile({ score }: ScoreTileAttributes) {
  const descriptions = [
    "really bad",
    "pretty dang bad",
    "very not good",
    "bad",
    "kinda awful",
    "okay, i guess",
    "better than it could've been",
    "above average",
    "pretty good",
    "really good",
    "great"
  ];
  return (
    <div className={styles.score}>
      You got {score} correct! That&apos;s {descriptions[score]}!
    </div>
  );
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [score, setScore] = useState(0);
  const [finished, setFinished] = useState(false);

  let startQuiz = () => {
    setQuestions(generateQuestions(10));
  };

  let submitQuiz = (score: number) => {
    setScore(score);
    setFinished(true);
    document.scrollingElement?.scrollTo(0, 0);
  };

  let content;
  if (questions.length !== 0) {
    content = (
      <>
        {finished && <ScoreTile score={score} />}
        <Quiz questions={questions} finished={finished} onSubmit={submitQuiz} />
      </>
    );
  } else {
    content = <StartButton onClick={startQuiz} />;
  }
  return (
    <main className={styles.main}>
      <div className={styles.header}>
        <h1>Geografi</h1>
        <p>The geography quiz for nerds.</p>
      </div>
      {content}
    </main>
  );

}
