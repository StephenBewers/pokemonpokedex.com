import React from "react";
import "./FilterToggleBtn.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilter, faTimes } from "@fortawesome/free-solid-svg-icons";

const FilterToggleBtn = ({ active, clickHandler }) => {
  const activeClass = active ? "active" : "inactive";

  const getIcon = (active) => {
    if (active) {
      return <FontAwesomeIcon icon={faTimes} />;
    } else {
      return <FontAwesomeIcon icon={faFilter} />;
    }
  };

  return (
    <div
      className={`btn-filter ${activeClass}`}
      role="button"
      onClick={clickHandler}
    >
      {getIcon(active)}
    </div>
  );
};

export default FilterToggleBtn;
