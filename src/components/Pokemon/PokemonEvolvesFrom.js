import React, { Component } from "react";
import LoadingBarSmall from "../LoadingBarSmall";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalColumn from "../Modal/ModalColumn";
import CardList from "../CardList";
import PokemonEggGroups from "./PokemonEggGroups";
import {
  errorHandler,
  cancelPromise,
  makeCancellable,
  getResource,
} from "../../helpers.js";

// Array that will store promises to return the additional data. Promises will be cancelled on unmount.
let evolvesFromSpeciesPromise;
let evolvesFromPokemonPromises = [];

class PokemonEvolvesFrom extends Component {
  constructor(props) {
    super(props);
    this.state = {
      evolvesFromSpecies: this.props.pokemon.species.evolves_from_species,
      evolvesFromSpeciesReceived: false,
      evolvesFromPokemon: {},
      evolvesFromPokemonReceived: false,
    };
  }

  componentDidMount() {
    let { pokemon } = this.props;

    // We only need to get the evolves from pokemon if the form is not a battle-only form.
    if (!pokemon.form || !pokemon.form?.details?.is_battle_only) {
      evolvesFromSpeciesPromise = this.getEvolvesFromSpeciesPromise(pokemon);
    }

    // Update the details about the evolves from pokemon
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

    // If the variant has changed
    if (prevProps.pokemon.variant.id !== this.props.pokemon.variant.id) {
      // Clear the existing promise arrays
      evolvesFromSpeciesPromise = null;
      evolvesFromPokemonPromises = [];

      // Update state with the evolves from pokemon
      this.setState({
        evolvesFromSpecies: this.props.pokemon.species.evolves_from_species,
        evolvesFromSpeciesReceived: false,
        evolvesFromPokemon: {},
        evolvesFromPokemonReceived: false,
      });

      // Get the evolves from promises for the new pokemon
      // We only need to get this if the form is not a battle-only form. Battle-only forms cannot evolve.
      if (!pokemon.form || !pokemon.form?.details?.is_battle_only) {
        evolvesFromSpeciesPromise = this.getEvolvesFromSpeciesPromise(pokemon);
      }
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
    const currentForm = pokemon.form;
    let evolvesFromPokemonPromises = [];
    let evolvesFromVariantPromise;
    let evolvesFromFormPromise;

    // If the current modal pokemon has a form and that form has a non-blank name (i.e. not a default pokemon)
    if (currentForm.details?.form_name) {
      const formName = currentForm.details.form_name;

      // If there are multiple variants we'll need to find the one that corresponds to the form name
      if (evolvesFromSpecies.details.varieties.length > 1) {
        // Loop through the evolves from species to find if there is a matching variant
        for (let i = 0; i < evolvesFromSpecies.details.varieties.length; i++) {
          // If there is a variant with the same form name
          if (
            evolvesFromSpecies.details.varieties[i].pokemon.name ===
            `${evolvesFromSpecies.name}-${formName}`
          ) {
            // Get a cancellable promise to retrieve the variant
            evolvesFromVariantPromise = makeCancellable(
              getResource(`${evolvesFromSpecies.details.varieties[i].pokemon.url}`)
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
      for (let i = 0; i < evolvesFromSpecies.details.varieties.length; i++) {
        if (evolvesFromSpecies.details.varieties[i].is_default) {
          // Get a cancellable promise to retrieve the default variant
          evolvesFromVariantPromise = makeCancellable(
            getResource(`${evolvesFromSpecies.details.varieties[i].pokemon.url}`)
          );
          // Add both promises to the promise array (even though in this case the form is empty)
          evolvesFromPokemonPromises.push(
            evolvesFromVariantPromise,
            evolvesFromFormPromise
          );
        }
      }
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
                modal={true}
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
        return <LoadingBarSmall></LoadingBarSmall>;
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