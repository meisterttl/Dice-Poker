import * as Helper from "./Helper";

class Game {
  constructor(name) {
    this.name = name;
    this.colour = "#ffffff";
    this.results = [];
    this.rolls = {};
    this.hand = null;
    this.score = 0;
    this.reroll = 2;
    this.rerollIDs = [];
  }

  reset() {
    this.colour = "#ffffff";
    this.results.length = 0;
    this.rolls = {};
    this.hand = null;
    this.score = 0;
    this.reroll = 2;
    this.rerollIDs.length = 0;
  }

  updateColour(hexColour) {
    this.colour = hexColour;

    return this.colour;
  }

  // Completely arbitrary score guide
  // Bust = sum of 5 dice value
  // One Pair = (Pair)(Highest)(Middle)(Lowest) <- 4 digits
  // Two Pairs = (High)(Low)00(Remainder) <- 5 digits
  // T.O.K. = (Three)000(High)(Low) <- 6 digits
  // F.H.S = 700000
  // S.H.S = 800000
  // Full House = 9(High)(Low)000 <- 6 digits
  // 4.O.K = 1(Remainder)00000 <- 7 digits
  // 5.O.K = 6000000 ~ 11000000

  checkHandRanking(rollObject) {
    const ranks = [];
    for (const roll in rollObject) {
      if ("0" === roll) continue;
      switch (rollObject[roll].length) {
        case 1:
          ranks.push(parseInt(roll));
          break;
        case 2:
          ranks.push(`One Pair, ${roll}s`);
          this.score = 1000 * parseInt(roll);
          break;
        case 3:
          ranks.push(`Three of a Kind, ${roll}s`);
          this.score = 100000 * parseInt(roll);
          break;
        case 4:
          ranks.push(`Four of a Kind, ${roll}s`);
          this.score = 1000000 + parseInt(roll) * 100000;
          break;
        case 5:
          ranks.push(`Five of a Kind, ${roll}s`);
          this.score = 5000000 + parseInt(roll) * 1000000;
          break;
        default:
          break;
      }
    }

    const unpaired = ranks.filter((hand) => "number" === typeof hand);
    this.hand =
      5 === unpaired.length // returning all numbers could be bust or straight
        ? (() => {
            switch (JSON.stringify(unpaired)) {
              case "[1,2,3,4,5]":
                this.score = 700000;
                return "Five High Straight, [1, 2, 3, 4, 5]";
              case "[2,3,4,5,6]":
                this.score = 800000;
                return "Six High Straight, [2, 3, 4, 5, 6]";
              default:
                this.score = Helper.arraySum(unpaired);
                return "Bust";
            }
          })()
        : ranks
            .filter((hand) => "number" !== typeof hand)
            .map((hand, i, array) => {
              return 1 === array.length // Two pair/Full House is not possible if there's only 1 string in the array
                ? (() => {
                    // Calculating score
                    switch (true) {
                      case 1000 <= this.score && 6000 >= this.score: // One Pair
                        this.score +=
                          100 * parseInt(unpaired[2]) +
                          10 * parseInt(unpaired[1]) +
                          parseInt(unpaired[0]);
                        break;
                      case 100000 <= this.score && 600000 >= this.score: // Three of a Kind
                        this.score +=
                          10 * parseInt(unpaired[1]) + parseInt(unpaired[0]);
                        break;
                      case 1000000 <= this.score && 5000000 >= this.score: // Four of a Kind
                        this.score += 100000 * parseInt(unpaired[0]);
                        break;
                      default:
                        break;
                    }

                    return hand;
                  })()
                : (() => {
                    const first = array[0].split(", ");
                    const second = array[1].split(", ");

                    if (0 === i) {
                      return first[i] === second[i]
                        ? "Two Pairs"
                        : "Full House";
                    } else {
                      const number1 = parseInt(first[i].charAt(0));
                      const number2 = parseInt(second[i].charAt(0));
                      // Two pair logic
                      if (first[0].length === second[0].length) {
                        this.score =
                          10000 * Math.max(number1, number2) +
                          1000 * Math.min(number1, number2) +
                          parseInt(unpaired[0]);
                        return `${Math.max(number1, number2)} over ${Math.min(number1, number2)}`;
                      } else {
                        this.score = 900000;
                        this.score +=
                          first[0].length > second[0].length
                            ? 10000 * number1 + 1000 * number2
                            : 10000 * number2 + 1000 * number1;
                        return first[0].length > second[0].length // full house logic
                          ? `${number1} over ${number2}`
                          : `${number2} over ${number1}`;
                      }
                    }
                  })();
            })
            .join(", ");

    return this.hand;
  }

  getResults(rawArray, rerollArray = null) {
    if (0 === this.reroll) return false; // no more rerolls
    // Reroll check
    if (0 !== this.results.length) {
      const rerollData = null !== rerollArray ? rerollArray : this.rerollIDs;
      this.reroll--;
      // console.dir(this.name, "Rerolls", this.rerollIDs);
      this.results = this.results
        .map((roll) => {
          return 0 ===
            rerollData.filter((reroll) => roll.rollId == reroll.rollId).length
            ? {
                groupId: roll.groupId,
                rollId: parseInt(roll.rollId) + 10, // To avoid getting the same roll id
                value: roll.value,
              }
            : null;
        })
        .filter((roll) => null !== roll);
    }

    this.results.push(
      ...rawArray.map((item) => {
        // Reconstruct the array so it only has groupId, rollId (required for reroll) and value
        return {
          groupId: item.groupId,
          rollId: item.rollId,
          value: item.value,
        };
      })
    );
    // console.dir(this.name, this.results, this.rerollIDs);
    return this.processDiceRolls(
      this.results.sort((a, b) => a.value - b.value)
    );
  }

  processDiceRolls(newArray) {
    Object.assign(
      this.rolls,
      Array.from([0, 1, 2, 3, 4, 5, 6], (value) => {
        return newArray // Object with key being die roll value and having array of rollIds
          .map((each) => {
            return each.value === value
              ? {
                  groupId: each.groupId,
                  rollId: each.rollId,
                  value: each.value,
                }
              : null;
          })
          .filter((array) => null !== array);
      })
    );

    return {
      rank: this.checkHandRanking(this.rolls),
      score: this.score,
      data: this.rolls,
      colour: this.colour,
      raw: this.results,
      reroll: this.reroll,
    };
  }

  resetRerolls() {
    this.rerollIDs.length = 0;
  }

  addRerollIDs(array) {
    this.resetRerolls();
    this.rerollIDs.push(...array);
  }

  getRerollIDs() {
    return this.rerollIDs;
  }
}

export default Game;
