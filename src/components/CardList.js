import React from "react";
import "./CardList.scss";
import Card from "./Card";

const CardList = ({ pokemonList, modal, clickHandler }) => {
  // Determines the class to use for the card list
  const cardListClass = modal ? "modal-card-list" : "card-list";

  return (
      <div className={cardListClass}>
        {pokemonList.map((pokemon, i) => {
          return (
            <Card
              key={i}
              species={pokemon.species}
              variant={pokemon.variant}
              form={pokemon.form}
              modalCard={modal}
              clickHandler={clickHandler}
            />
          );
        })}
      </div>
  );
};

export default CardList;
