import React, { Component } from "react";
import "./Header.scss";
import FilterToggleBtn from "./FilterToggleBtn";
import FilterMenu from "./FilterMenu";
import SearchBar from "./SearchBar";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      stickyNav,
      searchOptions,
      updatePokemonCardList,
      clearSearchBar,
      filterBtnClick,
      toggleFilterMenuState,
      filterMenuActive,
      closeFilterMenu,
    } = this.props;

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
          ></FilterMenu>
        </div>
      </header>
    );
  }
}

export default Header;
