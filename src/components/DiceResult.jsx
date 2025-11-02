import DieFace from "./DieFace";

const DiceResult = ({ results, colour, handleKeep }) => {
  return (
    <div className="gameplay-main__elements">
      {results
        .sort((a, b) => a.value - b.value)
        .map((result, index) => (
          <DieFace
            key={index}
            colour={colour}
            onPlayerBehaviour={handleKeep}
            props={result}
          />
        ))}
    </div>
  );
};

export default DiceResult;
