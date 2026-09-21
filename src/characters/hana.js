/**
 * hana.js — Hana, the quiet Visual Arts student
 */
import Character from "./Character.js";

export class Hana extends Character {
  constructor() {
    super({
      id: "hana",
      name: "Hana",
      age: 21,
      major: "Visual Arts",
      personality: "Quiet, creative, thoughtful, speaks softly",
      bio: "A talented artist who sees the world differently and prefers quiet corners to loud parties.",
      romanceable: true,
      expressions: ["neutral", "smile", "shy", "concentrating", "deep_in_thought"],
      defaultExpression: "neutral",
      color: "#52b4a9"
    });
  }
}

export default Hana;
