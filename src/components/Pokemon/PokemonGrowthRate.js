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
let growthRatePromise;

class PokemonGrowthRate extends Component {
  constructor(props) {
    super(props);
    this.state = {
      growthRate: this.props.pokemon.species.growth_rate,
      growthRateReceived: false,
    };
  }

  componentDidMount() {
    let { pokemon } = this.props;

    // Fetch details about the pokemon growth rate from the API
    growthRatePromise = this.getGrowthRatePromise(pokemon);
  }

  componentDidUpdate(prevProps) {
    let { pokemon } = this.props;

    // If the variant has changed
    if (prevProps.pokemon.variant.id !== this.props.pokemon.variant.id) {
      // Clear the existing promise
      growthRatePromise = null;

      // Update state with the new pokemon growth rate
      this.setState({
        growthRate: this.props.pokemon.species.growth_rate,
        growthRateReceived: false,
      });

      // Get the growth rate promise for the new pokemon
      growthRatePromise = this.getGrowthRatePromise(pokemon);
    }

    // If the growth rate promise has been retrieved, update the growth rate in state
    if (
      growthRatePromise.hasOwnProperty("promise") &&
      !this.state.growthRateReceived
    ) {
      this.updateGrowthRate(pokemon, growthRatePromise);
    }
  }

  componentWillUnmount() {
    // Cancel the growth rate promise
    if (growthRatePromise?.hasOwnProperty("promise")) {
      cancelPromise(growthRatePromise, errorHandler);
    }
  }

  // Gets cancellable promise to return the growth rate of this pokemon
  getGrowthRatePromise = (pokemon) => {
    const growthRate = pokemon.species.growth_rate;
    let growthRatePromise;
    if (growthRate.hasOwnProperty("url")) {
      growthRatePromise = makeCancellable(
        getResource(`${growthRate.url}`)
      );
    }
    return growthRatePromise;
  };

  // Adds the growth rate of the current pokemon, updating the state
  updateGrowthRate = (pokemon, growthRatePromise) => {
    const growthRate = pokemon.species.growth_rate;
    growthRatePromise.promise
      .then((growthRateDetails) => {
        (async () => {
          growthRate.details = growthRateDetails;
          this.setState({
            growthRate: growthRate,
            growthRateReceived: true,
          });
        })();
      })
      .catch((error) => {
        errorHandler(error);
      });
  };

  render() {
    // Gets the growth rate description
    const getGrowthRateDescription = (growthRate, growthRateReceived) => {
      let growthRateDescription;
      // If the growth rate has been received display the clean description
      if (growthRateReceived) {
        growthRateDescription = getEnglishContent(
          growthRate.details.descriptions,
          "description"
        );
      }
      // Otherwise do a cleanup of the dirty growth rate name
      else {
        growthRateDescription = textCleanup(growthRate.name);
      }
      return growthRateDescription;
    };

    // Get the growth rate from state
    const { growthRate, growthRateReceived } = this.state;

    // Only render the growth rate if the pokemon is not battle-only as battle-only pokemon do not grow
    if (!this.props.pokemon.form?.details?.is_battle_only) {
      return (
        <ModalInfoItem
          label="Growth rate"
          id="pokemon-growth-rate"
          subitem={true}
        >
          <ModalInfoValue
            value={getGrowthRateDescription(growthRate, growthRateReceived)}
          ></ModalInfoValue>
        </ModalInfoItem>
      );
    } else {
      return null;
    }
  }
}

export default PokemonGrowthRate;
