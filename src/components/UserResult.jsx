import DieColours from "../DieColours";
import DiceResult from "./DiceResult";

const UserResult = ({ user }) => {
  // cpu has already separated rerolls from its results
  // So combine rerolls and results array
  const results = [...user.rerollIDs, ...user.results].sort(
    (a, b) => a.value - b.value,
  );
  const colour = DieColours.find((colour) => user.colour === colour.hex);

  return (
    <div className="gameplay-result">
      <h2>{user.name}'s hand</h2>
      <div className="gameplay-result__elements">
        <p className="lead">
          {user.hand} ({user.score})
        </p>
        <DiceResult results={results} colour={colour} handleClick={null} />
      </div>
    </div>
  );
};

export default UserResult;
