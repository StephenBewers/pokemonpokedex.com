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
  filterBtnClick,
  toggleFilterMenuState,
  filterMenuActive,
  closeFilterMenu,
}) => {
  const stickyClass = stickyNav ? "sticky" : "default";

  return (
    <header>
      <h1>Pokémon Pokédex</h1>
      <div className={`navigation ${stickyClass}`}>
        <div className="nav-bar">
          <SearchBar
            options={searchOptions}
            updatePokemonCardList={updatePokemonCardList}
            searchBarToBeCleared={clearSearchBar}
            filterMenuActive={filterMenuActive}
            closeFilterMenu={closeFilterMenu}
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
