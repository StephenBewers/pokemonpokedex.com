import React from "react";
import "./GenerationBtn.scss";

const GenerationBtn = ({
  generation,
  filterBtnClick,
}) => {

  return (
    <button
      className={`generation-btn gen-${generation}`}
      type="button"
      onClick={() => filterBtnClick("generation", generation)}
    >
      Generation {generation}
    </button>
  );
};

export default GenerationBtn;