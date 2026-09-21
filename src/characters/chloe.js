/**
 * chloe.js — Chloe, the outgoing Marketing student
 */
import Character from "./Character.js";

export class Chloe extends Character {
  constructor() {
    super({
      id: "chloe",
      name: "Chloe",
      age: 19,
      major: "Marketing",
      personality: "Outgoing, energetic, loves parties and social events",
      bio: "A social butterfly who knows everyone on campus and loves bringing people together.",
      romanceable: true,
      expressions: ["neutral", "excited", "laughing", "serious", "blush"],
      defaultExpression: "neutral",
      color: "#e94560"
    });
  }
}

export default Chloe;
