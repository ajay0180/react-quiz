import { act, useEffect, useReducer } from "react";
import Headers from "./Header";
import Main from "./main";
import Loader from "./Loader";
import Error from "./Error";
import StartScreen from "./startScreen";
import Question from "./Question";
import NextButton from "./NextButton";
import Progress from "./Progress";
import FinishScreen from "./FinishScreen";
import Restart from "./Restart";

const initialState = {
  questions: [],
  // 'loading' , 'ready' , 'error' , 'active' , 'finished'
  status: "loading",
  index: 0,
  answer: null,
  points: 0,
  highScore: 0,
};

function reducer(state, action) {
  switch (action.type) {
    case "dataReceived":
      return { ...state, questions: action.payload, status: "ready" };
    case "dataFailed":
      return { ...state, status: "error" };
    case "startQuiz":
      return { ...state, status: "active" };
    case "newAnswer":
      const question = state.questions.at(state.index);
      return {
        ...state,
        answer: action.payload,
        points:
          action.payload === question.correctOption
            ? state.points + question.points
            : state.points,
      };
    case "nextQuestion":
      return { ...state, index: state.index + 1, answer: null };
    case "finishQuiz":
      return {
        ...state,
        status: "finished",
        highScore:
          state.points > state.highScore ? state.points : state.highScore,
      };
    case "restartQuiz":
      return {
        ...state,
        points: action.payload.points,
        status: action.payload.status,
        index: 0,
        answer: null,
      };
    default:
      throw new Error("Action is unknown");
  }
}

export default function App() {
  const [{ questions, status, index, answer, points, highScore }, dispatch] =
    useReducer(reducer, initialState);
  const numQuestions = questions.length;
  const totalPoints = questions.reduce((acc, curr) => {
    return acc + curr.points;
  }, 0);

  useEffect(function () {
    fetch("http://localhost:9000/questions")
      .then((res) => res.json())
      .then((data) => dispatch({ type: "dataReceived", payload: data }))
      .catch((err) => dispatch({ type: "dataFailed" }));
  }, []);

  return (
    <div className="app">
      <Headers />
      <Main>
        {status === "loading" && <Loader />}
        {status === "error" && <Error />}
        {status === "ready" && (
          <StartScreen numQuestions={numQuestions} dispatch={dispatch} />
        )}
        {status === "active" && (
          <>
            <Progress
              index={index}
              numQuestions={numQuestions}
              points={points}
              totalPoints={totalPoints}
              answer={answer}
            />
            <Question
              question={questions[index]}
              dispatch={dispatch}
              answer={answer}
            />
            <NextButton
              dispatch={dispatch}
              answer={answer}
              index={index}
              numQuestions={numQuestions}
            />
          </>
        )}
        {status === "finished" && (
          <>
            <FinishScreen
              points={points}
              totalPoints={totalPoints}
              highScore={highScore}
            />
            <Restart dispatch={dispatch} />
          </>
        )}
      </Main>
    </div>
  );
}
