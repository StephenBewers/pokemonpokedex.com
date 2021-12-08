import React from "react";
import "./ModalRibbon.scss";

const ModalRibbon = ({ pokemon }) => {
  // Define the ribbon type depending on if the pokemon species is a baby, legendary or mythical pokemon.
  let ribbonType;
  if (pokemon.species.is_baby) {
    ribbonType = "baby";
  } else if (pokemon.species.is_legendary) {
    ribbonType = "legendary";
  } else if (pokemon.species.is_mythical) {
    ribbonType = "mythical";
  } else {
    // If the pokemon is neither baby, legendary or mythical, we won't show the ribbon
    ribbonType = "hidden";
  }

  return <div className={`modal-ribbon`}><span className={ribbonType}>{ribbonType}</span></div>;
};

export default ModalRibbon;
