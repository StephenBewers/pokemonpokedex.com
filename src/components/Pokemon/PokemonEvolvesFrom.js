import React, { Component } from "react";
import LoadingBarSmall from "../LoadingSpinnerSmall";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalColumn from "../Modal/ModalColumn";
import CardList from "../CardList";
import PokemonEggGroups from "./PokemonEggGroups";
import {
  errorHandler,
  cancelPromise,
  makeCancellable,
  getResource,
  isGalarianEvolution,
} from "../../helpers.js";

// Array that will store promises to return the additional data. Promises will be cancelled on unmount.
let evolvesFromSpeciesPromise;
let evolvesFromPokemonPromises = [];

// Resets the promise variables to default values
const resetPromises = () => {
  evolvesFromSpeciesPromise = null;
  evolvesFromPokemonPromises = [];
}

// Resets the state to default values
const resetState = () => ({
  evolvesFromSpeciesReceived: false,
  evolvesFromPokemon: {},
  evolvesFromPokemonReceived: false,
});

class PokemonEvolvesFrom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      evolvesFromSpecies: this.props.pokemon.species.evolves_from_species,
      ...resetState(),
    };
    resetPromises();
  }

  componentDidMount() {
    let { pokemon } = this.props;

    // Get the evolves from species promise
    evolvesFromSpeciesPromise = this.getEvolvesFromSpeciesPromise(pokemon);

    // Update the details about the evolves from species
    if (evolvesFromSpeciesPromise?.hasOwnProperty("promise")) {
      this.updateEvolvesFromSpecies(pokemon, evolvesFromSpeciesPromise);
    }
  }

  componentDidUpdate(prevProps) {
    let { pokemon } = this.props;
    let {
      evolvesFromSpeciesReceived,
      evolvesFromSpecies,
      evolvesFromPokemonReceived,
    } = this.state;

    // If the form or variant has changed
    if (
      prevProps.pokemon.form?.details?.id !==
        this.props.pokemon.form?.details?.id ||
      prevProps.pokemon.variant.id !== this.props.pokemon.variant.id
    ) {
      // Clear the existing promise arrays
      resetPromises();

      // Reset the state
      this.setState(
        {
          evolvesFromSpecies: this.props.pokemon.species.evolves_from_species,
          ...resetState(),
        },
        () => {
          this.componentDidMount();
        }
      );
    }

    // If we've received the evolves from species, we can get the evolves from pokemon promises
    if (evolvesFromSpeciesReceived && !evolvesFromPokemonReceived) {
      evolvesFromPokemonPromises = this.getEvolvesFromPokemonPromises(
        pokemon,
        evolvesFromSpecies
      );
    }

    // Update the evolves from pokemon on the variant
    if (
      evolvesFromSpeciesReceived &&
      evolvesFromPokemonPromises.length &&
      !evolvesFromPokemonReceived
    ) {
      this.updateEvolvesFromPokemon(
        evolvesFromPokemonPromises,
        evolvesFromSpecies
      );
    }
  }

  componentWillUnmount() {
    // Cancel the evolves from species promise
    if (evolvesFromSpeciesPromise?.hasOwnProperty("promise")) {
      cancelPromise(evolvesFromSpeciesPromise, errorHandler);
    }

    // Cancel the evolves from pokemon promises (sometimes there is no form so we need to check each one isn't empty)
    if (evolvesFromPokemonPromises.length) {
      evolvesFromPokemonPromises.forEach((promise) => {
        if (promise) {
          cancelPromise(promise, errorHandler);
        }
      });
    }
  }

  // Gets cancellable promise to return the pokemon species this pokemon evolves from
  getEvolvesFromSpeciesPromise = (pokemon) => {
    const evolvesFromSpecies = pokemon.species.evolves_from_species;
    let evolvesFromSpeciesPromise;
    if (evolvesFromSpecies?.hasOwnProperty("url")) {
      evolvesFromSpeciesPromise = makeCancellable(
        getResource(`${evolvesFromSpecies.url}`)
      );
    }
    return evolvesFromSpeciesPromise;
  };

  // Adds the pokemon species the current pokemon evolves from, updating the state
  updateEvolvesFromSpecies = (pokemon, evolvesFromSpeciesPromise) => {
    const evolvesFromSpecies = pokemon.species.evolves_from_species;
    evolvesFromSpeciesPromise.promise
      .then((evolvesFromSpeciesDetails) => {
        evolvesFromSpecies.details = evolvesFromSpeciesDetails;
        this.setState({
          evolvesFromSpecies: evolvesFromSpecies,
          evolvesFromSpeciesReceived: true,
        });
      })
      .catch((error) => {
        errorHandler(error);
      });
  };

  // Gets cancellable promises to return the pokemon variant and form that the current pokemon evolves from
  getEvolvesFromPokemonPromises = (pokemon, evolvesFromSpecies) => {
    let currentForm = pokemon.form;
    let currentVariant = pokemon.variant;
    let evolvesFromPokemonPromises = [];
    let evolvesFromVariantPromise;
    let evolvesFromFormPromise;

    // Gets the promises to retrieve the default variant
    const getDefaultVariantPromises = (evolvesFromSpecies) => {
      for (let i = 0; i < evolvesFromSpecies.details.varieties.length; i++) {
        if (evolvesFromSpecies.details.varieties[i].is_default) {
          // Get a cancellable promise to retrieve the default variant
          let evolvesFromVariantPromise = makeCancellable(
            getResource(
              `${evolvesFromSpecies.details.varieties[i].pokemon.url}`
            )
          );
          // Return both promises (even though in this case the form is empty)
          return [evolvesFromVariantPromise, null];
        }
      }
    };

    // Check if the current variant is a Galarian evolution
    if (isGalarianEvolution(currentVariant.id)) {
      currentForm.details
        ? (currentForm.details.form_name = "galar")
        : (currentForm = { details: { form_name: "galar" } });
    }

    // If the current modal pokemon has a form and that form has a non-blank name (i.e. not a default pokemon)
    if (currentForm.details?.form_name) {
      const formName = currentForm.details.form_name;

      // If there are multiple variants we'll need to find the one that corresponds to the form name
      if (evolvesFromSpecies.details.varieties.length > 1) {
        // Loop through the evolves from species to find if there is a matching variant
        for (let i = 0; i < evolvesFromSpecies.details.varieties.length; i++) {
          if (
            evolvesFromSpecies.details.varieties[i].pokemon.name ===
            `${evolvesFromSpecies.name}-${formName}`
          ) {
            // Get a cancellable promise to retrieve the variant
            evolvesFromVariantPromise = makeCancellable(
              getResource(
                `${evolvesFromSpecies.details.varieties[i].pokemon.url}`
              )
            );
            // Get a cancellable promise to retrieve the form
            evolvesFromFormPromise = makeCancellable(
              getResource(
                `https://pokeapi.co/api/v2/pokemon-form/${evolvesFromSpecies.name}-${formName}`
              )
            );
            // Add both promises to the promise array
            evolvesFromPokemonPromises.push(
              evolvesFromVariantPromise,
              evolvesFromFormPromise
            );
          }
        }

        // If there isn't a variant with the same form name, get the default
        if (!evolvesFromPokemonPromises.length) {
          const defaultVariantPromises =
            getDefaultVariantPromises(evolvesFromSpecies);
          // Add both promises to the promise array (even though in this case the form is empty)
          evolvesFromPokemonPromises.push(
            defaultVariantPromises[0],
            defaultVariantPromises[1]
          );
        }
      }

      // Otherwise, there is only one variant and we can get that one and the corresponding form
      else {
        // Get a cancellable promise to retrieve the variant
        evolvesFromVariantPromise = makeCancellable(
          getResource(`${evolvesFromSpecies.details.varieties[0].pokemon.url}`)
        );
        // Get a cancellable promise to retrieve the form
        evolvesFromFormPromise = makeCancellable(
          getResource(
            `https://pokeapi.co/api/v2/pokemon-form/${evolvesFromSpecies.name}-${formName}`
          )
        );
        // Add both promises to the promise array
        evolvesFromPokemonPromises.push(
          evolvesFromVariantPromise,
          evolvesFromFormPromise
        );
      }
    }

    // If not, the current modal pokemon must be the default variant
    else {
      const defaultVariantPromises =
        getDefaultVariantPromises(evolvesFromSpecies);
      // Add both promises to the promise array (even though in this case the form is empty)
      evolvesFromPokemonPromises.push(
        defaultVariantPromises[0],
        defaultVariantPromises[1]
      );
    }
    return evolvesFromPokemonPromises;
  };

  // Adds the pokemon object that the current pokemon evolves from, updating the state
  updateEvolvesFromPokemon = (
    evolvesFromPokemonPromises,
    evolvesFromSpecies
  ) => {
    Promise.all(evolvesFromPokemonPromises)
      .then((promises) => {
        (async () => {
          let evolvesFromVariant;
          try {
            evolvesFromVariant = await promises[0].promise;
          } catch (error) {
            errorHandler(error);
          }

          // If there is a form promise, try to get the details of the form
          let evolvesFromForm;
          let evolvesFromFormDetails = {};
          if (promises[1]) {
            try {
              evolvesFromForm = await promises[1].promise;
            } catch (error) {
              errorHandler(error);
            }

            evolvesFromFormDetails = { details: evolvesFromForm };
          }

          // Add the evolves from pokemon to the state
          let evolvesFromPokemon = {
            species: evolvesFromSpecies.details,
            variant: evolvesFromVariant,
            form: evolvesFromFormDetails,
          };
          this.setState({
            evolvesFromPokemon: evolvesFromPokemon,
            evolvesFromPokemonReceived: true,
          });
        })();
      })
      .catch((error) => {
        errorHandler(error);
      });
  };

  render() {
    let { pokemon, clickHandler } = this.props;
    let { evolvesFromPokemonReceived, evolvesFromPokemon } = this.state;

    // Displays the pokemon the current pokemon evolves from
    const displayEvolvesFromPokemon = (
      pokemon,
      evolvesFromPokemonReceived,
      evolvesFromPokemon
    ) => {
      if (evolvesFromPokemonReceived && evolvesFromPokemon) {
        const evolvesFromPokemonList = [evolvesFromPokemon];
        return (
          <ModalColumn>
            <ModalInfoItem label="Evolves from" subitem={true}>
              <CardList
                pokemonList={evolvesFromPokemonList}
                isModal={true}
                clickHandler={clickHandler}
              />
            </ModalInfoItem>
          </ModalColumn>
        );
      }
      // Content for when the evolves from pokemon is still loading from the API
      else if (
        pokemon.species.evolves_from_species?.hasOwnProperty("url") &&
        !evolvesFromPokemonReceived
      ) {
        return (
          <ModalColumn>
            <ModalInfoItem label="Evolves from" subitem={true}>
              <LoadingBarSmall></LoadingBarSmall>
            </ModalInfoItem>
          </ModalColumn>
        );
      }
      // If everything has been retrieved and the variant doesn't have an evolves from pokemon then it must hatch
      else if (!pokemon.variant.hasOwnProperty("evolvesFromPokemon")) {
        return (
          <ModalColumn>
            <PokemonEggGroups
              pokemon={pokemon}
              key={`egg-groups-${pokemon.species.id}`}
            />
          </ModalColumn>
        );
      }
    };

    return displayEvolvesFromPokemon(
      pokemon,
      evolvesFromPokemonReceived,
      evolvesFromPokemon
    );
  }
}

export default PokemonEvolvesFrom;
