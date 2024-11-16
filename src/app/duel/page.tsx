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
import SelectOptionMultipleDirection from "../../components/shared/select-option-multiple-direction";
import OptionsFight from "./options-fight";

interface Props {
  randomNumber: number | null;
  sequence?: string;
}

const optionsDuel = [
  [
    { name: "fight", action: () => console.log("fight") },
    { name: "bag", action: () => console.log("bag") },
  ],
  [
    { name: "pokémon", action: () => console.log("pokémon") },
    { name: "run", action: () => console.log("run") },
  ],
];

const Duel = ({ randomNumber, sequence = "inicio" }: Props) => {
  const { userData, setUserData } = useContext(UserDataContext);
  const pokemonData = useContext(PokemonDataContext);
  const [textDuel, setTextDuel] = useState("");
  const [currentSequence, setCurrentSequence] = useState(sequence); // Usar `sequence` como valor inicial
  const [selectOpt, setSelectOpt] = useState({ row: 0, column: 0 });
  const [selectOptFight, setSelectOptFight] = useState(0);
  const { displayText, finishedTyping } = useTypingEffect(textDuel, 20);
  const pokemonsUser = userData?.pokemons?.filter(
    (x: { location: { place: string } }) => x.location.place === "team"
  );
  const [pokemonUserList, setPokemonUserList] = useState<Pokemon[]>([]);
  const NumberPokemonEnemy = listPokemon[randomNumber ?? 0];
  const NumberEnemyPokemonData = NumberPokemonEnemy - 1;
  const initialEnemy = new Pokemon(
    NumberPokemonEnemy,
    pokemonData?.[NumberEnemyPokemonData]?.stats?.[0].base_stat,
    2000
  );

  const [pokemonEnemy] = useState<Pokemon>(initialEnemy);
  const navigate = useNavigate();

  const updateUserDataWithPokemonList = () => {
    const updatedPokemons = userData.pokemons.map(
      (pokemon: { pokemon_id: number | undefined }) => {
        const updatedPokemon = pokemonUserList.find(
          (p) => p.pokemon_id === pokemon.pokemon_id
        );

        if (updatedPokemon) {
          return {
            ...pokemon, // Mantiene el resto de los datos
            hp: updatedPokemon.stats.current_hp,
            lvl: updatedPokemon.level,
            xp: updatedPokemon.xp,
            status: updatedPokemon.status,
          };
        }

        return pokemon; // Si no se encuentra en la lista actualizada, lo dejamos como está
      }
    );

    const updatedUserData = {
      ...userData,
      pokemons: updatedPokemons,
    };

    setUserData(updatedUserData);
  };

  useEffect(() => {
    if (currentSequence === "inicio") {
      if (pokemonData && randomNumber !== null && !finishedTyping) {
        setTextDuel(
          "Wild " +
            pokemonData?.[listPokemon[randomNumber] - 1]?.name.toUpperCase() +
            " appeared!"
        );
        setCurrentSequence("invocar");
      }
    }
    if (currentSequence === "invocar" && finishedTyping) {
      setTimeout(() => {
        setTextDuel("Go! PIKACHU!");
        setCurrentSequence("effect");
      }, 500);
    }
    if (currentSequence === "effect" && finishedTyping) {
      setTimeout(() => {
        if (probability(0.2)) {
          setTextDuel("PIKACHU ha paralizado a su oponente");
          pokemonEnemy.setStatus("paralyzed");
        } else {
          setTextDuel(" ");
        }

        setCurrentSequence("trans-options");
      }, 500);
    }
    if (currentSequence === "trans-options" && finishedTyping) {
      setTimeout(() => {
        setTextDuel(" ");
        setCurrentSequence("options");
      }, 500);
    }
    if (currentSequence === "receive-attack") {
      setTimeout(() => {
        if (pokemonEnemy.status === "paralyzed") {
          setTextDuel("Pokemon enemigo se encuentra paralizado");
          setCurrentSequence("trans-options");
        } else {
          if (pokemonEnemy.stats.current_hp <= 0) {
            setTextDuel("Pokemon enemigo se ha debilitado");
            setCurrentSequence("give-experience");
          } else {
            setTextDuel("Pokemon enemigo ataca");
            setCurrentSequence("trans-options");
          }
        }
      }, 500);
    }
    if (currentSequence === "give-experience") {
      setTimeout(() => {
        const experienceGained = Math.ceil(
          (pokemonData?.[pokemonEnemy.pokemon_number - 1]?.base_experience *
            pokemonEnemy?.level *
            1) /
            7
        );
        setTextDuel(`Has ganado ${experienceGained}`);
        if (!finishedTyping) {
          const updatedPokemonUserList = [...pokemonUserList];
          const pokemon = updatedPokemonUserList[0];
          if (pokemon) {
            pokemon.addXP(experienceGained);
          }
          setPokemonUserList(updatedPokemonUserList);
        }

        setCurrentSequence("finish-duel");
      }, 1000);
    }
    if (currentSequence === "finish-duel") {
      if (!finishedTyping) {
        updateUserDataWithPokemonList();
      }
      setTimeout(() => {
        navigate("/world");
      }, 1250);
    }
  }, [pokemonData, finishedTyping]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLocaleLowerCase() === "z") {
        if (
          currentSequence === "options" &&
          optionsDuel[selectOpt.row][selectOpt.column]?.name === "fight"
        ) {
          setCurrentSequence("fight");
        }
        if (
          currentSequence === "options" &&
          optionsDuel[selectOpt.row][selectOpt.column]?.name === "run"
        ) {
          navigate("/world");
        }
        if (
          currentSequence === "options" &&
          optionsDuel[selectOpt.row][selectOpt.column]?.name === "bag"
        ) {
          navigate("/bag", { state: { someProp: "duel" } });
        }
        if (
          currentSequence === "options" &&
          optionsDuel[selectOpt.row][selectOpt.column]?.name === "pokémon"
        ) {
          navigate("/pokemon");
        }

        if (currentSequence === "fight" && selectOptFight === 0) {
          setCurrentSequence("attack");
          setTextDuel("PIKACHU a lanzado un impactrueno");
          pokemonEnemy.takeDamage(10);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentSequence, selectOpt, selectOptFight, navigate]);

  useEffect(() => {
    const mappedPokemons = pokemonsUser?.map(
      (filteredPokemon: any, i: number) => {
        const newPokemon = new Pokemon(
          filteredPokemon.pokemon_number,
          pokemonData?.[
            filteredPokemon?.pokemon_number - 1
          ]?.stats[0].base_stat,
          filteredPokemon.xp,
          filteredPokemon.pokemon_id
        );

        if (filteredPokemon.ivs) {
          newPokemon.updateIVs({
            hp: filteredPokemon.ivs.hp,
            attack: filteredPokemon.ivs.attack,
            defense: filteredPokemon.ivs.defense,
            specialAttack: filteredPokemon.ivs.specialAttack,
            specialDefense: filteredPokemon.ivs.specialDefense,
            speed: filteredPokemon.ivs.speed,
          });
        }

        newPokemon.updateLocation({ place: "team", position: i });
        newPokemon.updateCurrentHP(filteredPokemon.hp);
        return newPokemon;
      }
    );
    setPokemonUserList(mappedPokemons);
  }, []);

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
                  pokemonData[NumberEnemyPokemonData]?.sprites?.versions?.[
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
            gender_rate={pokemonData?.[NumberEnemyPokemonData]?.gender_rate}
            statePokemon={pokemonEnemy?.status}
            name={pokemonData?.[NumberEnemyPokemonData]?.name.toUpperCase()}
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
              pokemonData[pokemonsUser?.[0].pokemon_number - 1]?.sprites
                ?.versions?.["generation-iii"]?.["ruby-sapphire"]?.[
                "back_default"
              ]
            }
            className={cx(
              "w-[100px] bottom-0 translate-y-[-25%] left-1/2 absolute translate-x-[-50%]"
            )}
          />
          <BarPokemon
            gender_rate={
              pokemonData?.[pokemonUserList?.[0]?.pokemon_number - 1]
                ?.gender_rate
            }
            statePokemon={pokemonUserList?.[0]?.status}
            name={pokemonData?.[
              pokemonUserList?.[0]?.pokemon_number - 1
            ]?.name.toUpperCase()}
            lvl={pokemonUserList?.[0]?.level}
            className={"absolute bottom-[50%] right-[-75%]"}
            max_hp={pokemonUserList?.[0]?.stats?.max_hp}
            current_hp={pokemonUserList?.[0]?.stats?.current_hp}
            show_values={true}
          />
        </PlatformDuel>

        {currentSequence === "attack" && (
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
                setCurrentSequence("receive-attack");
              }}
            />
          </div>
        )}

        <DivText className="bottom-0 absolute w-full">
          {currentSequence !== "options" && currentSequence !== "fight" && displayText}
          {currentSequence === "options" && (
            <>
              What will PIKACHU do?
              <SelectOptionMultipleDirection
                selectOpt={selectOpt}
                setSelectOpt={setSelectOpt}
                options={optionsDuel?.map((fileOpts) =>
                  fileOpts?.map((opt) => opt?.name)
                )}
                className="w-[50%] absolute right-0 top-[1px] p-3.5 border-8 rounded-[16px]"
              />
            </>
          )}
          {currentSequence === "fight" && (
            <OptionsFight />
          )}
        </DivText>
      </div>
    </div>
  );
};
export default Duel;
