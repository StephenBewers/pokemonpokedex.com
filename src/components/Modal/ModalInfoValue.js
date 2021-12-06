import React from "react";
import "./ModalInfoValue.scss";

const ModalInfoValue = ({ value, unit, alternative }) => {

    // If the value is an alternative, add this to the class name and render differently
    let alternativeClassName = "";
    if (alternative) {
        alternativeClassName = "alternative-";
    }

  // If a unit has been supplied, provide the JSX for the unit
  const renderUnit = (unit) => {
    if (unit) {
      return <span className={`modal-info-${alternativeClassName}unit`}>{unit}</span>;
    }
  };

  return (
      <span className={`modal-info-${alternativeClassName}value`}>
        {value}
        {renderUnit(unit)}
      </span>
  );
};

export default ModalInfoValue;
