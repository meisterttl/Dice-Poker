import { useState, useEffect, useRef } from "react";
import "./App.css";
import "./styles/styles.css";
import Game from "./js/Game";
import Bot from "./js/Bot";
import Dice from "./Dice";
import GameplayPrompt from "./GameplayPrompt";
import Loader from "./components/Loader";

const player = new Game("player");
const cpu = new Bot("cpu");

const Canvas = ({ isDiceRolling }) => {
  useEffect(() => {
    document.querySelector("#canvas").append(Dice.canvas);
  }, []);

  return <div id="canvas" className={isDiceRolling ? "" : "background"}></div>;
};

const Gameplay = ({ gameStarted }) => {
  const [isDiceRolling, setIsDiceRolling] = useState(false);

  // Due to player/cpu classes, it's not ideal to declare as state variables
  // So user data and stats are separated
  const users = { player: player, cpu: cpu };

  return (
    <>
      <Canvas isDiceRolling={isDiceRolling} />

      {gameStarted && (
        <GameplayPrompt
          users={users}
          isDiceRolling={isDiceRolling}
          setIsDiceRolling={setIsDiceRolling}
        />
      )}
    </>
  );
};

const Menu = ({ handlePlay }) => {
  return (
    <div className="menu">
      <div className="menu-main">
        <h1>Dice Poker</h1>

        <div className="menu-main__elements">
          <button id="play" onClick={handlePlay}>
            Play
          </button>

          {/* <button
            id="instruction"
            onClick={() => {
              // TODO: Make instruction screen
              console.log("Coming soon!");
            }}
          >
            How to play
          </button> */}
        </div>
      </div>
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);
  const [gameStarted, setGameStarted] = useState(false);
  const initialized = useRef(false);
  const introTimeoutId = useRef(0);

  const handlePlay = () => {
    clearTimeout(introTimeoutId.current);
    Dice.clear();

    setGameStarted(true);
  };

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;

      setTimeout(() => {
        Dice.init().then((diceObj) => {
          const introResults = [];
          const introRolls = (libObj, resultArray, delay) => {
            // Just having some animation running in the background
            // To minimize clutter, 50 should be a good limit and then it clears the board
            if (50 < resultArray.length) {
              resultArray.length = 0;
              libObj.clear();
            }

            return setTimeout(() => {
              libObj.add({ qty: 1, sides: "pip" }).then((results) => {
                resultArray.push(...results);
                introTimeoutId.current = introRolls(libObj, resultArray, delay);
              });
            }, delay);
          };

          introTimeoutId.current = setTimeout(() => {
            Dice.roll({ qty: 25, sides: "pip" }).then((results) => {
              introResults.push(...results);
              introTimeoutId.current = introRolls(diceObj, results, 2000);
            });
          }, 0);

          setLoading(false);
        });
      }, 500); // Adding a little bit of delay so Dice canvas has enough time to load properly
    }
  }, []);

  return (
    <main>
      {loading ? <Loader /> : !gameStarted && <Menu handlePlay={handlePlay} />}

      <Gameplay gameStarted={gameStarted} />
    </main>
  );
}

export default App;
