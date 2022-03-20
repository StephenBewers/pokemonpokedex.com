import React from "react";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalRow from "../Modal/ModalRow";
import PokemonEvolvesFrom from "./PokemonEvolvesFrom";
import PokemonEvolvesTo from "./PokemonEvolvesTo";
import { getPokemonName } from "../../utils/pokemonUtils";
import "./PokemonEvolution.scss";

const PokemonEvolution = ({ pokemon, clickHandler }) => {
  // Displays the evolution section of the modal
  const displayEvolution = (pokemon, clickHandler) => {
    // Content for battle-only forms
    if (pokemon.form?.details?.is_battle_only) {
      // Get the names we'll use when displaying the battle-only message
      const formName = getPokemonName(pokemon.species, pokemon.form);
      const speciesName = getPokemonName(pokemon.species);

      return (
        <p>
          {formName} is a temporary transformation of {speciesName}. It is only
          available in battle and is not a permanent evolution. It cannot evolve
          any further.
        </p>
      );
    }

    // Content for all other pokemon
    else {
      return (
        <>
          <PokemonEvolvesFrom
            key={`evolves-from-${pokemon.variant.id}`}
            pokemon={pokemon}
            clickHandler={clickHandler}
          ></PokemonEvolvesFrom>
          <PokemonEvolvesTo
            key={`evolves-to-${pokemon.variant.id}`}
            pokemon={pokemon}
            clickHandler={clickHandler}
          ></PokemonEvolvesTo>
        </>
      );
    }
  };

  return (
    <ModalRow id="pokemon-evolution">
      <ModalInfoItem label="Evolution">
        <ModalRow>{displayEvolution(pokemon, clickHandler)}</ModalRow>
      </ModalInfoItem>
    </ModalRow>
  );
};

export default PokemonEvolution;
