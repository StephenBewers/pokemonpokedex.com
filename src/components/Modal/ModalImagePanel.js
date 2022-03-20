import React from "react";
import "./ModalImagePanel.scss";
import {
  getNumberWithLeadingZeros,
  getPokemonName,
  getImage,
} from "../../utils/pokemonUtils";

const ModalImagePanel = ({ pokemon }) => {
  let number;
  let name;
  let types = {};
  let image;
  let primaryTypeClass;
  let secondaryTypeClass;

  // If a pokemon has been provided, get pokemon information for display
  if (pokemon) {
    number = getNumberWithLeadingZeros(
      pokemon.species.pokedex_numbers[0].entry_number,
      3
    );

    name = getPokemonName(pokemon.species, pokemon.form);

    types = pokemon.form?.details?.types?.length
      ? pokemon.form.details.types
      : pokemon.variant.types;

    image = getImage(pokemon.variant, pokemon?.form);

    primaryTypeClass = `${types[0].type.name}-type`;

    secondaryTypeClass =
      types.length > 1 ? `${types[1].type.name}-secondary` : "";
  }

  // Renders the image panel depending on if a pokemon has been provided or not
  const renderImagePanel = () => {
    if (pokemon) {
      return (
        <div
          className={`modal-img-panel ${primaryTypeClass} ${secondaryTypeClass}`}
        >
          <span className="modal-top-heading">{number}</span>
          <img src={image} alt={name} />
          <h2 className="modal-bottom-heading">{name}</h2>
        </div>
      );
    } else {
      let greeting;
      let today = new Date();
      let hour = today.getHours();

      // Define the greeting based on time of day
      if (hour < 12) {
        greeting = "Good morning!";
      } else if (hour < 17) {
        greeting = "Good afternoon!";
      } else {
        greeting = "Good evening!";
      }

      return (
        <div className={`modal-img-panel menu-modal-img`}>
          <span className="modal-top-heading">{greeting}</span>
        </div>
      );
    }
  };

  return renderImagePanel(pokemon);
};

export default ModalImagePanel;
