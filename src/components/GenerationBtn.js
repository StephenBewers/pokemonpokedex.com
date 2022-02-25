import React from "react";
import "./GenerationBtn.scss";

const GenerationBtn = ({
  generation,
  filterBtnClick,
}) => {

  return (
    <span
      className={`generation-btn gen-${generation}`}
      onClick={() => filterBtnClick("generation", generation)}
    >
      Generation {generation}
    </span>
  );
};

export default GenerationBtn;