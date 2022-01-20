import React, { Component } from "react";
import LoadingBarSmall from "../LoadingBarSmall";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalColumn from "../Modal/ModalColumn";
import CardList from "../CardList";
import {
  errorHandler,
  cancelPromise,
  makeCancellable,
  getResource,
} from "../../helpers.js";

// Array that will store promises to return the additional data. Promises will be cancelled on unmount.
let evolutionChainPromise;

class PokemonEvolvesTo extends Component {
  constructor(props) {
    super(props);
    this.state = {
      evolutionChain: {},
      evolutionChainReceived: false,
    };
  }

  componentDidMount() {
    let { pokemon } = this.props;

    // We only need to get the evolution chain if the form is not a battle-only form.
    if (!pokemon.form || !pokemon.form?.details?.is_battle_only) {
        evolutionChainPromise = this.getEvolutionChainPromise(pokemon);
    }

    // Update the details about the evolution chain
    if (evolutionChainPromise?.hasOwnProperty("promise")) {
      this.updateEvolutionChain(pokemon, evolutionChainPromise);
    }
  }

  componentDidUpdate(prevProps) {
    let { pokemon } = this.props;
    let {
      evolutionChainReceived,
      evolutionChain,
    } = this.state;

    // If the variant has changed
    if (prevProps.pokemon.variant.id !== this.props.pokemon.variant.id) {
      // Clear the existing promise arrays
      evolutionChainPromise = null;

      // Update state with the evolves from pokemon
      this.setState({
        evolutionChain: {},
        evolutionChainReceived: false,
      });

      // Get the evolution chain for the new pokemon
      // We only need to get this if the form is not a battle-only form. Battle-only forms cannot evolve.
      if (!pokemon.form || !pokemon.form?.details?.is_battle_only) {
        evolutionChainPromise = this.getEvolutionChain(pokemon);
     }
    }
  }

  componentWillUnmount() {
    // Cancel the evolution chain promise
    if (evolutionChainPromise?.hasOwnProperty("promise")) {
      cancelPromise(evolutionChainPromise, errorHandler);
    }
  }

  // Gets cancellable promise to return the evolution chain for this pokemon
  getEvolutionChainPromise = (pokemon) => {
    const evolutionChain = pokemon.species.evolution_chain;
    let evolutionChainPromise;
    if (evolutionChain?.hasOwnProperty("url")) {
        evolutionChainPromise = makeCancellable(
            getResource(`${evolutionChain.url}`)
          );
    }
    return evolutionChainPromise;
  };

  // Adds the evolution chain for the current pokemon, updating the state
  updateEvolutionChain = (pokemon, evolutionChainPromise) => {
    const evolutionChain = pokemon.species.evolution_chain;
    evolutionChainPromise.promise
      .then((evolutionChainDetails) => {
        evolutionChain.details = evolutionChainDetails;
        this.setState({
          evolutionChain: evolutionChain,
          evolutionChainReceived: true,
        });
      })
      .catch((error) => {
        errorHandler(error);
      });
  };

  render() {
    return (
        <ModalColumn>
            <ModalInfoItem label="Evolves to" subitem={true}>
              Evolves to pokemon goes here
            </ModalInfoItem>
          </ModalColumn>
    )
  }
}

export default PokemonEvolvesTo;
