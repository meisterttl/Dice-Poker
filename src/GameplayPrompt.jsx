import { useState, useEffect } from "react";
import Dice from "./Dice";
import GameplayResult from "./GameplayResult";
import DieFace from "./components/DieFace";
import DieColours from "./DieColours";
import Loader from "./components/Loader";
import * as Helper from "./js/Helper";

const GameplayIntro = ({ users, setUserStats, setIsDiceRolling, setRound }) => {
  const handlePlayerColour = async (e) => {
    setIsDiceRolling(true);

    const playerColour = DieColours.find(
      (colour) => e.currentTarget.dataset.colour === colour.hex,
    );
    const leftOverColours = DieColours.filter(
      (colour) => playerColour !== colour,
    );
    const randomIndex = Helper.randomize(leftOverColours.length) - 1;
    const cpuColour = leftOverColours[randomIndex];

    users.player.updateColour(playerColour.hex);
    users.cpu.updateColour(cpuColour.hex);

    const result = await Helper.whoGoesFirst(Dice, playerColour, cpuColour);

    setIsDiceRolling(false);
    setUserStats(result);
    setRound(0);
  };

  return (
    <div className="gameplay-intro">
      <h2>Choose your colour!</h2>
      <div className="gameplay-intro__elements">
        {DieColours.map((colour, index) => (
          <DieFace
            key={index}
            colour={colour}
            onPlayerBehaviour={handlePlayerColour}
            props={{ groupId: 0, rollId: 0, value: 6 }}
          />
        ))}
      </div>
      <p className="lead">Then let's find out who goes first!</p>
    </div>
  );
};

const GameplayTurnOrder = ({ userStats, handleFirstRoll }) => {
  const message =
    "player" === userStats[0].name ? "You go first!" : "Computer goes first!";
  const element =
    "player" === userStats[0].name ? (
      <button id="roll" onClick={handleFirstRoll}>
        Roll!
      </button>
    ) : (
      <Loader />
    );

  return (
    <>
      <p className="lead">{message}</p>
      <div className="gameplay-extra">{element}</div>
    </>
  );
};

const GameplayMain = ({
  users,
  userStats,
  isDiceRolling,
  setIsDiceRolling,
  round,
  setRound,
  playerSkipped,
  setPlayerSkipped,
  handleFirstRoll,
  handleReplay,
  mainPhase,
}) => {
  return (
    <div className="gameplay-main">
      {0 === round && (
        <GameplayTurnOrder
          userStats={userStats}
          handleFirstRoll={handleFirstRoll}
          playerSkipped={playerSkipped}
        />
      )}
      {3 !== round && playerSkipped && (
        <>
          <p className="lead">Computer is thinking...</p>
          <Loader />
        </>
      )}
      {((1 <= round && !playerSkipped) || 3 === round) && (
        <GameplayResult
          users={users}
          userStats={userStats}
          isDiceRolling={isDiceRolling}
          setIsDiceRolling={setIsDiceRolling}
          round={round}
          setRound={setRound}
          setPlayerSkipped={setPlayerSkipped}
          mainPhase={mainPhase}
          handleReplay={handleReplay}
        />
      )}
    </div>
  );
};

const GameplayPrompt = ({ users, isDiceRolling, setIsDiceRolling }) => {
  const [userStats, setUserStats] = useState([
    { name: users.player, colour: null, firstRoll: null, score: null },
    { name: users.cpu, colour: null, firstRoll: null, score: null },
  ]);
  const [playerSkipped, setPlayerSkipped] = useState(false);
  const [round, setRound] = useState(-1);

  const handleFirstRoll = () => {
    setIsDiceRolling(true);
    setRound(1);
  };

  const handleReplay = () => {
    setIsDiceRolling(false);
    setPlayerSkipped(false);
    setUserStats([
      { name: users.player, colour: null, firstRoll: null, score: null },
      { name: users.cpu, colour: null, firstRoll: null, score: null },
    ]);
    setRound(-1);

    for (const turn of userStats) {
      users[turn.name].reset();
    }
  };

  const mainPhase = async (currentRound) => {
    const newStats = structuredClone(userStats);

    if (1 === currentRound) {
      for (const turn of newStats) {
        const currentUser = users[turn.name];
        const result = await Helper.diceRolling(
          Dice,
          currentUser,
          currentUser.colour,
        );
        turn.score = result.score;
      }
    } else {
      for (const [i, turn] of newStats.entries()) {
        const currentUser = users[turn.name];

        if (0 !== currentUser.reroll) {
          const rerollIDs = currentUser.getRerollIDs();

          if (0 === rerollIDs.length) continue;

          const result = await new Promise((resolve) => {
            setTimeout(() => {
              Dice.clear();
              resolve(
                Helper.diceRolling(
                  Dice,
                  currentUser,
                  currentUser.colour,
                  rerollIDs.length,
                ),
              );
            }, i * 500);
          });
          turn.score = result.score;
        }
      }
    }

    setUserStats(newStats);

    if (playerSkipped) {
      if (0 === users["cpu"].reroll) {
        setRound(3);
      } else {
        let nextRound = round + 1;

        if (3 === round) nextRound = 3;

        setRound(nextRound);
      }
      setIsDiceRolling(true);
    } else {
      setIsDiceRolling(false);
    }
  };

  useEffect(() => {
    // Computer logic if it goes first or the player skips their turn
    if (0 === round) {
      setIsDiceRolling(false);

      // TODO: Add betting logic

      if ("cpu" === userStats[0].name)
        setTimeout(() => {
          handleFirstRoll();
        }, 1000);
    } else if (1 === round) {
      mainPhase(round);
    } else if (2 === round) {
      if (playerSkipped) {
        setIsDiceRolling(false);

        setTimeout(() => {
          setIsDiceRolling(true);
          mainPhase(round);
        }, 1000);
      }
    } else if (3 === round) {
      if (playerSkipped)
        setTimeout(async () => {
          await mainPhase(round);
          setIsDiceRolling(false);
        }, 500);
    }
  }, [round]);

  return (
    !isDiceRolling && (
      <div className="gameplay">
        {-1 === round ? (
          <GameplayIntro
            users={users}
            setUserStats={setUserStats}
            setIsDiceRolling={setIsDiceRolling}
            setRound={setRound}
          />
        ) : (
          <GameplayMain
            users={users}
            userStats={userStats}
            isDiceRolling={isDiceRolling}
            setIsDiceRolling={setIsDiceRolling}
            round={round}
            setRound={setRound}
            playerSkipped={playerSkipped}
            setPlayerSkipped={setPlayerSkipped}
            handleFirstRoll={handleFirstRoll}
            handleReplay={handleReplay}
            mainPhase={mainPhase}
          />
        )}
      </div>
    )
  );
};

export default GameplayPrompt;
