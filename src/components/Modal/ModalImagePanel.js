import React from "react";
import "./ModalImagePanel.scss";
import { getNumberWithLeadingZeros, getPokemonName, getImage } from "../../helpers.js";

const ModalImagePanel = ({ pokemon }) => {
  // Get pokemon information for display on the card
  const number = getNumberWithLeadingZeros(
    pokemon.species.pokedex_numbers[0].entry_number,
    3
  );
  const name = getPokemonName(pokemon.species, pokemon.form);
  const types = (pokemon.form?.details?.types?.length) ? pokemon.form.details.types : pokemon.variant.types;
  const image = getImage(pokemon.variant, pokemon.form);

  const primaryTypeClass = `${types[0].type.name}-type`;

  // If the pokemon has a second type, get the second type class for modal image panel background
  const secondaryTypeClass =
    types.length > 1 ? `${types[1].type.name}-secondary` : "";

  return (
    <div
      className={`modal-img-panel ${primaryTypeClass} ${secondaryTypeClass}`}
    >
      <span className="pokemon-number">{number}</span>
      <img src={image} alt={name} />
      <h2 className="pokemon-name">{name}</h2>
    </div>
  );
};

export default ModalImagePanel;
