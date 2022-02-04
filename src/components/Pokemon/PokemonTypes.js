import React from "react";
import "./PokemonTypes.scss";
import PokemonTypeBtn from "./PokemonTypeBtn";
import ModalInfoItem from "../Modal/ModalInfoItem";

const PokemonTypes = ({ pokemon, typeBtnClick }) => {
  // If the pokemon object has a form, we'll get the types from that
  // If not, we'll get the types from the variant instead
  const types = pokemon.form?.details?.types?.length
    ? pokemon.form.details.types
    : pokemon.variant.types;

  return (
    <ModalInfoItem label="Types" id="pokemon-types" subitem={true}>
      {types.map((type, i) => {
        return (
          <PokemonTypeBtn
            type={type.type.name}
            key={`type-btn-${i}`}
            typeBtnClick={typeBtnClick}
          ></PokemonTypeBtn>
        );
      })}
    </ModalInfoItem>
  );
};

export default PokemonTypes;
