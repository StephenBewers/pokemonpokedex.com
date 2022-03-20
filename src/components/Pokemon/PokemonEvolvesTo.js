import React, { Component } from "react";
import LoadingBarSmall from "../LoadingSpinnerSmall";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalColumn from "../Modal/ModalColumn";
import ModalRow from "../Modal/ModalRow";
import CardList from "../CardList";
import { getResource } from "../../utils/pokeApiUtils";
import { getPokemonName, isGalarianEvolution } from "../../utils/pokemonUtils";
import {
  errorHandler,
  cancelPromise,
  makeCancellable,
} from "../../utils/promiseUtils";

// Array that will store promises to return the additional data. Promises will be cancelled on unmount.
let evolutionChainPromise;
let evolvesToSpeciesPromises = [];
let evolvesToPokemonPromises = [];

// Resets the promise variables to default values
const resetPromises = () => {
  evolutionChainPromise = null;
  evolvesToSpeciesPromises = [];
  evolvesToPokemonPromises = [];
}

// Resets the state to default values
const resetState = () => ({
  evolutionChain: {},
  evolutionChainReceived: false,
  evolvesToSpecies: [],
  evolvesToSpeciesReceived: false,
  evolvesToPokemon: [],
  evolvesToPokemonReceived: false,
  hasEvolutions: true,
});

class PokemonEvolvesTo extends Component {
  constructor(props) {
    super(props);
    this.state = { ...resetState() };
    resetPromises();
  }

  componentDidMount() {
    let { pokemon } = this.props;

    // Get the evolution chain promise
    evolutionChainPromise = this.getEvolutionChainPromise(pokemon);

    // Update the details about the evolution chain
    if (evolutionChainPromise?.hasOwnProperty("promise")) {
      this.updateEvolutionChain(pokemon, evolutionChainPromise);
    }
  }

  componentDidUpdate(prevProps) {
    let { pokemon } = this.props;
    let {
      evolutionChain,
      evolutionChainReceived,
      evolvesToSpecies,
      evolvesToSpeciesReceived,
      evolvesToPokemonReceived,
      hasEvolutions,
    } = this.state;

    // If the form or variant has changed
    if (
      prevProps.pokemon.form?.details?.id !==
        this.props.pokemon.form?.details?.id ||
      prevProps.pokemon.variant.id !== this.props.pokemon.variant.id
    ) {
      // Clear the existing promise arrays
      resetPromises();

      // Reset the state and then treat it as if the component just mounted
      this.setState(
        {
          ...resetState(),
        },
        () => {
          this.componentDidMount();
        }
      );
    }

    // If the evolution chain has been received and this pokemon has evolutions get the evolves to species array
    if (evolutionChainReceived && hasEvolutions && !evolvesToSpeciesReceived) {
      const evolvesToSpeciesArray = this.getEvolvesToSpeciesArray(
        pokemon,
        evolutionChain
      );
      // If the evolves to species array is empty, this pokemon has no evolutions so update state
      if (!evolvesToSpeciesArray.length) {
        this.setState({
          hasEvolutions: false,
        });
      }
      // Else, we know the pokemon does have evolutions so get the evolves to species promises
      else {
        evolvesToSpeciesPromises = this.getEvolvesToSpeciesPromises(
          evolvesToSpeciesArray
        );
      }
    }

    // Update the evolves to species
    if (evolvesToSpeciesPromises.length && !evolvesToSpeciesReceived) {
      this.updateEvolvesToSpecies(evolvesToSpeciesPromises);
    }

    // If we've received the evolves to species, we can get the evolves to pokemon promises
    if (evolvesToSpeciesReceived && !evolvesToPokemonReceived) {
      evolvesToPokemonPromises = this.getEvolvesToPokemonPromises(
        pokemon,
        evolvesToSpecies
      );
    }

    // Update the evolves to pokemon
    if (
      evolvesToSpeciesReceived &&
      evolvesToPokemonPromises.length &&
      !evolvesToPokemonReceived
    ) {
      this.updateEvolvesToPokemon(
        pokemon,
        evolvesToPokemonPromises,
        evolvesToSpecies
      );
    }
  }

  componentWillUnmount() {
    // Cancel the evolution chain promise
    if (evolutionChainPromise?.hasOwnProperty("promise")) {
      cancelPromise(evolutionChainPromise, errorHandler);
    }

    // Cancel the evolves to species promises
    if (evolvesToSpeciesPromises.length) {
      evolvesToSpeciesPromises.forEach((promise) => {
        if (promise) {
          cancelPromise(promise, errorHandler);
        }
      });
    }

    // Cancel the evolves to pokemon promises (sometimes there is no form so we need to check each one isn't empty)
    if (evolvesToPokemonPromises.length) {
      evolvesToPokemonPromises.forEach((evolvesToPokemon) => {
        evolvesToPokemon.forEach((promise) => {
          if (promise) {
            cancelPromise(promise, errorHandler);
          }
        })
      });
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

  // Returns the array of species this pokemon evolves into
  getEvolvesToSpeciesArray = (pokemon, evolutionChain) => {
    const currentSpecies = pokemon.species;
    const primaryPokemon = evolutionChain.details.chain.species;
    const secondaryPokemonArray = evolutionChain.details.chain.evolves_to;
    let evolvesToSpeciesArray = [];

    // If the current pokemon is bottom of the chain then its' evolutions are the secondary pokemon
    if (currentSpecies.name === primaryPokemon.name) {
      evolvesToSpeciesArray = secondaryPokemonArray;
    }
    // If not, we need to look for the current pokemon in the secondary pokemon array
    else {
      // If the current species name matches a secondary pokemon we can get the evolutions
      secondaryPokemonArray.forEach((secondaryPokemon) => {
        if (currentSpecies.name === secondaryPokemon.species.name) {
          evolvesToSpeciesArray = secondaryPokemon.evolves_to;
        }
      });
    }

    return evolvesToSpeciesArray;
  };

  // Gets cancellable promises to return the pokemon species this pokemon evolves into
  getEvolvesToSpeciesPromises = (evolvesToSpeciesArray) => {
    let evolvesToSpeciesPromises = [];

    // Get a cancellable promise for each species the current pokemon could evolve to
    for (const evolvesToSpeciesObject of evolvesToSpeciesArray) {
      const evolvesToSpecies = evolvesToSpeciesObject.species;
      let evolvesToSpeciesPromise;
      if (evolvesToSpecies?.hasOwnProperty("url")) {
        evolvesToSpeciesPromise = makeCancellable(
          getResource(`${evolvesToSpecies.url}`)
        );
      }
      evolvesToSpeciesPromises.push(evolvesToSpeciesPromise);
    }

    return evolvesToSpeciesPromises;
  };

  // Updates the evolves to species in state
  updateEvolvesToSpecies = (evolvesToSpeciesPromises) => {
    Promise.all(evolvesToSpeciesPromises)
      .then((promises) => {
        (async () => {
          let evolvesToSpeciesArray = [];
          let evolvesToSpecies;
          for (const promise of promises) {
            try {
              evolvesToSpecies = await promise.promise;
            } catch (error) {
              errorHandler(error);
            }
            evolvesToSpeciesArray.push(evolvesToSpecies);
          }
          this.setState({
            evolvesToSpecies: evolvesToSpeciesArray,
            evolvesToSpeciesReceived: true,
          });
        })();
      })
      .catch((error) => {
        errorHandler(error);
      });
  };

  // Gets promises to return the pokemon variants and forms that the current pokemon evolves to
  getEvolvesToPokemonPromises = (pokemon, evolvesToSpeciesArray) => {
    const currentForm = pokemon.form;
    let allEvolvesToPokemonPromises = [];

    // Gets the promises to retrieve the default variant
    const getDefaultVariantPromises = (evolvesToSpecies) => {
      for (let i = 0; i < evolvesToSpecies.varieties.length; i++) {
        if (evolvesToSpecies.varieties[i].is_default) {
          // Get a cancellable promise to retrieve the default variant
          let evolvesToVariantPromise = makeCancellable(
            getResource(`${evolvesToSpecies.varieties[i].pokemon.url}`)
          );
          // Return both promises (even though in this case the form is empty)
          return [evolvesToVariantPromise, null];
        }
      }
    };

    for (const evolvesToSpecies of evolvesToSpeciesArray) {
      let evolvesToPokemonPromise = [];
      let evolvesToVariantPromise;
      let evolvesToFormPromise;

      // If the current modal pokemon has a form and that form has a non-blank name (i.e. not a default pokemon)
      if (currentForm.details?.form_name) {
        const formName = currentForm.details.form_name;

        // If there are multiple variants we'll need to find the one that corresponds to the form name
        if (evolvesToSpecies.varieties.length > 1) {
          // Loop through the evolves to species to find if there is a matching variant
          for (let i = 0; i < evolvesToSpecies.varieties.length; i++) {
            // If there is a variant with the same form name
            if (
              evolvesToSpecies.varieties[i].pokemon.name ===
              `${evolvesToSpecies.name}-${formName}`
            ) {
              // Get a cancellable promise to retrieve the variant
              evolvesToVariantPromise = makeCancellable(
                getResource(`${evolvesToSpecies.varieties[i].pokemon.url}`)
              );
              // Get a cancellable promise to retrieve the form
              evolvesToFormPromise = makeCancellable(
                getResource(
                  `https://pokeapi.co/api/v2/pokemon-form/${evolvesToSpecies.name}-${formName}`
                )
              );
              // Add both promises to the promise array for this pokemon
              evolvesToPokemonPromise.push(
                evolvesToVariantPromise,
                evolvesToFormPromise
              );
              // Add the promise array for this pokemon to the array for all evolves to pokemon
              allEvolvesToPokemonPromises.push(evolvesToPokemonPromise);
            }
          }

          // If there isn't a variant with the same form name, get the default
          if (!allEvolvesToPokemonPromises.length) {
            const defaultVariantPromises =
              getDefaultVariantPromises(evolvesToSpecies);
            // Add both promises to the promise array (even though in this case the form is empty)
            allEvolvesToPokemonPromises.push([
              defaultVariantPromises[0],
              defaultVariantPromises[1],
            ]);
          }
        }

        // Otherwise, there is only one variant and we can get that one and the corresponding form
        else {
          // Get a cancellable promise to retrieve the variant
          evolvesToVariantPromise = makeCancellable(
            getResource(`${evolvesToSpecies.varieties[0].pokemon.url}`)
          );
          // Get a cancellable promise to retrieve the form
          evolvesToFormPromise = makeCancellable(
            getResource(
              `https://pokeapi.co/api/v2/pokemon-form/${evolvesToSpecies.name}-${formName}`
            )
          );
          // Add both promises to the promise array for this pokemon
          evolvesToPokemonPromise.push(
            evolvesToVariantPromise,
            evolvesToFormPromise
          );
          // Add the promise array for this pokemon to the array for all evolves to pokemon
          allEvolvesToPokemonPromises.push(evolvesToPokemonPromise);
        }
      }

      // If not, the current modal pokemon must be the default variant
      else {
        const defaultVariantPromises =
          getDefaultVariantPromises(evolvesToSpecies);
        // Add both promises to the promise array (even though in this case the form is empty)
        allEvolvesToPokemonPromises.push([
          defaultVariantPromises[0],
          defaultVariantPromises[1],
        ]);
      }
    }
    return allEvolvesToPokemonPromises;
  };

  // Adds the pokemon objects that the current pokemon evolves to, updating the state
  updateEvolvesToPokemon = (
    pokemon,
    allEvolvesToPokemonPromises,
    evolvesToSpecies
  ) => {
    let evolvesToPokemonArray = [];
    let impossibleEvolutions = [];

    for (let i = 0; i < allEvolvesToPokemonPromises.length; i++) {
      const evolvesToPokemonPromises = allEvolvesToPokemonPromises[i];
      Promise.all(evolvesToPokemonPromises)
        .then((promises) => {
          (async () => {
            let evolvesToVariant;
            try {
              evolvesToVariant = await promises[0].promise;
            } catch (error) {
              errorHandler(error);
            }

            // If there is a form promise, try to get the details of the form
            let evolvesToForm;
            let evolvesToFormDetails = {};
            if (promises[1]) {
              try {
                evolvesToForm = await promises[1].promise;
              } catch (error) {
                errorHandler(error);
              }
              evolvesToFormDetails = { details: evolvesToForm };
            }

            // Only add the pokemon to the evolves to array under certain conditions to prevent impossible evolutions
            if (
              (!isGalarianEvolution(evolvesToVariant.id) &&
              pokemon.form?.details?.form_name !== "galar") ||
              (evolvesToFormDetails.details?.form_name === "galar" &&
                pokemon.form?.details?.form_name === "galar") || 
              (isGalarianEvolution(evolvesToVariant.id) &&
                pokemon.form?.details?.form_name === "galar")
            ) {
              // Add the evolves to pokemon to the array
              let evolvesToPokemon = {
                species: evolvesToSpecies[i],
                variant: evolvesToVariant,
                form: evolvesToFormDetails,
              };
              evolvesToPokemonArray.push(evolvesToPokemon);
            }
            // Keep count of any impossible evolutions not included in the evolves to array
            else {
              impossibleEvolutions.push(1);
            }

            // If all of the pokemon have been added to the array, update state
            if (
              evolvesToPokemonArray.length ===
              evolvesToSpecies.length - impossibleEvolutions.length
            ) {
              // If there are no non-Galarian evolutions, update the state to has no evolutions
              if (evolvesToPokemonArray.length === 0) {
                this.setState({
                  hasEvolutions: false,
                });
              } else {
                // Ensure the array is in the correct order first
                evolvesToPokemonArray.sort(
                  (a, b) => a.species.id - b.species.id
                );
                this.setState({
                  evolvesToPokemon: evolvesToPokemonArray,
                  evolvesToPokemonReceived: true,
                });
              }
            }
          })();
        })
        .catch((error) => {
          errorHandler(error);
        });
    }
  };

  render() {
    let { pokemon, clickHandler } = this.props;
    let { evolvesToPokemonReceived, evolvesToPokemon, hasEvolutions } =
      this.state;

    // Displays the pokemon the current pokemon evolves into
    const displayEvolvesToPokemon = (
      pokemon,
      evolvesToPokemonReceived,
      evolvesToPokemon,
      hasEvolutions
    ) => {
      // If the pokemon has no evolutions it must be top of the chain
      if (!hasEvolutions) {
        return (
          <ModalColumn>
            <ModalInfoItem label="Evolves into" subitem={true}>
              <p>
                {getPokemonName(pokemon.species, pokemon.form)} is top of the
                evolution chain and cannot permanently evolve any further.
              </p>
            </ModalInfoItem>
          </ModalColumn>
        );
      }
      // If we've received the evolutions, render them
      else if (
        hasEvolutions &&
        evolvesToPokemonReceived &&
        evolvesToPokemon.length
      ) {
        // If there are more than 2 possible evolutions, display as a row underneath the evolves from pokemon
        if (evolvesToPokemon.length > 2) {
          return (
            <ModalRow>
              <ModalInfoItem label="Evolves into" subitem={true}>
                <CardList
                  pokemonList={evolvesToPokemon}
                  isModal={true}
                  clickHandler={clickHandler}
                />
              </ModalInfoItem>
            </ModalRow>
          );
        }
        // Otherwise display as column alongside
        else {
          return (
            <ModalColumn>
              <ModalInfoItem label="Evolves into" subitem={true}>
                <CardList
                  pokemonList={evolvesToPokemon}
                  isModal={true}
                  clickHandler={clickHandler}
                />
              </ModalInfoItem>
            </ModalColumn>
          );
        }
      }
      // Else show the loading bar
      else {
        return (
          <ModalColumn>
            <ModalInfoItem label="Evolves into" subitem={true}>
              <LoadingBarSmall></LoadingBarSmall>
            </ModalInfoItem>
          </ModalColumn>
        );
      }
    };

    return displayEvolvesToPokemon(
      pokemon,
      evolvesToPokemonReceived,
      evolvesToPokemon,
      hasEvolutions
    );
  }
}

export default PokemonEvolvesTo;
