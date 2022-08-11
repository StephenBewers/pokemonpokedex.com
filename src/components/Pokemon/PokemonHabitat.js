import React, { useState, useEffect } from "react";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalInfoValue from "../Modal/ModalInfoValue";
import { getResource } from "../../utils/pokeApiUtils";
import { getEnglishContent, textCleanup } from "../../utils/pokemonUtils";

const PokemonHabitat = ({ pokemon }) => {
  const [habitat, setHabitat] = useState(pokemon.species.habitat);

  // Fetch habitat from the API if the pokemon has changed
  useEffect(() => {
    const habitat = pokemon.species.habitat;
    (async () => {
      if (habitat?.hasOwnProperty("url")) {
        try {
          habitat.details = await getResource(`${habitat.url}`);
        } catch (error) {
          console.error(error);
        }
      }
      setHabitat(habitat);
    })();
  }, [pokemon]);

  // Gets the habitat name
  const getHabitatName = (habitat, pokemon) => {
    let habitatName;
    // If it's a battle-only pokemon, display the habitat as battle
    if (pokemon.form?.details?.is_battle_only) {
      habitatName = "Battle";
    }
    // If the habitat has been received, display the clean habitat name
    else if (habitat.details) {
      habitatName = getEnglishContent(habitat.details.names, "name");
    }
    // Otherwise do a cleanup of the dirty habitat name
    else {
      habitatName = textCleanup(habitat.name);
    }
    return habitatName;
  };

  // Only render the habitat if there is a habitat to render
  if (habitat) {
    return (
      <ModalInfoItem label="Habitat" id="pokemon-habitat" subitem={true}>
        <ModalInfoValue
          value={getHabitatName(habitat, pokemon)}
        ></ModalInfoValue>
      </ModalInfoItem>
    );
  } else {
    return null;
  }
};

export default PokemonHabitat;
