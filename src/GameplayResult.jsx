import { useState, useEffect } from "react";
import UserResult from "./components/UserResult";
import PlayerResult from "./components/PlayerResult";

const GameplayResult = ({
  users,
  userStats,
  isDiceRolling,
  setIsDiceRolling,
  round,
  setRound,
  setPlayerSkipped,
  mainPhase,
  handleReplay,
}) => {
  const [whoWon, setWhoWon] = useState(null);
  const userTurns = structuredClone(userStats);
  // There's probably a better way to do this but this will make player's hand display at the bottom. Since userData contain each user's data according to their turn order, creating a new array will not disturb the turn order.
  const totalPlayer = userTurns.length;
  if ("player" === userStats[0].name) {
    const playerObj = userTurns.shift();
    userTurns.push(playerObj);
  }

  useEffect(() => {
    if (3 === round) {
      let message;
      userTurns.sort((a, b) => b.score - a.score);

      if (userTurns[0].score === userTurns[1].score) {
        message = "It's a tie!";
      } else {
        message =
          "player" === userTurns[0].name ? "You win! 😆" : "You lose! 🥲";
      }

      setWhoWon(message);
    }
  }, [round]);

  return (
    <>
      {userTurns.map((user, index) =>
        index !== totalPlayer - 1 ? (
          <UserResult key={index} user={users[user.name]} />
        ) : (
          <PlayerResult
            key={index}
            isDiceRolling={isDiceRolling}
            setIsDiceRolling={setIsDiceRolling}
            round={round}
            setRound={setRound}
            user={users[user.name]}
            setPlayerSkipped={setPlayerSkipped}
            mainPhase={mainPhase}
            handleReplay={handleReplay}
            whoWon={whoWon}
          />
        ),
      )}
    </>
  );
};

export default GameplayResult;
