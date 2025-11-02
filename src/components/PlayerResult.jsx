import { useState } from "react";
import DieColours from "../DieColours";
import DiceResult from "./DiceResult";

const PlayerResult = ({
  setIsDiceRolling,
  round,
  setRound,
  user,
  setPlayerSkipped,
  mainPhase,
  handleReplay,
  whoWon,
}) => {
  const [keeps, setKeeps] = useState(user.results);
  const [rerolls, setRerolls] = useState([]);
  const [warning, setWarning] = useState(false);

  const colour = DieColours.find((colour) => user.colour === colour.hex);

  const handleKeep = (e) => {
    const die = e.currentTarget;
    const rollId = parseInt(die.dataset.rollid);

    const rerollExists = rerolls.find((reroll) => rollId === reroll.rollId);
    const newRerolls = !rerollExists
      ? [
          ...rerolls,
          {
            groupId: parseInt(die.dataset.groupid),
            rollId: rollId,
            value: parseInt(die.dataset.value),
          },
        ]
      : rerolls.filter((reroll) => rollId !== reroll.rollId);

    const keepExists = keeps.find((keep) => rollId === keep.rollId);
    const newKeeps = keepExists
      ? keeps.filter((keep) => rollId !== keep.rollId)
      : [
          ...keeps,
          {
            groupId: parseInt(die.dataset.groupid),
            rollId: rollId,
            value: parseInt(die.dataset.value),
          },
        ];

    setRerolls(newRerolls);
    setKeeps(newKeeps);
    if (warning) setWarning(false);
  };

  const handleReroll = () => {
    if (0 !== rerolls.length) {
      user.addRerollIDs(rerolls);

      setIsDiceRolling(true);
      mainPhase(advanceRound());
    } else {
      setWarning(true);
    }
  };

  const handleHappyHand = () => {
    user.reroll = 0;

    setPlayerSkipped(true);
    setIsDiceRolling(true);
    advanceRound();
  };

  const advanceRound = () => {
    const nextRound = round + 1;
    setRound(nextRound);

    return nextRound;
  };

  return (
    <div className="gameplay-result">
      <h2>{user.name}'s hand</h2>
      <div className="gameplay-result__elements">
        <p className="lead">
          {user.hand} ({user.score})
        </p>
        {warning ? (
          <p className="warning">Are you keeping your hand?</p>
        ) : (
          (0 !== user.reroll || 0 !== keeps.length) && (
            <p>Choose which dice to keep!</p>
          )
        )}
        {0 !== keeps.length && (
          <DiceResult
            results={keeps}
            colour={colour}
            handleKeep={0 !== user.reroll ? handleKeep : null}
          />
        )}
      </div>
      <div className="gameplay-result__elements">
        {0 !== rerolls.length && <p>You're rerolling these!</p>}
        {0 !== rerolls.length && (
          <DiceResult
            results={rerolls}
            colour={colour}
            handleKeep={0 !== user.reroll ? handleKeep : null}
          />
        )}
      </div>
      {0 !== user.reroll && (
        <div className="gameplay-extra">
          <button id="reroll" onClick={handleReroll}>
            Reroll
          </button>
          <button id="keep" onClick={handleHappyHand}>
            I'm happy with my hand!
          </button>
        </div>
      )}
      {whoWon && (
        <>
          <p className="lead">{whoWon}</p>
          <div className="gameplay-extra">
            <button id="replay" onClick={handleReplay}>
              Play Again!
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default PlayerResult;
