import React, { useState, useEffect } from "react";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalInfoValue from "../Modal/ModalInfoValue";
import { getResource } from "../../utils/pokeApiUtils";
import { getEnglishContent, textCleanup } from "../../utils/pokemonUtils";

const PokemonGrowthRate = ({ pokemon }) => {
  const [growthRate, setGrowthRate] = useState(pokemon.species.growth_rate);

  // Fetch growth rate from the API if the pokemon has changed
  useEffect(() => {
    const growthRate = pokemon.species.growth_rate;
    (async () => {
      if (growthRate?.hasOwnProperty("url")) {
        try {
          growthRate.details = await getResource(`${growthRate.url}`);
        } catch (error) {
          console.error(error);
        }
      }
      setGrowthRate(growthRate);
    })();
  }, [pokemon]);

  // Gets the growth rate description
  const getGrowthRateDescription = (growthRate) => {
    let growthRateDescription;
    // If the growth rate details have been received display the clean description
    if (growthRate.details) {
      growthRateDescription = getEnglishContent(
        growthRate.details.descriptions,
        "description"
      );
    }
    // Otherwise do a cleanup of the dirty growth rate name
    else {
      growthRateDescription = textCleanup(growthRate.name);
    }
    return growthRateDescription;
  };

  // Only render the growth rate if the pokemon is not battle-only as battle-only pokemon do not grow
  if (!pokemon.form?.details?.is_battle_only) {
    return (
      <ModalInfoItem
        label="Growth rate"
        id="pokemon-growth-rate"
        subitem={true}
      >
        <ModalInfoValue
          value={getGrowthRateDescription(growthRate)}
        ></ModalInfoValue>
      </ModalInfoItem>
    );
  } else {
    return null;
  }
};

export default PokemonGrowthRate;
