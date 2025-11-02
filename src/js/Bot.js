import Game from "./Game.js";

class Bot extends Game {
  constructor(name) {
    super(name);
    this.difficulty = "Normal";
  }

  getResults(rawArray, rerollArray = null) {
    const results = super.getResults(rawArray);
    // if (0 !== this.results.length) this.reroll--;
    this.processRerolls(results);

    return results;
  }

  processRerolls(results) {
    super.resetRerolls();
    const rollLength = [];
    for (const value in results.data) {
      rollLength.push(results.data[value].length);
    }
    const highest = Math.max(...rollLength);
    // Basic level of finding rerolls, will implement more complex ones later (like Monte Carlo tree search)
    switch (highest) {
      case 5: // Five of a kind
        this.reroll = 0;
        break;
      case 4: // Four of a kind
        this.rerollIDs.push(...results.data[rollLength.indexOf(1)]);
        break;
      case 3: // Three of a kind or full house
        var rerollIDArray = rollLength.map((roll, index) =>
          1 === roll ? results.data[index][0] : null
        );
        // Check if it's full house
        if (0 === rerollIDArray.length) {
          this.reroll = 0;
        } else {
          this.rerollIDs.push(
            ...rerollIDArray.filter((array) => null !== array)
          );
        }
        break;
      case 2: // One pair or Two pair
        // Check if it's one pair or not
        if (rollLength.indexOf(2) === rollLength.lastIndexOf(2)) {
          this.rerollIDs.push(
            ...rollLength
              .map((roll, index) =>
                1 === roll ? results.data[index][0] : null
              )
              .filter((array) => null !== array)
          );
        } else {
          this.rerollIDs.push(...results.data[rollLength.indexOf(1)]);
        }
        break;
      case 1: // Straight or bust
        // Check if it's straight
        if (0 === results.data[1].length || 0 === results.data[6].length) {
          this.reroll = 0;
          break;
        }
      // fall through
      default:
        console.log(results, results.raw);
        console.log("------------------------");
        this.rerollIDs.push(...results.raw); // easy mode?
        break;
    }

    // With current library, considering how reroll works, I need to remove reroll dice from this.results
    if (0 !== this.rerollIDs.length) {
      this.results = this.results
        .map((roll) => {
          return this.rerollIDs.find(
            (reroll) =>
              roll.groupId == reroll.groupId && roll.rollId == reroll.rollId
          )
            ? null
            : roll;
        })
        .filter((roll) => null !== roll);
      // console.dir("cpu Kept", this.results);
    }
  }
}

export default Bot;
