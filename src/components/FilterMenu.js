import React, { Component } from "react";
import "./FilterMenu.scss";
import PokemonTypeBtn from "./Pokemon/PokemonTypeBtn";

class FilterMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const activeClass = this.props.active ? "active" : "inactive";
    const { typeBtnClick } = this.props;
    const types = [
      "bug",
      "dark",
      "dragon",
      "electric",
      "fairy",
      "fighting",
      "fire",
      "flying",
      "ghost",
      "grass",
      "ground",
      "ice",
      "normal",
      "poison",
      "psychic",
      "rock",
      "steel",
      "water",
    ];

    // Renders the type buttons
    const displayTypeBtns = (types, typeBtnClick) => {
      let typeBtns = [];
      for (let i = 0; i < types.length; i++) {
        typeBtns.push(
          <PokemonTypeBtn
            type={types[i]}
            key={`filter-type-btn-${types[i]}`}
            typeBtnClick={typeBtnClick}
          ></PokemonTypeBtn>
        );
      }
      return typeBtns;
    };

    //TODO: implement mobile version of Filter Menu

    return (
      <div className={`filter-menu ${activeClass}`}>
        <span className="filter-label">Browse by Type:</span>
        <div className="filter-btns">{displayTypeBtns(types, typeBtnClick)}</div>
      </div>
    );
  }
}

export default FilterMenu;
