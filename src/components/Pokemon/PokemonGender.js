import React from "react";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalInfoValue from "../Modal/ModalInfoValue";

const PokemonGender = ({ pokemon }) => {
  // Get the female gender percentage
  const getFemalePercent = (genderRate) => {
    let femalePercent = (genderRate / 8) * 100;
    return femalePercent % 1 === 0 ? femalePercent : femalePercent.toFixed(1);
  };

  // Get the male gender percentage
  const getMalePercent = (femalePercent) => {
    let malePercent = 100 - femalePercent;
    return malePercent % 1 === 0 ? malePercent : malePercent.toFixed(1);
  };

  // Get the gender rates for rendering
  const getGenderSplit = (genderRate) => {
    if (genderRate === -1) {
      return <ModalInfoValue value={`No gender`}></ModalInfoValue>;
    } else {
      return (
        <>
          <ModalInfoValue
            value={`\u{2640} ${femalePercent}`}
            unit="%"
          ></ModalInfoValue>
          <ModalInfoValue
            value={`\u{2642} ${malePercent}`}
            unit="%"
          ></ModalInfoValue>
        </>
      );
    }
  };

  const genderRate = pokemon.species.gender_rate;
  const femalePercent = getFemalePercent(genderRate);
  const malePercent = getMalePercent(femalePercent);

  return (
    <ModalInfoItem label="Gender" id="pokemon-gender" subitem={true}>
      {getGenderSplit(genderRate)}
    </ModalInfoItem>
  );
};

export default PokemonGender;