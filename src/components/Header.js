import React, { Component } from "react";
import "./Header.scss";
import SearchBar from "../components/SearchBar.js";

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sticky: this.props.stickySearch,
      stickyClass: "default",
      animateClass: "",
    };
  }

  componentDidMount() {
    // If the state has become sticky, change the search bar class to sticky
    if (this.state.sticky && this.state.stickyClass === "default") {
      this.setState({
        stickyClass: "sticky",
      });
    }
    // If the state has become non-sticky, return the search bar class to default
    else if (!this.state.sticky && this.state.stickyClass === "sticky") {
      this.setState({
        stickyClass: "default",
      });
    }
  }

  render() {
    return (
      <header>
        <h1>Pokémon Pokédex</h1>
        <SearchBar
          additionalClass={this.state.stickyClass}
          options={this.props.searchOptions}
          updatePokemonCardList={this.props.updatePokemonCardList}
          searchBarToBeCleared={this.props.clearSearchBar}
        ></SearchBar>
      </header>
    );
  }
}

export default Header;
