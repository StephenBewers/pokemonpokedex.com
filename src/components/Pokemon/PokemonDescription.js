import React from "react";
import "./PokemonDescription.scss";

const PokemonDescription = ({ pokemon }) => {
  // Gets the Omega-Ruby description in English
  const getDescriptionText = (descriptionsArray) => {
    let descriptionString = "";
    descriptionsArray.forEach((description) => {
      if (
        description.language.name === "en" &&
        description.version.name === "omega-ruby"
      ) {
        descriptionString = description.flavor_text;
      }
    });
    return descriptionString;
  };

  const description = getDescriptionText(pokemon.species.flavor_text_entries);

  return <p id="pokemon-description">{description}</p>;
};

export default PokemonDescription;
