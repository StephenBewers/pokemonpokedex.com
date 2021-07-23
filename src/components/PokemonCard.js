import React from "react";
import Tilt from "react-parallax-tilt";
import "./PokemonCard.scss";
import { getNumberWithLeadingZeros, getName, getImage } from "../helpers.js";

const PokemonCard = ({ species, variant, form, modalCard, clickHandler }) => {
  // Determines the class to use for the card
  const cardClass = modalCard ? "modal-card" : "pokemon-card";

  // Get pokemon information for display on the card
  const number = getNumberWithLeadingZeros(
    species.pokedex_numbers[0].entry_number,
    3
  );
  const name = getName(species, form);
  const types = form?.details?.types?.length
    ? form.details.types
    : variant.types;
  const image = getImage(variant, form);

  const primaryTypeClass = `${types[0].type.name}-type`;

  // If the pokemon has a second type, get the second type class
  const secondaryTypeClass =
    types.length > 1 ? `${types[1].type.name}-secondary` : "";

  // Hide the pokemon number for modal cards
  const numberClass =
    cardClass !== "modal-card" ? "pokemon-number" : "hidden-number";

  return (
    <div
      role="button"
      onClick={clickHandler.bind(this, {
        species: species,
        variant: variant,
        form: form,
      })}
    >
      <Tilt
        className={`${cardClass} ${primaryTypeClass} ${secondaryTypeClass}`}
        perspective={500}
        glareEnable={true}
        glareMaxOpacity={0.45}
        scale={1.02}
      >
        <span className={`${numberClass}`}>{number}</span>
        <img src={image} alt={name} />
        <span className="pokemon-name">{name}</span>
      </Tilt>
    </div>
  );
};

export default PokemonCard;
