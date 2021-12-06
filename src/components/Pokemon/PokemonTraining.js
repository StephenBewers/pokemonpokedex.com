import React from "react";
import "./PokemonTraining.scss";
import ModalRow from "../Modal/ModalRow";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalInfoValue from "../Modal/ModalInfoValue";
import PokemonGrowthRate from "./PokemonGrowthRate";

const PokemonTraining = ({ pokemon }) => {
  const baseExperience = pokemon.variant.base_experience;
  const baseFriendship = pokemon.species.base_happiness;

  return (
    <ModalRow id="pokemon-training">
      <ModalInfoItem label="Training">
        <ModalRow>
          <ModalInfoItem
            label="Base Experience"
            id="pokemon-base-exp"
            subitem={true}
          >
            <ModalInfoValue value={baseExperience}></ModalInfoValue>
          </ModalInfoItem>
          <ModalInfoItem
            label="Base Friendship"
            id="pokemon-base-friendship"
            subitem={true}
          >
            <ModalInfoValue value={baseFriendship}></ModalInfoValue>
          </ModalInfoItem>
          <PokemonGrowthRate pokemon={pokemon} />
        </ModalRow>
      </ModalInfoItem>
    </ModalRow>
  );
};

export default PokemonTraining;
