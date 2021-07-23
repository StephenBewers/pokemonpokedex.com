import React from "react";
import "./ModalImagePanel.scss";
import { getNumberWithLeadingZeros, getName, getImage } from "../helpers.js";

const ModalImagePanel = ({ species, variant, form }) => {
  // Get pokemon information for display on the card
  const number = getNumberWithLeadingZeros(
    species.pokedex_numbers[0].entry_number,
    3
  );
  const name = getName(species, form);
  const types = (form?.details?.types?.length) ? form.details.types : variant.types;
  const image = getImage(variant, form);

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
