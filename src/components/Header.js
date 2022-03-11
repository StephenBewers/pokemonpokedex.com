import React from "react";
import "./Header.scss";
import FilterToggleBtn from "./FilterToggleBtn";
import FilterMenu from "./FilterMenu";
import SearchBar from "./SearchBar";

const Header = ({
  stickyNav,
  searchOptions,
  updatePokemonCardList,
  clearSearchBar,
  searchBarCleared,
  showModal,
  filterBtnClick,
  toggleFilterMenuState,
  filterMenuActive,
}) => {
  const navClass = showModal ? "hidden" : stickyNav ? "sticky" : "default";

  return (
    <header>
      <h1>Pokémon Pokédex</h1>
      <div className={`navigation ${navClass}`}>
        <div className="nav-bar">
          <SearchBar
            options={searchOptions}
            updatePokemonCardList={updatePokemonCardList}
            clearSearchBar={clearSearchBar}
            searchBarCleared={searchBarCleared}
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
