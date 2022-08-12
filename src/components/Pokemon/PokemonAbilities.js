import React, { useState, useEffect } from "react";
import "./PokemonAbilities.scss";
import LoadingBarSmall from "../LoadingSpinnerSmall";
import ModalRow from "../Modal/ModalRow";
import ModalInfoItem from "../Modal/ModalInfoItem";
import { getResource } from "../../utils/pokeApiUtils";
import { getEnglishContent, textCleanup } from "../../utils/pokemonUtils";

const PokemonAbilities = ({ pokemon }) => {
  const [abilities, setAbilities] = useState(pokemon.variant.abilities);

  // Fetch abilities from the API if the pokemon has changed
  useEffect(() => {
    let mounted = true;
    let controller = new AbortController();

    const abilitiesArray = pokemon.variant.abilities;

    (async () => {
      if (abilitiesArray.length) {
        for (let i = 0; i < abilitiesArray.length; i++) {
          try {
            abilitiesArray[i].details = await getResource(
              `${abilitiesArray[i].ability.url}`,
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
        setAbilities([...abilitiesArray]);
      }
    })();

    // Cleanup on unmount
    return (() => {
      controller?.abort();
      mounted = false;
    });
  }, [pokemon]);

  // If the details of the ability have been received, return the English name
  const getAbilityName = (ability) => {
    if (ability.details) {
      return getEnglishContent(ability.details.names, "name");
    }
    // If the description of the ability haven't been received, return a cleanup of the dirty ability name
    else {
      return textCleanup(ability.ability.name);
    }
  };

  // If the details of the ability have been received, return the English description
  const getAbilityDescription = (ability) => {
    if (ability.details) {
      return (
        <p className={`pokemon-ability-description`}>
          {getEnglishContent(ability.details.effect_entries, "short_effect")}
        </p>
      );
    }
    // If the details of the ability haven't been received, return a loading bar
    else {
      return <LoadingBarSmall></LoadingBarSmall>;
    }
  };

  // Renders the hidden ability label
  const isHidden = (ability) => {
    if (ability.is_hidden) {
      return (
        <>
          &nbsp;<span className="hidden-ability-label">Hidden</span>
        </>
      );
    }
  };

  return (
    <ModalRow id="pokemon-abilities">
      <ModalInfoItem label="Abilities">
        {abilities.map((ability, i) => {
          return (
            <details className={`pokemon-ability`} key={i}>
              <summary>
                {getAbilityName(ability)}
                {isHidden(ability)}
              </summary>
              {getAbilityDescription(ability)}
            </details>
          );
        })}
      </ModalInfoItem>
    </ModalRow>
  );
};

export default PokemonAbilities;
