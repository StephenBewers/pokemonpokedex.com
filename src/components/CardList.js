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
  const cardListSecondClass = isModal ? "without-title" : "with-title";

  const renderCardListHeader = (title, isModal) => {
    // If a title has been provided, render the title line
    const renderTitle = (title) => {
      if (title) {
        return <span className="card-list-title">{title}</span>;
      }
    };

    // If the card list is not on a modal, render the header
    if (!isModal) {
      return (
        <div className="card-list-header">
          <div
            className="card-list-reset-btn"
            role="button"
            onClick={updatePokemonCardList}
          >
            <FontAwesomeIcon icon={faTimes} />
          </div>
          {renderTitle(title)}
        </div>
      );
    }
  };

  return (
    <div className={`${cardListClass} ${cardListSecondClass}`}>
      {renderCardListHeader(title, isModal)}
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
