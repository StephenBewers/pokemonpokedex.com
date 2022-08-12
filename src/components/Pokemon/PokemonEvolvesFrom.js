import React, { useState, useEffect } from "react";
import LoadingBarSmall from "../LoadingSpinnerSmall";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalColumn from "../Modal/ModalColumn";
import CardList from "../CardList";
import PokemonEggGroups from "./PokemonEggGroups";
import { getResource } from "../../utils/pokeApiUtils";
import { isGalarianEvolution } from "../../utils/pokemonUtils";

const PokemonEvolvesFrom = ({ pokemon, clickHandler }) => {
  const [evolvesFromPokemon, setEvolvesFromPokemon] = useState({});

  useEffect(() => {
    let mounted = true;
    let controller = new AbortController();

    const currentVariant = pokemon.variant;
    let currentForm = pokemon.form;

    let evolvesFromSpecies = pokemon.species.evolves_from_species;
    let evolvesFromVariant = { details: {} };
    let evolvesFromForm = { details: {} };
    let evolvesFromPokemon = {};

    // Fetch the default evolves from variant
    const getDefaultVariantUrl = (evolvesFromSpecies) => {
      for (let i = 0; i < evolvesFromSpecies.details.varieties.length; i++) {
        if (evolvesFromSpecies.details.varieties[i].is_default) {
          return evolvesFromSpecies.details.varieties[i].pokemon.url;
        }
      }
    };

    // Check if the current variant is a Galarian evolution
    if (isGalarianEvolution(currentVariant.id)) {
      currentForm.details
        ? (currentForm.details.form_name = "galar")
        : (currentForm = { details: { form_name: "galar" } });
    }

    // Fetch the evolves from species
    (async () => {
      if (evolvesFromSpecies?.hasOwnProperty("url")) {
        try {
          evolvesFromSpecies.details = await getResource(
            `${evolvesFromSpecies.url}`,
            {
              signal: controller.signal,
            }
          );
        } catch (error) {
          console.error(error);
        }

        // If the current modal pokemon has a form and that form has a non-blank name (i.e. not a default pokemon)
        if (currentForm.details?.form_name) {
          const formName = currentForm.details.form_name;

          // If there are multiple variants we'll need to find the one that corresponds to the form name
          if (evolvesFromSpecies.details.varieties.length > 1) {
            let matchingVariant = false;

            // Loop through the evolves from species to find if there is a matching variant
            for (
              let i = 0;
              i < evolvesFromSpecies.details.varieties.length;
              i++
            ) {
              if (
                evolvesFromSpecies.details.varieties[i].pokemon.name ===
                `${evolvesFromSpecies.name}-${formName}`
              ) {
                // Get the evolves from variant
                try {
                  evolvesFromVariant.details = await getResource(
                    `${evolvesFromSpecies.details.varieties[i].pokemon.url}`,
                    {
                      signal: controller.signal,
                    }
                  );
                } catch (error) {
                  console.error(error);
                }
                // Get the evolves from form
                try {
                  evolvesFromForm.details = await getResource(
                    `https://pokeapi.co/api/v2/pokemon-form/${evolvesFromSpecies.name}-${formName}`,
                    {
                      signal: controller.signal,
                    }
                  );
                } catch (error) {
                  console.error(error);
                }
                // Set the matching variant flag to true
                matchingVariant = true;
              }
            }

            // If there isn't a variant with the same form name, get the default
            if (!matchingVariant) {
              try {
                evolvesFromVariant.details = await getResource(
                  getDefaultVariantUrl(evolvesFromSpecies),
                  {
                    signal: controller.signal,
                  }
                );
              } catch (error) {
                console.error(error);
              }
            }
          }

          // Otherwise, there is only one variant and we can get that one and the corresponding form
          else {
            // Get the evolves from variant
            try {
              evolvesFromVariant.details = await getResource(
                `${evolvesFromSpecies.details.varieties[0].pokemon.url}`,
                {
                  signal: controller.signal,
                }
              );
              evolvesFromForm.details = await getResource(
                `https://pokeapi.co/api/v2/pokemon-form/${evolvesFromSpecies.name}-${formName}`,
                {
                  signal: controller.signal,
                }
              );
            } catch (error) {
              console.error(error);
            }
          }
        }

        // If not, the current modal pokemon must be the default variant
        else {
          try {
            evolvesFromVariant.details = await getResource(
              getDefaultVariantUrl(evolvesFromSpecies),
              {
                signal: controller.signal,
              }
            );
          } catch (error) {
            console.error(error);
          }
        }

        evolvesFromPokemon = {
          species: evolvesFromSpecies.details,
          variant: evolvesFromVariant.details,
          form: evolvesFromForm,
        };
      }

      if(mounted) {
        setEvolvesFromPokemon({ ...evolvesFromPokemon });
      }
    })();
    
    // Cleanup on unmount
    return (() => {
      controller?.abort();
      mounted = false;
    });
  }, [pokemon]);

  // Displays the pokemon the current pokemon evolves from
  const displayEvolvesFromPokemon = (pokemon, evolvesFromPokemon) => {
    if (evolvesFromPokemon?.hasOwnProperty("species")) {
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
      !evolvesFromPokemon?.hasOwnProperty("species")
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

  return displayEvolvesFromPokemon(pokemon, evolvesFromPokemon);
};

export default PokemonEvolvesFrom;
