import React, { Component } from "react";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalInfoValue from "../Modal/ModalInfoValue";
import { getResource } from "../../utils/pokeApiUtils";
import { getEnglishContent, textCleanup } from "../../utils/pokemonUtils";
import {
  errorHandler,
  cancelPromise,
  makeCancellable,
} from "../../utils/promiseUtils";

// Array that will store promises to return the additional data. Promises will be cancelled on unmount.
let eggGroupPromises = [];

// Resets the promise variables to default values
const resetPromises = () => {
  eggGroupPromises = [];
}

class PokemonEggGroups extends Component {
  constructor(props) {
    super(props);
    this.state = {
      eggGroups: this.props.pokemon.species.egg_groups,
      eggGroupsReceived: false,
    };
    resetPromises();
  }

  componentDidMount() {
    let { pokemon } = this.props;

    // Fetch the pokemon eggGroup promises from the API
    eggGroupPromises = this.getEggGroupPromises(pokemon);
  }

  componentDidUpdate(prevProps) {
    let { pokemon } = this.props;

    // If the species has changed
    if (prevProps.pokemon.species.id !== this.props.pokemon.species.id) {
      // Clear the existing promise array
      resetPromises();

      // Update state with the new pokemon eggGroups
      this.setState({
        eggGroups: this.props.pokemon.species.egg_groups,
        eggGroupsReceived: false,
      });

      // Get the eggGroup promises for the new pokemon
      eggGroupPromises = this.getEggGroupPromises(pokemon);
    }

    // If the eggGroup promises have been retrieved, update the eggGroups in state
    if (eggGroupPromises.length && !this.state.eggGroupsReceived) {
      this.updateEggGroups(pokemon, eggGroupPromises);
    }
  }

  componentWillUnmount() {
    // Cancel the eggGroup promises
    if (eggGroupPromises.length) {
      eggGroupPromises.forEach((promise) => {
        cancelPromise(promise, errorHandler);
      });
    }
  }

  // Gets cancellable promises to return the eggGroup objects from the API
  getEggGroupPromises = (pokemon) => {
    const eggGroups = pokemon.species.egg_groups;
    let eggGroupPromises = [];
    if (eggGroups.length) {
      for (let i = 0; i < eggGroups.length; i++) {
        eggGroupPromises.push(
          makeCancellable(getResource(`${eggGroups[i].url}`))
        );
      }
    }
    return eggGroupPromises;
  };

  // Once all eggGroup promises have resolved, add the eggGroup details to state
  updateEggGroups = (pokemon, eggGroupPromises) => {
    Promise.all(eggGroupPromises)
      .then((promises) => {
        (async () => {
          let eggGroups = pokemon.species.egg_groups;
          for (let i = 0; i < promises.length; i++) {
            try {
              eggGroups[i].details = await promises[i].promise;
            } catch (error) {
              errorHandler(error);
            }
          }
          this.setState({
            eggGroups: eggGroups,
            eggGroupsReceived: true,
          });
        })();
      })
      .catch((error) => {
        errorHandler(error);
      });
  };

  render() {
    // If the details of the eggGroup have been received, return the English name
    const getEggGroupName = (eggGroup, eggGroupsReceived) => {
      if (eggGroupsReceived) {
        return getEnglishContent(eggGroup.details.names, "name");
      }
      // If the details of the eggGroup haven't been received, return a cleanup of the dirty eggGroup name
      else {
        return textCleanup(eggGroup.name);
      }
    };

    // Get the eggGroups from state
    const { eggGroups, eggGroupsReceived } = this.state;

    return (
      <ModalInfoItem
        label="Hatches from egg groups"
        id="modal-hatches-from"
        subitem={true}
      >
        {eggGroups.map((eggGroup, i) => {
          return (
            <ModalInfoValue
              value={`\u{1F95A} ${getEggGroupName(
                eggGroup,
                eggGroupsReceived
              )}`}
              key={i}
            ></ModalInfoValue>
          );
        })}
      </ModalInfoItem>
    );
  }
}

export default PokemonEggGroups;
