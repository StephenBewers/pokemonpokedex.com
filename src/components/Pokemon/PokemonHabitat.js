import React, { Component } from "react";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalInfoValue from "../Modal/ModalInfoValue";
import {
  errorHandler,
  cancelPromise,
  getEnglishContent,
  textCleanup,
  makeCancellable,
  getResource,
} from "../../helpers.js";

// Variable to store the promise to return the additional data. Promise will be cancelled on unmount.
let habitatPromise;

class PokemonHabitat extends Component {
  constructor(props) {
    super(props);
    this.state = {
      habitat: this.props.pokemon.species.habitat,
      habitatReceived: false,
    };
  }

  componentDidMount() {
    let { pokemon } = this.props;

    // Fetch details about the pokemon habitat from the API
    habitatPromise = this.getHabitatPromise(pokemon);
  }

  componentDidUpdate(prevProps) {
    let { pokemon } = this.props;

    // If the variant has changed
    if (prevProps.pokemon.variant.id !== this.props.pokemon.variant.id) {
      // Clear the existing promise
      habitatPromise = null;

      // Update state with the new pokemon habitat
      this.setState({
        habitat: this.props.pokemon.species.habitat,
        habitatReceived: false,
      });

      // Get the habitat promise for the new pokemon
      habitatPromise = this.getHabitatPromise(pokemon);
    }

    // If the habitat promise has been retrieved, update the habitat in state
    if (
      habitatPromise.hasOwnProperty("promise") &&
      !this.state.habitatReceived
    ) {
      this.updateHabitat(pokemon, habitatPromise);
    }
  }

  componentWillUnmount() {
    // Cancel the habitat promise
    if (habitatPromise?.hasOwnProperty("promise")) {
      cancelPromise(habitatPromise, errorHandler);
    }
  }

  // Gets cancellable promise to return the habitat of this pokemon
  getHabitatPromise = (pokemon) => {
    const habitat = pokemon.species.habitat;
    let habitatPromise;
    if (habitat.hasOwnProperty("url")) {
      habitatPromise = makeCancellable(getResource(`${habitat.url}`));
    }
    return habitatPromise;
  };

  // Adds the habitat of the current pokemon, updating the state
  updateHabitat = (pokemon, habitatPromise) => {
    const habitat = pokemon.species.habitat;
    habitatPromise.promise
      .then((habitatDetails) => {
        habitat.details = habitatDetails;
        this.setState({
          habitat: habitat,
          habitatReceived: true,
        });
      })
      .catch((error) => {
        errorHandler(error);
      });
  };

  render() {
    // Gets the habitat name
    const getHabitatName = (habitat, habitatReceived, pokemon) => {
      let habitatName;
      // If it's a battle-only pokemon, display the habitat as battle
      if (pokemon.form?.details?.is_battle_only) {
        habitatName = "Battle";
      }
      // If the habitat has been received, display the clean habitat name
      else if (habitatReceived) {
        habitatName = getEnglishContent(habitat?.details?.names, "name");
      }
      // Otherwise do a cleanup of the dirty habitat name
      else {
        habitatName = textCleanup(habitat.name);
      }
      return habitatName;
    };

    // Get the habitat from state
    const { habitat, habitatReceived } = this.state;

    // Only render the habitat if there is a habitat to render
    if (habitat) {
      return (
        <ModalInfoItem label="Habitat" id="pokemon-habitat" subitem={true}>
          <ModalInfoValue
            value={getHabitatName(habitat, habitatReceived, this.props.pokemon)}
          ></ModalInfoValue>
        </ModalInfoItem>
      );
    } else {
      return null;
    }
  }
}

export default PokemonHabitat;
