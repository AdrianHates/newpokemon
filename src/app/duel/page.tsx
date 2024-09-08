import { useContext, useEffect, useState } from "react";
import cx from "../../lib/cx";
import DivText from "../../components/shared/div-text";
import PlatformDuel from "../../components/shared/platform-duel";
import { PokemonDataContext } from "../../context/PokemonDataProvider";
import { listPokemon, probability } from "../../data/data";
import useTypingEffect from "../../hooks/useTypingEffect";
import BarPokemon from "./bar-pokemon";
import SelectOption from "../../components/shared/select-option";
import { motion } from "framer-motion";
import "./styles.css";
import { useNavigate } from "react-router-dom";
import { Pokemon } from "../../data/types";
import { UserDataContext } from "../../context/UserDataProvider";

interface Props {
  randomNumber: number | null;
}
const Duel = ({ randomNumber }: Props) => {
  const { userData } = useContext(UserDataContext);
  const [textDuel, setTextDuel] = useState("");
  const [sequence, setSequence] = useState("inicio");
  const [selectOpt, setSelectOpt] = useState(0);
  const [selectOptFight, setSelectOptFight] = useState(0);
  const { displayText, finishedTyping } = useTypingEffect(textDuel, 20);
  const pokemonsUser = userData.pokemons.filter((x: { location: { place: string; }; })=> x.location.place === "team")
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pokemonData = useContext<any>(PokemonDataContext);
  const initialEnemy = new Pokemon(
    listPokemon[randomNumber ?? 0] - 1,
    pokemonData[listPokemon[randomNumber ?? 0]]?.stats?.[0].base_stat,
    2000
  );
  const [pokemonEnemy] = useState<Pokemon>(initialEnemy);
  const navigate = useNavigate();

  useEffect(() => {
    if (sequence === "inicio") {
      if (pokemonData && randomNumber !== null && !finishedTyping) {
        setTextDuel(
          "Wild " +
            pokemonData?.[listPokemon[randomNumber] - 1]?.name.toUpperCase() +
            " appeared!"
        );
        setSequence("invocar");
      }
    }
    if (sequence === "invocar" && finishedTyping) {
      setTimeout(() => {
        setTextDuel("Go! PIKACHU!");
        setSequence("effect");
      }, 500);
    }
    if (sequence === "effect" && finishedTyping) {
      setTimeout(() => {
        if (probability(0.2)) {
          setTextDuel("PIKACHU ha paralizado a su oponente");
          pokemonEnemy.setStatus("paralyzed");
        } else {
          setTextDuel(" ");
        }

        setSequence("trans-options");
      }, 500);
    }
    if (sequence === "trans-options" && finishedTyping) {
      setTimeout(() => {
        setTextDuel(" ");
        setSequence("options");
      }, 500);
    }
    if (sequence === "receive-attack") {
      setTimeout(() => {
        if (pokemonEnemy.status === "paralyzed") {
          setTextDuel("Pokemon enemigo se encuentra paralizado");
          setSequence("trans-options");
        } else {
          if (pokemonEnemy.stats.current_hp <= 0) {
            setTextDuel("Pokemon enemigo se ha debilitado");
            setSequence("give-experience");
          } else {
            setTextDuel("Pokemon enemigo ataca");
            setSequence("trans-options");
          }
        }
      }, 500);
    }
    if (sequence === "give-experience") {
      setTimeout(() => {
        setTextDuel("Has ganado 500 xp");
        setSequence("finish-duel");
      }, 1000);
    }
    if (sequence === "finish-duel") {
      setTimeout(() => {
        navigate("/world");
      }, 1250);
    }
  }, [pokemonData, finishedTyping]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLocaleLowerCase() === "a") {
        if (sequence === "options" && selectOpt === 0) {
          setSequence("fight");
        }
        if (sequence === "options" && selectOpt === 1) {
          navigate("/world");
        }
        if (sequence === "fight" && selectOptFight === 0) {
          setSequence("attack");
          setTextDuel("PIKACHU a lanzado un impactrueno");
          pokemonEnemy.takeDamage(5);
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [sequence, selectOpt, selectOptFight, navigate]);

  console.log(pokemonsUser);
  return (
    <div className="relative w-full h-full">
      <div className={cx("duel-bg-green")}>
        {/*pokemon enemy*/}
        <PlatformDuel className="top-1/4 right-0 absolute">
          {listPokemon &&
            randomNumber != null &&
            listPokemon[randomNumber] != null && (
              <img
                alt="pokemon-enemy"
                src={
                  pokemonData[pokemonEnemy.pokemon_number]?.sprites?.versions?.[
                    "generation-iii"
                  ]?.emerald?.["front_default"]
                }
                className={cx(
                  "w-[100px] bottom-0 translate-y-[-25%] left-1/2 absolute translate-x-[-50%]"
                )}
                style={{
                  transition: "filter 0.3s",
                  filter:
                    sequence === "attack" ? "brightness(0) invert(1)" : "",
                }}
              />
            )}

          <BarPokemon
            gender_rate={
              pokemonData?.[pokemonEnemy.pokemon_number]?.gender_rate
            }
            statePokemonEnemy={pokemonEnemy?.status}
            name={pokemonData?.[
              pokemonEnemy.pokemon_number
            ]?.name.toUpperCase()}
            lvl={pokemonEnemy.level}
            className={"absolute bottom-[125%] right-[125%]"}
            max_hp={pokemonEnemy.stats.max_hp}
            current_hp={pokemonEnemy.stats.current_hp}
          />
        </PlatformDuel>
        {/*pokemon user */}
        <PlatformDuel className="top-1/2 translate-y-[50%] left-0 absolute">
          <img
            alt="pokemon-main"
            src={
              pokemonData[pokemonsUser[0].pokemon_number - 1]?.sprites?.versions?.["generation-iii"]?.[
                "ruby-sapphire"
              ]?.["back_default"]
            }
            className={cx(
              "w-[100px] bottom-0 translate-y-[-25%] left-1/2 absolute translate-x-[-50%]"
            )}
          />
          <BarPokemon
            gender_rate={
              pokemonData?.[pokemonEnemy.pokemon_number]?.gender_rate
            }
            statePokemonEnemy={pokemonEnemy?.status}
            name={pokemonData?.[
              pokemonsUser[0]?.pokemon_number - 1
            ]?.name.toUpperCase()}
            lvl={pokemonsUser[0].level}
            className={"absolute bottom-[50%] right-[-75%]"}
            max_hp={pokemonsUser[0]?.stats?.max_hp}
            current_hp={pokemonsUser[0]?.stats?.current_hp}
          />
        </PlatformDuel>

        {sequence === "attack" && (
          <div className="container">
            <motion.div
              className="lightning right-[17.5%] absolute top-[-20%]"
              animate={{
                translateY: [0, 20, 0],
                opacity: [1, 0],
              }}
              transition={{
                duration: 0.2,
                ease: "linear",
              }}
              onAnimationComplete={() => {
                setSequence("receive-attack");
              }}
            />
          </div>
        )}

        <DivText className="bottom-0 absolute w-full">
          {sequence !== "options" && sequence !== "fight" && displayText}
          {sequence === "options" && (
            <>
              What will PIKACHU do?
              <SelectOption
                selectOpt={selectOpt}
                setSelectOpt={setSelectOpt}
                options={["FIGHT", "RUN"]}
                className="w-[50%] absolute right-0 top-[1px] p-3.5 border-8 rounded-[16px]"
              />
            </>
          )}
          {sequence === "fight" && (
            <SelectOption
              selectOpt={selectOptFight}
              setSelectOpt={setSelectOptFight}
              options={["IMPACTRUENO", "-"]}
              className="w-full absolute right-0 top-0 p-4 border-[7px] rounded-[8px] text-3xl font-mono"
            />
          )}
        </DivText>
      </div>
    </div>
  );
};
export default Duel;
