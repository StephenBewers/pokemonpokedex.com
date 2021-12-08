import React from "react";
import "./PokemonDescription.scss";

const PokemonDescription = ({ pokemon }) => {
  // Gets the description in English
  const getDescriptionText = (descriptionsArray) => {
    let descriptionString = "";
    descriptionsArray.forEach((description) => {
      // We prefer the Omega-Ruby description as it's more detailed
      if (description.language.name === "en" && description.version.name === "omega-ruby") {
        descriptionString = description.flavor_text;
      }
      // But if there is no Omega-Ruby description, just get the first English description
      else if (description.language.name === "en" && descriptionString === "") {
        descriptionString = description.flavor_text;
      }
    });
    return descriptionString;
  };

  const description = getDescriptionText(pokemon.species.flavor_text_entries);

  return <p id="pokemon-description">{description}</p>;
};

export default PokemonDescription;
