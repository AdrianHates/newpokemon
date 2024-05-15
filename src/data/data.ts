import { Element, Personaje, Plant, Superficie } from "./types";

export interface mapaProps {
  superficie: Superficie;
  plant?: Plant | null;
  be?: Personaje | Element | null;
}

export default function crearSeed() {
  const mapa: mapaProps[][] = [];
  for (let i = 0; i < 20; i++) {
    const fila = [];
    for (let j = 0; j < 13; j++) {
      const sobre_superficie =
        Math.random() < 0.5
          ? hierva
          : null;

      fila.push({
        superficie: pasto,
        plant: sobre_superficie,
      });
    }
    mapa.push(fila);
  }
  mapa[0][10]= {
    be: null,
    plant: null,
    superficie: pasto
  }
 
  mapa[0][9] = {
    superficie: salto_inicio,
    plant: null
  }
  mapa[1][9] = {
    superficie: salto_continue,
    plant: null
  }
  mapa[2][9] =  {
    superficie: salto_fin,
    plant: null
  }
  mapa[3][9] = {
    superficie: pasto,
    be: rock
  }


  return mapa;
}

export const host = "https://backendpokemon.onrender.com";

export function transformXP(xp: number) {
  if (xp === 0) return 1;
  const raizCubica = Math.cbrt(xp);
  return raizCubica;
}

export function probability(probability: number) {
  
  const resultProb = Math.random() < probability
  return resultProb
}

export const listPokemon = [1, 4, 7, 50, 10, 20, 30, 40, 44, 48];


export const pasto = new Superficie("pasto", 0, "yes");
export const tierra = new Superficie("tierra", 0, "yes");
export const salto_inicio = new Superficie("salto_inicio", 1, "no");
export const salto_continue = new Superficie("salto_continue", 1, "jump");
export const salto_fin = new Superficie("salto_fin", 1, "no");

export const Bruno = new Personaje("bruno", 99, "no")
export const rock = new Element("rock", 1, "no");
export const hierva = new Plant("hierva", 1);
