import DiceBox from "@3d-dice/dice-box";

const Dice = new DiceBox({
  id: "dice-canvas",
  assetPath: "/Dice-Poker/assets/",
  friction: 1,
  restitution: 0.6,
  angularDamping: 0.6,
  linearDamping: 0.6,
  spinForce: 10,
  startingHeight: 3,
  settleTimeout: 10000,
  shadowTransparency: 0.9,
  theme: "default-extras",
  themeColor: "#ffffff",
  scale: 5,
});

export default Dice;
