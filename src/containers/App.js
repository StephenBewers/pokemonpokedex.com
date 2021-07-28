import React, { Component } from "react";
import "./App.scss";
import Header from "../components/Header.js";
import InfiniteScroll from "react-infinite-scroll-component";
import CardList from "../components/CardList.js";
import Modal from "../components/Modal";

const Pokedex = require("pokeapi-js-wrapper");
const customOptions = {
  cacheImages: true,
};
const PokeApi = new Pokedex.Pokedex(customOptions);
class App extends Component {
  constructor() {
    super();
    this.resetPokemon = this.resetPokemon.bind(this);
    this.getSpecificPokemon = this.getSpecificPokemon.bind(this);
    this.initModal = this.initModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.state = {
      pokemonNames: [],
      retrievedPokemon: [],
      retrievalLimit: 24,
      count: 1,
      hasMore: true,
      stickySearch: false,
      showModal: false,
      modalPokemon: "",
    };
  }

  // Gets a list of all available pokemon names
  getPokemonNames = () => {
    // The starting point and number of pokemon to retrieve from the API per request
    const interval = { offset: 0, limit: 2000 };

    try {
      (async () => {
        // Gets the list of pokemon requested
        let response = await PokeApi.getPokemonSpeciesList(interval);

        // Store the total number of pokemon available from the API in state
        this.setState({ count: response.count });

        // Store all of the pokemon names in an array and add to state
        let pokemonNames = [];
        for (const item of response.results) {
          pokemonNames.push(item.name);
        }
        this.setState({ pokemonNames: pokemonNames });
      })();
    } catch {
      console.error(`Failed to get Pokemon names`);
    }
  };

  // Retrieves the pokemon objects from the API from the total already retrieved (pass 0 to reset)
  getPokemon = (totalAlreadyRetrieved) => {
    let { retrievedPokemon, retrievalLimit } = this.state;

    // Compares the number of pokemon already in state to the total available from the API
    if (retrievedPokemon.length >= this.state.count) {
      // If there are no more to retrieve, set the hasMore flag to false
      this.setState({ hasMore: false });
      return;
    } else {
      this.setState({ hasMore: true });
    }
    try {
      (async () => {
        // The starting point and number of pokemon to retrieve from the API per request
        const interval = {
          offset: totalAlreadyRetrieved,
          limit: retrievalLimit,
        };

        // Gets the list of pokemon requested and the API URL for their information
        let response = await PokeApi.getPokemonSpeciesList(interval);

        // For each pokemon in the response, retrieve their information from the API
        let pokemonObjects = [];
        for (const item of response.results) {
          // Get the pokemon species from the API
          let pokemonSpecies = await PokeApi.resource(`${item.url}`);

          // Get the data for the default variant of the species
          let pokemonVariant;
          for (let i = 0; i < pokemonSpecies.varieties.length; i++) {
            if (pokemonSpecies.varieties[i].is_default) {
              pokemonVariant = await PokeApi.resource(
                `${pokemonSpecies.varieties[i].pokemon.url}`
              );
            }
          }

          // Add the pokemon object and default variant to the array of pokemon objects retrieved in this request
          pokemonObjects.push({
            species: pokemonSpecies,
            variant: pokemonVariant,
            form: {},
          });
        }

        // If there are fewer pokemon in state than would be returned by one call, replace the state with
        // the pokemon objects retrieved in this request
        if (totalAlreadyRetrieved < 1) {
          this.setState({
            retrievedPokemon: pokemonObjects,
          });
        } else {
          // If not, add the array of pokemon objects retrieved in this request to the pokemon objects already in state
          this.setState({
            retrievedPokemon: retrievedPokemon.concat(pokemonObjects),
          });
        }
      })();
    } catch {
      console.error(`Failed to get Pokemon list`);
    }
  };

  // Retrieves a single pokemon from the API
  getSpecificPokemon = (pokemonToGet) => {
    try {
      (async () => {
        let pokemonObjects = [];

        for (const pokemon of pokemonToGet) {
          // Get the pokemon species from the API
          let pokemonSpecies = await PokeApi.getPokemonSpeciesByName(pokemon);

          // Get the data for the default variant of the species
          let pokemonVariant;
          for (let i = 0; i < pokemonSpecies.varieties.length; i++) {
            if (pokemonSpecies.varieties[i].is_default) {
              pokemonVariant = await PokeApi.resource(
                `${pokemonSpecies.varieties[i].pokemon.url}`
              );
            }
          }

          // Add the pokemon object to the array of pokemon objects retrieved in this request
          pokemonObjects.push({species: pokemonSpecies, variant: pokemonVariant, form: {}});
        }

        // Change state to the pokemon objects retrieved
        this.setState({
          retrievedPokemon: pokemonObjects,
          hasMore: false,
        });
      })();
    } catch {
      console.error(`Unable to retrieve specified pokemon`);
    }
  };

  // Retrieves the next batch of pokemon for the infinite scroll
  getMorePokemon = () => this.getPokemon(this.state.retrievedPokemon.length);

  // Resets the UI before loading the pokemon
  resetPokemon = () => {
    this.setState(
      {
        retrievedPokemon: [],
      },
      this.getPokemon(0)
    );
  };

  // Determines if the modal should be rendered or not
  renderModal = () => {
    if (this.state.showModal) {
      return (
        <Modal
          showModal={this.state.showModal}
          hideModal={this.hideModal}
          species={this.state.modalPokemon.species}
          variant={this.state.modalPokemon.variant}
          form={this.state.modalPokemon.form}
        />
      );
    }
  };

  // Triggers the modal to show and passes the pokemon information
  initModal = (pokemon) => {
    this.setState({
      showModal: true,
      modalPokemon: pokemon,
    });
  };

  // Hides the modal
  hideModal = () => {
    this.setState({ showModal: false });
  };

  componentDidMount() {
    // If the pokemon names list is empty, get the pokemon names
    if (!this.state.pokemonNames.length) {
      this.getPokemonNames();
    }

    // Retrieve the pokemon
    this.getMorePokemon();

    // Get the viewport height and width, and calculate the minimum
    const viewportHeight = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );
    const viewportWidth = Math.max(
      document.documentElement.clientWidth || 0,
      window.innerWidth || 0
    );
    const viewportMin = Math.min(viewportHeight, viewportWidth);

    // Calculate the point for the search bar to stick
    let stickySearchPosition = Math.min(viewportMin * 0.4);

    // Checks if the user has scrolled past the sticky position
    const checkStickyPosition = () => {
      // If we pass the sticky position, make the search bar stick
      if (window.scrollY >= stickySearchPosition) {
        if (!this.state.stickySearch) {
          this.setState({ stickySearch: true });
        }
      } else {
        if (this.state.stickySearch) {
          this.setState({ stickySearch: false });
        }
      }
    };

    // Listen for scrolling and/or mouse wheeling
    window.addEventListener("scroll", checkStickyPosition, {
      passive: true,
    });
    window.addEventListener("wheel", checkStickyPosition, {
      passive: true,
    });
  }

  render() {
    const { pokemonNames, retrievedPokemon, hasMore, stickySearch } =
      this.state;
    const loadingLabel = retrievedPokemon.length
      ? "Looking for more pokémon"
      : "Looking for pokémon";
    return (
      <>
        <Header
          key={stickySearch}
          stickySearch={stickySearch}
          searchOptions={pokemonNames}
          resetPokemon={this.resetPokemon}
          getSpecificPokemon={this.getSpecificPokemon}
        ></Header>
        <main>
          {this.renderModal()}
          <InfiniteScroll
            dataLength={retrievedPokemon.length}
            next={this.getMorePokemon}
            hasMore={hasMore}
            scrollThreshold="25%"
            loader={
              <div className="loading-bar">
                <p className="loading-label">{loadingLabel}</p>
                <div className="lds-ellipsis">
                  <div></div>
                  <div></div>
                  <div></div>
                  <div></div>
                </div>
              </div>
            }
          >
            <CardList
              pokemonList={retrievedPokemon}
              clickHandler={this.initModal}
            />
          </InfiniteScroll>
        </main>
      </>
    );
  }
}

export default App;
