import React, { Component } from "react";
import "./FilterMenu.scss";
import PokemonTypeBtn from "./Pokemon/PokemonTypeBtn";
import GenerationBtn from "./GenerationBtn";

class FilterMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const activeClass = this.props.active ? "active" : "inactive";
    const { filterBtnClick } = this.props;
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

    // Renders the generation buttons
    const displayGenerationBtns = (filterBtnClick) => {
      const maxGeneration = 8;
      let generationBtns = [];
      for (let i = 1; i < maxGeneration + 1; i++) {
        generationBtns.push(
          <GenerationBtn
            generation={[i]}
            key={`generation-btn-${[i]}`}
            filterBtnClick={filterBtnClick}
          ></GenerationBtn>
        );
      }
      return generationBtns;
    };

    // Renders the type buttons
    const displayTypeBtns = (types, filterBtnClick) => {
      let typeBtns = [];
      for (let i = 0; i < types.length; i++) {
        typeBtns.push(
          <PokemonTypeBtn
            type={types[i]}
            key={`filter-type-btn-${types[i]}`}
            filterBtnClick={filterBtnClick}
          ></PokemonTypeBtn>
        );
      }
      return typeBtns;
    };

    //TODO: implement mobile version of Filter Menu

    return (
      <div className={`filter-menu ${activeClass}`}>
        <span className="filter-label">Browse by Generation:</span>
        <div className="filter-btns">
          {displayGenerationBtns(filterBtnClick)}
        </div>
        <span className="filter-label">Browse by Type:</span>
        <div className="filter-btns">
          {displayTypeBtns(types, filterBtnClick)}
        </div>
        <span className="filter-label">Information</span>
        <div className="credits">
          <p>
            Designed and developed by{" "}
            <a href="https://www.stephenbewers.com/">Stephen Bewers</a>. Pokémon and Pokémon character names are trademarks of Nintendo.
            Other trademarks are the property of their respective owners.
          </p>
          <p>
            Many thanks to <a href="https://pokeapi.co/">PokeAPI</a>,{" "}
            <a href="https://reactjs.org/">React.js</a>,{" "}
            <a href="https://fontawesome.com/">Font Awesome</a>,{" "}
            <a href="https://www.npmjs.com/package/react-infinite-scroll-component">
              Ankeet Maini
            </a>
            ,{" "}
            <a href="https://www.npmjs.com/package/react-parallax-tilt">
              mkosir
            </a>
            , and the{" "}
            <a href="https://zerotomastery.io/">Zero to Mastery community</a>.
          </p>
        </div>
      </div>
    );
  }
}

export default FilterMenu;
