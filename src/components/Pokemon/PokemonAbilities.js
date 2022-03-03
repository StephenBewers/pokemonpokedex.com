import React, { Component } from "react";
import "./PokemonAbilities.scss";
import LoadingBarSmall from "../LoadingSpinnerSmall";
import ModalRow from "../Modal/ModalRow";
import ModalInfoItem from "../Modal/ModalInfoItem";
import {
  errorHandler,
  cancelPromise,
  getEnglishContent,
  textCleanup,
  makeCancellable,
  getResource,
} from "../../helpers.js";

// Array that will store promises to return the additional data. Promises will be cancelled on unmount.
let abilityPromises = [];

// Resets the promise variables to default values
const resetPromises = () => {
  abilityPromises = [];
}

class PokemonAbilities extends Component {
  constructor(props) {
    super(props);
    this.state = {
      abilities: this.props.pokemon.variant.abilities,
      abilitiesReceived: false,
    };
    resetPromises();
  }

  componentDidMount() {
    let { pokemon } = this.props;

    // Fetch the pokemon abilitY promises from the API
    abilityPromises = this.getAbilityPromises(pokemon);
  }

  componentDidUpdate(prevProps) {
    let { pokemon } = this.props;

    // If the variant has changed
    if (prevProps.pokemon.variant.id !== this.props.pokemon.variant.id) {
      // Clear the existing promise array
      resetPromises();

      // Update state with the new pokemon abilities
      this.setState({
        abilities: this.props.pokemon.variant.abilities,
        abilitiesReceived: false,
      });

      // Get the ability promises for the new pokemon
      abilityPromises = this.getAbilityPromises(pokemon);
    }

    // If the ability promises have been retrieved, update the abilities in state
    if (abilityPromises.length && !this.state.abilitiesReceived) {
      this.updateAbilities(pokemon, abilityPromises);
    }
  }

  componentWillUnmount() {
    // Cancel the ability promises
    if (abilityPromises.length) {
      abilityPromises.forEach((promise) => {
        cancelPromise(promise, errorHandler);
      });
    }
  }

  // Gets cancellable promises to return the ability objects from the API
  getAbilityPromises = (pokemon) => {
    const abilities = pokemon.variant.abilities;
    let abilityPromises = [];
    if (abilities.length) {
      for (let i = 0; i < abilities.length; i++) {
        abilityPromises.push(
          makeCancellable(
            getResource(`${abilities[i].ability.url}`)
          )
        );
      }
    }
    return abilityPromises;
  };

  // Once all ability promises have resolved, add the ability details to state
  updateAbilities = (pokemon, abilityPromises) => {
    Promise.all(abilityPromises)
      .then((promises) => {
        (async () => {
          let abilities = pokemon.variant.abilities;
          for (let i = 0; i < promises.length; i++) {
            try {
              abilities[i].details = await promises[i].promise;
            } catch (error) {
              errorHandler(error);
            }
          }
          this.setState({
            abilities: abilities,
            abilitiesReceived: true,
          });
        })();
      })
      .catch((error) => {
        errorHandler(error);
      });
  };

  render() {
    // If the details of the ability have been received, return the English name
    const getAbilityName = (ability, abilitiesReceived) => {
      if (abilitiesReceived) {
        return getEnglishContent(ability.details.names, "name");
      }
      // If the description of the ability haven't been received, return a cleanup of the dirty ability name
      else {
        return textCleanup(ability.ability.name);
      }
    };

    // If the details of the ability have been received, return the English description
    const getAbilityDescription = (ability, abilitiesReceived) => {
      if (abilitiesReceived) {
        return (
          <p className={`pokemon-ability-description`}>
            {getEnglishContent(ability.details.effect_entries, "short_effect")}
          </p>
        );
      }
      // If the details of the ability haven't been received, return a holding message
      else {
        return <LoadingBarSmall></LoadingBarSmall>;
      }
    };

    // Renders the hidden ability label
    const isHidden = (ability) => {
      if (ability.is_hidden) {
        return (
          <>
            &nbsp;<span className="hidden-ability-label">Hidden</span>
          </>
        );
      }
    };

    // Get the abilities from state
    const { abilities, abilitiesReceived } = this.state;

    return (
      <ModalRow id="pokemon-abilities">
        <ModalInfoItem label="Abilities">
          {abilities.map((ability, i) => {
            return (
              <details className={`pokemon-ability`} key={i}>
                <summary>
                  {getAbilityName(ability, abilitiesReceived)}
                  {isHidden(ability)}
                </summary>
                {getAbilityDescription(ability, abilitiesReceived)}
              </details>
            );
          })}
        </ModalInfoItem>
      </ModalRow>
    );
  }
}

export default PokemonAbilities;
