import React from "react";
import "./Header.scss";
import FilterToggleBtn from "./FilterToggleBtn";
import FilterMenu from "./FilterMenu";
import SearchBar from "./SearchBar";

const Header = ({
  stickyNav,
  updatePokemonCardList,
  modalActive,
  filterMenuActive,
  anyModalActive,
  filterBtnClick,
  toggleFilterMenuState,
}) => {
  const navClass = modalActive ? "hidden" : stickyNav ? "sticky" : "default";

  return (
    <header>
      <h1>Pokémon Pokédex</h1>
      <div className={`navigation ${navClass}`}>
        <div className="nav-bar">
          <SearchBar
            updatePokemonCardList={updatePokemonCardList}
            anyModalActive={anyModalActive}
          ></SearchBar>
          <FilterToggleBtn
            active={filterMenuActive}
            clickHandler={toggleFilterMenuState}
          ></FilterToggleBtn>
        </div>
        <FilterMenu
          active={filterMenuActive}
          filterBtnClick={filterBtnClick}
          toggleFilterMenuState={toggleFilterMenuState}
        ></FilterMenu>
      </div>
    </header>
  );
};

export default Header;
