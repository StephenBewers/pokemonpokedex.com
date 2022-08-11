import React, { useState, useEffect } from "react";
import LoadingBarSmall from "../LoadingSpinnerSmall";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalColumn from "../Modal/ModalColumn";
import ModalRow from "../Modal/ModalRow";
import CardList from "../CardList";
import { getResource } from "../../utils/pokeApiUtils";
import { getPokemonName, isGalarianEvolution } from "../../utils/pokemonUtils";

const PokemonEvolvesTo = ({ pokemon, clickHandler }) => {
  const [evolvesToPokemonArray, setEvolvesToPokemonArray] = useState([]);
  const [hasEvolutions, setHasEvolutions] = useState(true);

  useEffect(() => {
    const currentSpecies = pokemon.species;
    const currentForm = pokemon.form;

    let evolutionChain = pokemon.species.evolution_chain;
    let evolvesToSpeciesArray = [];
    let evolvesToPokemonArray = [];
    let trueEvolutionsArray = [];
    let impossibleEvolutionsArray = [];

    // Fetch the default evolves to variant
    const getDefaultVariantUrl = (evolvesToSpecies) => {
      for (let i = 0; i < evolvesToSpecies.details.varieties.length; i++) {
        if (evolvesToSpecies.details.varieties[i].is_default) {
          return evolvesToSpecies.details.varieties[i].pokemon.url;
        }
      }
    };

    // Fetch the evolves from species
    (async () => {
      if (evolutionChain?.hasOwnProperty("url")) {
        try {
          evolutionChain.details = await getResource(`${evolutionChain.url}`);
        } catch (error) {
          console.error(error);
        }

        const primaryPokemon = evolutionChain.details.chain.species;
        const secondaryPokemonArray = evolutionChain.details.chain.evolves_to;

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

        // If the evolves to species array is empty, this pokemon has no evolutions so update state
        if (!evolvesToSpeciesArray.length) {
          setHasEvolutions(false);
        }
        // Else, we know the pokemon does have evolutions so get the evolves to species
        else {
          // Get the species object from the API for each species the current pokemon could evolve to
          for (let evolvesToSpecies of evolvesToSpeciesArray) {
            let evolvesToVariant = { details: {} };
            let evolvesToForm = { details: {} };

            if (evolvesToSpecies.species?.hasOwnProperty("url")) {
              try {
                evolvesToSpecies.details = await getResource(
                  `${evolvesToSpecies.species.url}`
                );
              } catch (error) {
                console.error(error);
              }
            }

            // If the current modal pokemon has a form and that form has a non-blank name (i.e. not a default pokemon)
            if (currentForm.details?.form_name) {
              const formName = currentForm.details.form_name;

              // If there are multiple variants we'll need to find the one that corresponds to the form name
              if (evolvesToSpecies.details.varieties.length > 1) {
                // Loop through the evolves to species to find if there is a matching variant
                for (
                  let i = 0;
                  i < evolvesToSpecies.details.varieties.length;
                  i++
                ) {
                  // If there is a variant with the same form name
                  if (
                    evolvesToSpecies.details.varieties[i].pokemon.name ===
                    `${evolvesToSpecies.details.name}-${formName}`
                  ) {
                    try {
                      // Get the variant details
                      evolvesToVariant.details = await getResource(
                        `${evolvesToSpecies.details.varieties[i].pokemon.url}`
                      );
                      // Get the form details
                      evolvesToForm.details = await getResource(
                        `https://pokeapi.co/api/v2/pokemon-form/${evolvesToSpecies.details.name}-${formName}`
                      );
                    } catch (error) {
                      console.error(error);
                    }
                    // Add this evolution to the pokemon array
                    evolvesToPokemonArray.push({
                      species: evolvesToSpecies.details,
                      variant: evolvesToVariant.details,
                      form: evolvesToForm,
                    });
                  }
                }

                // If there isn't a variant with the same form name, get the default
                if (!evolvesToPokemonArray.length) {
                  try {
                    evolvesToVariant.details = await getResource(
                      getDefaultVariantUrl(evolvesToSpecies)
                    );
                  } catch (error) {
                    console.error(error);
                  }

                  // Add this evolution to the pokemon array (even though in this case the form is empty)
                  evolvesToPokemonArray.push({
                    species: evolvesToSpecies.details,
                    variant: evolvesToVariant.details,
                    form: evolvesToForm,
                  });
                }
              }

              // Otherwise, there is only one variant and we can get that one and the corresponding form
              else {
                try {
                  // Get the variant details
                  evolvesToVariant.details = await getResource(
                    `${evolvesToSpecies.details.varieties[0].pokemon.url}`
                  );
                  // Get the form details
                  evolvesToForm.details = await getResource(
                    `https://pokeapi.co/api/v2/pokemon-form/${evolvesToSpecies.details.name}-${formName}`
                  );
                } catch (error) {
                  console.error(error);
                }

                // Add this evolution to the pokemon array
                evolvesToPokemonArray.push({
                  species: evolvesToSpecies.details,
                  variant: evolvesToVariant.details,
                  form: evolvesToForm,
                });
              }
            }

            // If not, the current modal pokemon must be the default variant
            else {
              try {
                evolvesToVariant.details = await getResource(
                  getDefaultVariantUrl(evolvesToSpecies)
                );
              } catch (error) {
                console.error(error);
              }

              // Add this evolution to the pokemon array (even though in this case the form is empty)
              evolvesToPokemonArray.push({
                species: evolvesToSpecies.details,
                variant: evolvesToVariant.details,
                form: evolvesToForm,
              });
            }
          }

          // Remove the impossible evolutions from the array
          for (let evolvesToPokemon of evolvesToPokemonArray) {
            // If the pokemon matches these conditions it is a genuine evolution and can be added
            if (
              (!isGalarianEvolution(evolvesToPokemon.variant.id) &&
                currentForm?.details?.form_name !== "galar") ||
              (evolvesToPokemon.form.details?.form_name === "galar" &&
                currentForm?.details?.form_name === "galar") ||
              (isGalarianEvolution(evolvesToPokemon.variant.id) &&
                currentForm?.details?.form_name === "galar")
            ) {
              trueEvolutionsArray.push(evolvesToPokemon);
            }

            // Else, keep count of any impossible evolutions
            else {
              impossibleEvolutionsArray.push(evolvesToPokemon);
            }
          }

          // If all of the evolutions have been checked, update state
          if (
            trueEvolutionsArray.length ===
            evolvesToPokemonArray.length - impossibleEvolutionsArray.length
          ) {
            // If there are no non-Galarian evolutions, update the state to has no evolutions
            if (trueEvolutionsArray.length === 0) {
              setHasEvolutions(false);
            } else {
              // Ensure the array is in the correct order first
              trueEvolutionsArray.sort((a, b) => a.species.id - b.species.id);
              setEvolvesToPokemonArray(trueEvolutionsArray);
            }
          }
        }
      }
    })();
  }, [pokemon]);

  // Displays the pokemon the current pokemon evolves into
  const displayEvolvesToPokemon = (
    pokemon,
    evolvesToPokemonArray,
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
    else if (hasEvolutions && evolvesToPokemonArray.length) {
      // If there are more than 2 possible evolutions, display as a row underneath the evolves from pokemon
      if (evolvesToPokemonArray.length > 2) {
        return (
          <ModalRow>
            <ModalInfoItem label="Evolves into" subitem={true}>
              <CardList
                pokemonList={evolvesToPokemonArray}
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
                pokemonList={evolvesToPokemonArray}
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

  return displayEvolvesToPokemon(pokemon, evolvesToPokemonArray, hasEvolutions);
};

export default PokemonEvolvesTo;
