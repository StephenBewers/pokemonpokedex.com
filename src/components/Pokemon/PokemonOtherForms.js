import React, { Component } from "react";
import "./PokemonOtherForms.scss";
import ModalRow from "../Modal/ModalRow";
import ModalColumn from "../Modal/ModalColumn";
import ModalInfoItem from "../Modal/ModalInfoItem";
import CardList from "../CardList";
import {
  errorHandler,
  cancelPromise,
  makeCancellable,
  getFormPromises,
  getPokemonName,
  getResource,
} from "../../helpers.js";

// Array to store promises to return the additional data. Promises will be cancelled on unmount.
let otherVariantPromises = [];

// Resets the state to default values
const resetState = () => ({
  otherVariantsReceived: false,
  otherVariants: [],
});

class PokemonOtherForms extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ...resetState(),
    };
  }

  componentDidMount() {
    let { pokemon } = this.props;

    // Fetch details about the pokemon variants from the API
    otherVariantPromises = this.getOtherVariantPromises(pokemon);
  }

  componentDidUpdate(prevProps) {
    let { pokemon } = this.props;

    // If the form or variant has changed
    if (
      prevProps.pokemon.form?.details?.id !==
        this.props.pokemon.form?.details?.id ||
      prevProps.pokemon.variant.id !== this.props.pokemon.variant.id
    ) {
      // Clear the existing promises
      otherVariantPromises = [];

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

    // If the variant promises have been retrieved, update the variants in state
    if (otherVariantPromises.length && !this.state.otherVariantsReceived) {
      this.updateOtherVariants(pokemon, otherVariantPromises);
    }
  }

  componentWillUnmount() {
    // Cancel the other variant promises
    if (otherVariantPromises.length) {
      otherVariantPromises.forEach((promise) => {
        cancelPromise(promise, errorHandler);
      });
    }
  }

  // Gets cancellable promises to return the other variant objects from the API
  getOtherVariantPromises = (pokemon) => {
    const currentVariant = pokemon.variant;
    const otherVariantsToGet = pokemon.species.varieties.filter(
      (variant) => variant.pokemon.name !== currentVariant.name
    );
    let otherVariantPromises = [];
    if (otherVariantsToGet.length) {
      for (let i = 0; i < otherVariantsToGet.length; i++) {
        otherVariantPromises.push(
          makeCancellable(getResource(otherVariantsToGet[i].pokemon.url))
        );
      }
    }
    return otherVariantPromises;
  };

  // Once all other variant promises have resolved, get the forms for those variants and update state
  updateOtherVariants = (pokemon, otherVariantPromises) => {
    Promise.all(otherVariantPromises)
      .then((promises) => {
        (async () => {
          let otherVariants = [];
          for (let i = 0; i < promises.length; i++) {
            try {
              let otherVariant = await promises[i].promise;
              let otherVariantPokemon = {
                species: pokemon.species,
                variant: otherVariant,
                form: {},
              };
              otherVariants.push(otherVariantPokemon);
            } catch (error) {
              errorHandler(error);
            }
          }
          otherVariants.forEach((pokemon) => {
            // Get the forms for each other variant pokemon
            let variantFormPromises = getFormPromises(pokemon);
            // Only once the form promises have resolved, add the forms to the variant
            Promise.all(variantFormPromises)
              .then((formPromises) => {
                (async () => {
                  for (let i = 0; i < formPromises.length; i++) {
                    try {
                      pokemon.variant.forms[i].details = await formPromises[i]
                        .promise;
                    } catch (error) {
                      errorHandler(error);
                    }
                  }
                  // Update the state for the other variants with their different forms
                  this.setState({
                    otherVariants: otherVariants,
                    otherVariantsReceived: true,
                  });
                })();
              })
              .catch((error) => {
                // Cancel the form promises
                if (variantFormPromises.length) {
                  variantFormPromises.forEach((promise) => {
                    cancelPromise(promise, errorHandler);
                  });
                }
                // Log the error
                errorHandler(error);
              });
          });
        })();
      })
      .catch((error) => {
        errorHandler(error);
      });
  };

  render() {
    const { pokemon, formsOfCurrentVariantReceived, refreshModal } = this.props;
    const { otherVariants } = this.state;

    const getFormsToDisplay = (
      currentPokemon,
      otherVariants,
      formsOfCurrentVariantReceived
    ) => {
      // Returns an array of pokemon objects for each form of the variant passed
      const getPokemonObjectsForEachForm = (pokemon) => {
        let pokemonObjectsArray = [];
        pokemon.variant.forms.forEach((form) => {
          pokemonObjectsArray.push({
            species: pokemon.species,
            variant: pokemon.variant,
            form: form,
          });
        });
        return pokemonObjectsArray;
      };

      // Array to hold all of the forms and variants of the current pokemon
      let allFormsAndVariants = [];

      // Add any forms of the current variant to the array of all forms and variants
      if (formsOfCurrentVariantReceived) {
        allFormsAndVariants.push(getPokemonObjectsForEachForm(currentPokemon));
      }

      // Add any forms of the other variants to the list for display
      if (otherVariants.length) {
        otherVariants.forEach((pokemon) => {
          allFormsAndVariants.push(getPokemonObjectsForEachForm(pokemon));
        });
      }

      // If there's no form, set the form ID to be the variant ID as it must be the default form
      if (
        Object.keys(currentPokemon.form).length === 0 ||
        !currentPokemon.form?.details
      ) {
        currentPokemon.form = { details: { id: currentPokemon.variant.id } };
      }

      // Returns a list of all other forms and variants for display, with the current form removed
      return allFormsAndVariants
        .flat()
        .filter(
          (pokemon) =>
            pokemon.form?.details?.id !== currentPokemon.form?.details?.id
        );
    };

    // Gets the description of the different forms, if it exists
    const getFormDescription = (pokemon) => {
      const formDescriptions = pokemon.species.form_descriptions;
      if (formDescriptions.length) {
        let formDescription;
        // Find the English description
        for (let i = 0; i < formDescriptions.length; i++) {
          if (formDescriptions[i].language.name === "en") {
            formDescription = formDescriptions[i].description;
          }
        }
        return <p>{formDescription}</p>;
      }
    };

    // Get the name of the current pokemon species
    const speciesName = getPokemonName(pokemon.species);

    // Gets the list of forms to display
    const otherFormsToDisplay = getFormsToDisplay(
      pokemon,
      otherVariants,
      formsOfCurrentVariantReceived
    );

    // If there are multiple forms of the pokemon, render the Other Forms section
    if (otherFormsToDisplay.length) {
      return (
        <ModalRow id="pokemon-forms">
          <ModalInfoItem label={`Other forms of ${speciesName}`}>
            {getFormDescription(pokemon)}
            <ModalColumn>
              <CardList
                pokemonList={otherFormsToDisplay}
                modal={true}
                clickHandler={refreshModal}
              />
            </ModalColumn>
          </ModalInfoItem>
        </ModalRow>
      );
    } else {
      return null;
    }
  }
}

export default PokemonOtherForms;
