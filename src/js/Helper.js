export const randomize = (max) => {
  const random = crypto.getRandomValues(new Uint32Array(1))[0] / 4294967295;
  return Math.floor(random * max) + 1;
};

export const arraySum = (array) => {
  return array.reduce((acc, value) => acc + value);
};

export const diceRolling = (libObj, user, colour, number = 5) => {
  return new Promise((resolve) => {
    libObj
      .roll({ qty: number, sides: "pip", themeColor: colour })
      .then((results) => {
        resolve(user.getResults(results));
      });
  });
};

export const diceAdding = (libObj, user, colour, number = 5) => {
  return new Promise((resolve) => {
    libObj
      .add({ qty: number, sides: "pip", themeColor: colour })
      .then((results) => {
        resolve(user.getResults(results));
      });
  });
};

export const diceRerolling = (libObj, user, dieObject) => {
  return new Promise((resolve) => {
    libObj.reroll(dieObject, { remove: true }).then((results) => {
      resolve(user.getResults(results, dieObject));
    });
  });
};

export const whoGoesFirst = async (libObj, playerColour, cpuColour) => {
  const playerRoll = new Promise((resolve) => {
    libObj
      .roll({ qty: 1, sides: "pip", themeColor: playerColour.hex })
      .then((results) => {
        resolve(results);
      });
  });
  const cpuRoll = new Promise((resolve) => {
    libObj
      .add({ qty: 1, sides: "pip", themeColor: cpuColour.hex })
      .then((results) => {
        resolve(results);
      });
  });

  return Promise.all([playerRoll, cpuRoll]).then(async (results) => {
    const rolls = results.flat();
    // rolls[0] will always be a player
    // For a tie, needs to run the function again
    if (rolls[0].value === rolls[1].value) {
      return new Promise((resolve) => {
        resolve(whoGoesFirst(libObj, playerColour, cpuColour));
      });
    }

    return [
      {
        name: "player",
        colour: playerColour,
        firstRoll: rolls[0].value,
        score: 0,
      },
      { name: "cpu", colour: cpuColour, firstRoll: rolls[1].value, score: 0 },
    ].sort((a, b) => b.firstRoll - a.firstRoll);
  });
};
