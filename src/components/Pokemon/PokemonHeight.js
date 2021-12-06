import React from "react";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalInfoValue from "../Modal/ModalInfoValue";

const PokemonHeight = ({ pokemon }) => {
  // Gets the pokemon height in metres
  const getHeightInMetres = (height) => {
    return height / 10;
  };

  // Gets the pokemon height in feet
  const getHeightInFeet = (height) => {
    return getHeightInMetres(height) * 3.28084;
  };

  // Gets the remaining inches from the pokemon height in feet
  const getHeightRemainingInches = (height) => {
    return (getHeightInMetres(height) % 1) * 12;
  };

  const height = pokemon.variant.height;
  const heightInMetres = getHeightInMetres(height);
  const heightInFeetInches = `${parseInt(getHeightInFeet(height))}' ${parseInt(
    getHeightRemainingInches(height)
  )}"`;

  return (
    <ModalInfoItem label="Height" id="pokemon-height" subitem={true}>
      <ModalInfoValue value={heightInMetres} unit="m"></ModalInfoValue>
      <ModalInfoValue
        value={heightInFeetInches}
        unit="ft/in"
        alternative={true}
      ></ModalInfoValue>
    </ModalInfoItem>
  );
};

export default PokemonHeight;
