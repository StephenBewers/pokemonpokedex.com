import React from "react";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalInfoValue from "../Modal/ModalInfoValue";

const PokemonWeight = ({ pokemon }) => {
  // Gets the pokemon weight in kilograms
  const getWeightInKilograms = (weight) => {
    return weight / 10;
  };

  // Gets the pokemon weight in pounds
  const getWeightInPounds = (weight) => {
    return (getWeightInKilograms(weight) * 2.205).toFixed(1);
  };

  const weight = pokemon.variant.weight;
  const weightInKilos = getWeightInKilograms(weight);
  const weightInPounds = getWeightInPounds(weight);

  return (
    <ModalInfoItem label="Weight" id="pokemon-weight" subitem={true}>
      <ModalInfoValue value={weightInKilos} unit="kg"></ModalInfoValue>
      <ModalInfoValue
        value={weightInPounds}
        unit="lb"
        alternative={true}
      ></ModalInfoValue>
    </ModalInfoItem>
  );
};

export default PokemonWeight;