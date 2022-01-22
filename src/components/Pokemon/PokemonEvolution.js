import React, { Component } from "react";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalRow from "../Modal/ModalRow";
import PokemonEvolvesFrom from "./PokemonEvolvesFrom";
import PokemonEvolvesTo from "./PokemonEvolvesTo";
import { getPokemonName } from "../../helpers.js";
import "./PokemonEvolution.scss";

class PokemonEvolution extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {}

  componentDidUpdate(prevProps) {}

  componentWillUnmount() {}

  render() {
    let { pokemon, clickHandler } = this.props;

    // Displays the evolution section of the modal
    const displayEvolution = (pokemon, clickHandler) => {
      // Content for battle-only forms
      if (pokemon.form?.details?.is_battle_only) {
        // Get the names we'll use when displaying the battle-only message
        const formName = getPokemonName(pokemon.species, pokemon.form);
        const speciesName = getPokemonName(pokemon.species);

        return (
          <p>
            {formName} is a temporary transformation of {speciesName}. It is
            only available in battle and is not a permanent evolution. It cannot
            evolve any further.
          </p>
        );
      }

      // Content for all other pokemon
      else {
        return (
          <>
            <PokemonEvolvesFrom
              pokemon={pokemon}
              clickHandler={clickHandler}
            ></PokemonEvolvesFrom>
            <PokemonEvolvesTo
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
  }
}

export default PokemonEvolution;
