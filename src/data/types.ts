import { getRandomInt } from "./data";

export class Superficie {
  name: string;
  zIndex: number;
  available: string;

  constructor(name: string, zIndex: number, available: string) {
    this.name = name;
    this.zIndex = zIndex;
    this.available = available;
  }
}

export class Personaje {
  name: string;
  zIndex: number;
  available: string;

  constructor(name: string, zIndex: number, available: string) {
    this.name = name;
    this.zIndex = zIndex;
    this.available = available;
  }
}

export class Plant {
  name: string;
  zIndex: number;
  constructor(name: string, zIndex: number) {
    this.name = name;
    this.zIndex = zIndex;
  }
}

export class Element extends Personaje {
  constructor(name: string, zIndex: number, available: string) {
    super(name, zIndex, available);
  }
}

export type StatusCondition =
  | "none"
  | "paralyzed"
  | "poisoned"
  | "badly poisoned"
  | "burned"
  | "frozen"
  | "sleeping";

export class Pokemon {
  pokemon_id?: number;
  pokemon_number: number;
  level: number;
  baseHP: number;
  ivs: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  evs: {
    hp: number;
    attack: number;
    defense: number;
    specialAttack: number;
    specialDefense: number;
    speed: number;
  };
  stats: { max_hp: number; current_hp: number };
  status: StatusCondition;
  xp: number;

  constructor(
    pokemon_number: number,
    level: number,
    baseHP: number,
    xp: number,
    pokemon_id?: number,
  ) {
    this.pokemon_id = pokemon_id;
    this.pokemon_number = pokemon_number;
    this.level = level;
    this.baseHP = baseHP;
    this.ivs = {
      hp: getRandomInt(0, 32),
      attack: getRandomInt(0, 32),
      defense: getRandomInt(0, 32),
      specialAttack: getRandomInt(0, 32),
      specialDefense: getRandomInt(0, 32),
      speed: getRandomInt(0, 32),
    };
    this.evs = {
      hp: 0,
      attack: 0,
      defense: 0,
      specialAttack: 0,
      specialDefense: 0,
      speed: 0,
    };
    this.stats = this.calculateStats();
    this.status = "none";
    this.xp = xp
  }

  calculateStats() {
    const max_hp = this.calculateHP();
    const current_hp = max_hp;
    return { max_hp, current_hp };
  }
  calculateHP() {
    const baseHP = 50;
    const iv = this.ivs.hp;
    const ev = this.evs.hp;
    const level = this.level;
    return 10 + Math.floor((level / 100) * (baseHP * 2 + iv + ev));
  }

  takeDamage(damage: number) {
    this.stats.current_hp = Math.max(this.stats.current_hp - damage, 0); // Ensure HP does not go below 0
  }
  setStatus(newStatus: StatusCondition) {
    this.status = newStatus;
  }
}
