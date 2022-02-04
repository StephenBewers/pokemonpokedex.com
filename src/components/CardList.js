import React from "react";
import "./CardList.scss";
import Card from "./Card";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const CardList = ({
  pokemonList,
  title,
  isModal,
  clickHandler,
  updatePokemonCardList,
}) => {
  // Determines the class to use for the card list
  const cardListClass = isModal ? "modal-card-list" : "card-list";
  const cardListSecondClass = title ? "with-title" : "without-title";

  const renderCardListTitle = (title) => {
    // If a title has been provided, render the title line
    if (title) {
      return (
        <div className="card-list-header">
          <div
            className="card-list-reset-btn"
            role="button"
            onClick={updatePokemonCardList}
          >
            <FontAwesomeIcon icon={faTimes} />
          </div>
          <span className="card-list-title">{title}</span>
        </div>
      );
    }
  };

  return (
      <div className={`${cardListClass} ${cardListSecondClass}`}>
      {renderCardListTitle(title)}
        {pokemonList.map((pokemon, i) => {
          return (
            <Card
              key={i}
              pokemon={pokemon}
              modalCard={isModal}
              clickHandler={clickHandler}
            />
          );
        })}
      </div>
  );
};

export default CardList;
