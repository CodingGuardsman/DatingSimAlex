/**
 * alex.js — Protagonist (player character)
 */
import Character from "./Character.js";

export class Alex extends Character {
  constructor() {
    super({
      id: "alex",
      name: "Alex",
      age: 19,
      major: "Undeclared",
      personality: "Awkward, socially inexperienced, kind-hearted",
      bio: "A nervous but well-meaning university student navigating campus life for the first time.",
      romanceable: false,
      expressions: ["neutral", "blush", "determined", "tired"],
      defaultExpression: "neutral",
      color: "#4fc3f7"
    });
  }
}

export default Alex;
