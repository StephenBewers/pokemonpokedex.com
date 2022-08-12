import React, { useState, useEffect } from "react";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalInfoValue from "../Modal/ModalInfoValue";
import { getResource } from "../../utils/pokeApiUtils";
import { getEnglishContent, textCleanup } from "../../utils/pokemonUtils";

const PokemonEggGroups = ({ pokemon }) => {
  const [eggGroups, setEggGroups] = useState(pokemon.species.egg_groups);

  // Fetch egg groups from the API if the pokemon has changed
  useEffect(() => {
    let mounted = true;
    let controller = new AbortController();

    const eggGroupsArray = pokemon.species.egg_groups;

    (async () => {
      if (eggGroupsArray.length) {
        for (let i = 0; i < eggGroupsArray.length; i++) {
          try {
            eggGroupsArray[i].details = await getResource(
              `${eggGroupsArray[i].url}`,
              {
                signal: controller.signal,
              }
            );
          } catch (error) {
            console.error(error);
          }
        }
      }
      
      if(mounted) {
        setEggGroups([...eggGroupsArray]);
      }
    })();
    
    // Cleanup on unmount
    return (() => {
      controller?.abort();
      mounted = false;
    });
  }, [pokemon]);

  // If the details of the eggGroup have been received, return the English name
  const getEggGroupName = (eggGroup) => {
    if (eggGroup.details) {
      return getEnglishContent(eggGroup.details.names, "name");
    }
    // If the details of the eggGroup haven't been received, return a cleanup of the dirty eggGroup name
    else {
      return textCleanup(eggGroup.name);
    }
  };

  return (
    <ModalInfoItem
      label="Hatches from egg groups"
      id="modal-hatches-from"
      subitem={true}
    >
      {eggGroups.map((eggGroup, i) => {
        return (
          <ModalInfoValue
            value={`\u{1F95A} ${getEggGroupName(eggGroup)}`}
            key={i}
          ></ModalInfoValue>
        );
      })}
    </ModalInfoItem>
  );
};

export default PokemonEggGroups;
