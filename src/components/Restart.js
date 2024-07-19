function Restart({ dispatch }) {
  return (
    <button
      className="btn btn-ui"
      onClick={() =>
        dispatch({ type: "restartQuiz", payload: { points: 0, status: "ready" } })
      }
    >
      Restart Quiz
    </button>
  );
}

export default Restart;
