import React from "react";
import "./FilterMenu.scss";
import PokemonTypeBtn from "./Pokemon/PokemonTypeBtn";
import GenerationBtn from "./GenerationBtn";
import ModalRow from "./Modal/ModalRow";
import ModalInfoItem from "./Modal/ModalInfoItem";
import ModalInfoValue from "./Modal/ModalInfoValue";
import ModalExitBtn from "./Modal/ModalExitBtn";
import ModalImagePanel from "./Modal/ModalImagePanel";

const FilterMenu = ({ active, filterBtnClick, toggleFilterMenuState }) => {
  const activeClass = active ? "visible" : "hidden";
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

  // Prevents clicks on the inner modal div triggering the outer modal click event
  const innerModalClick = (event) => {
    event.stopPropagation();
  };

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

  return (
    <div
      className={`menu-modal ${activeClass}`}
      onClick={toggleFilterMenuState}
    >
      <ModalExitBtn hideModal={toggleFilterMenuState}></ModalExitBtn>
      <section className="menu-modal-main" onClick={innerModalClick}>
        <ModalImagePanel></ModalImagePanel>
        <div className="menu-modal-info-panel">
          <ModalRow id="menu-browse-pokemon-row">
            <ModalInfoItem label="Browse pokemon" id="menu-browse-pokemon">
              <ModalRow>
                <ModalInfoItem
                  label="By generation"
                  id="filter-pokemon-generation"
                  subitem={true}
                  row={true}
                >
                  {displayGenerationBtns(filterBtnClick)}
                </ModalInfoItem>
              </ModalRow>
              <ModalRow>
                <ModalInfoItem
                  label="By type"
                  id="filter-pokemon-type"
                  subitem={true}
                  row={true}
                >
                  {displayTypeBtns(types, filterBtnClick)}
                </ModalInfoItem>
              </ModalRow>
            </ModalInfoItem>
          </ModalRow>
          <ModalRow id="menu-information-row">
            <ModalInfoItem label="Information" id="menu-information">
              <p>
                Designed and developed by{" "}
                <a href="https://www.stephenbewers.com/">Stephen Bewers</a>.
                Pokémon and Pokémon character names are trademarks of Nintendo.
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
                <a href="https://zerotomastery.io/">
                  Zero to Mastery community
                </a>
                .
              </p>
            </ModalInfoItem>
          </ModalRow>
        </div>
      </section>
    </div>
  );
};

export default FilterMenu;
