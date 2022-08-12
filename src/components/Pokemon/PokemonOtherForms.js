import React, { useState, useEffect } from "react";
import "./PokemonOtherForms.scss";
import ModalRow from "../Modal/ModalRow";
import ModalColumn from "../Modal/ModalColumn";
import ModalInfoItem from "../Modal/ModalInfoItem";
import CardList from "../CardList";
import { getResource } from "../../utils/pokeApiUtils";
import { getPokemonName } from "../../utils/pokemonUtils";

const PokemonOtherForms = ({
  pokemon,
  formsOfCurrentVariantReceived,
  refreshModal,
}) => {
  const [otherVariants, setOtherVariants] = useState([]);

  // Fetch other forms from the API if the pokemon has changed
  useEffect(() => {
    let mounted = true;
    let controller = new AbortController();

    const currentVariant = pokemon.variant;
    const otherVariantsToGet = pokemon.species.varieties.filter(
      (variant) => variant.pokemon.name !== currentVariant.name
    );
    let otherVariantsArray = [];

    (async () => {
      if (otherVariantsToGet.length) {
        // Get each of the other variants first
        for (let i = 0; i < otherVariantsToGet.length; i++) {
          let otherVariant = { species: pokemon.species };
          try {
            otherVariant.variant = await getResource(
              `${otherVariantsToGet[i].pokemon.url}`,
              {
                signal: controller.signal,
              }
            );
          } catch (error) {
            console.error(error);
          }
          otherVariantsArray.push(otherVariant);
        }

        // Now get the other forms of each variant
        for (let i = 0; i < otherVariantsArray.length; i++) {
          const otherFormsToGet = otherVariantsArray[i].variant.forms;
          if (otherFormsToGet.length) {
            for (let ii = 0; ii < otherFormsToGet.length; ii++) {
              try {
                otherVariantsArray[i].variant.forms[ii].details =
                  await getResource(`${otherFormsToGet[ii].url}`,
                  {
                    signal: controller.signal,
                  });
              } catch (error) {
                console.error(error);
              }
            }
          }
        }

        if(mounted) {
          setOtherVariants([...otherVariantsArray]);
        }
      }
    })();
    
    // Cleanup on unmount
    return (() => {
      controller?.abort();
      mounted = false;
    });
  }, [pokemon]);

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
    if (
      formsOfCurrentVariantReceived &&
      currentPokemon.variant.forms.length > 1
    ) {
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
              isModal={true}
              clickHandler={refreshModal}
            />
          </ModalColumn>
        </ModalInfoItem>
      </ModalRow>
    );
  } else {
    return null;
  }
};

export default PokemonOtherForms;
