import React, { Component } from "react";
import "./Header.scss";
import FilterBtn from "./FilterBtn";
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
      typeBtnClick,
      filterBtnClick,
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
            <FilterBtn
              active={filterMenuActive}
              clickHandler={filterBtnClick}
            ></FilterBtn>
          </div>
          <FilterMenu
            active={filterMenuActive}
            typeBtnClick={typeBtnClick}
          ></FilterMenu>
        </div>
      </header>
    );
  }
}

export default Header;
