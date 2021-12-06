import React from "react";
import ModalInfoItem from "../Modal/ModalInfoItem";
import ModalInfoValue from "../Modal/ModalInfoValue";

const PokemonCatchRate = ({ pokemon }) => {

    // Gets the catch rate as a percentage
    const getCatchPercent = (catchRate) => {
        return ((catchRate / 255) * 100).toFixed(2);
      };
      
    const catchRate = pokemon.species.capture_rate;
    const catchPercent = getCatchPercent(catchRate);

    // If the pokemon can be caught (i.e. isn't battle-only) render the catch rate.
    if (!pokemon.form?.details?.is_battle_only) {
        return (
          <ModalInfoItem
            label="Catch rate"
            id="pokemon-catch-rate"
            subitem={true}
          >
            <ModalInfoValue value={catchRate}></ModalInfoValue>
            <ModalInfoValue
              value={`~ ${catchPercent}`}
              unit="%"
              alternative={true}
            ></ModalInfoValue>
          </ModalInfoItem>
        );
      } else {
        return null;
      }
}

export default PokemonCatchRate;