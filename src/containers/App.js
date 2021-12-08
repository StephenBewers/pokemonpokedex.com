import React, { Component } from "react";
import "./App.scss";
import Header from "../components/Header.js";
import InfiniteScroll from "react-infinite-scroll-component";
import CardList from "../components/CardList.js";
import Modal from "../components/Modal/Modal.js";
import LoadingBarMain from "../components/LoadingBarMain";
import { 
  getPokemonSpeciesList,
  getPokemon
 } from "../helpers.js";
class App extends Component {
  constructor() {
    super();
    this.resetPokemon = this.resetPokemon.bind(this);
    this.getPokemonBatch = this.getPokemonBatch.bind(this);
    this.initModal = this.initModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.state = {
      pokemonNames: [],
      pokemonToGet: [],
      retrievedPokemon: [],
      retrievalLimit: 6,
      hasMore: true,
      stickySearch: false,
      showModal: false,
      modalPokemon: "",
    };
  }

  // Retrieves specified pokemon objects from the API
  getPokemonBatch = async (remainingPokemonToGet, retrievedPokemon) => {
    let { retrievalLimit } = this.state;

    // Compares the number of pokemon already retrieved to the total to get
    if (retrievedPokemon.length >= remainingPokemonToGet.length) {
      // If there are no more to retrieve, set the hasMore flag to false
      this.setState({ hasMore: false });
      return;
    } else {
      this.setState({ hasMore: true });
    }

    // Select the pokemon to get in this request
    let pokemonToGetNow;
    if (remainingPokemonToGet.length > retrievalLimit) {
      pokemonToGetNow = remainingPokemonToGet.slice(0, retrievalLimit);
    } else {
      pokemonToGetNow = remainingPokemonToGet;
    }

    // Retrieves the pokemon objects from the API
    const pokemonObjects = await getPokemon(pokemonToGetNow);

    // Update the list of pokemon still to retrieve, removing those we retrieved in this batch
    let pokemonStillToGet;
    let hasMore = true;
    if (remainingPokemonToGet.length > retrievalLimit) {
      pokemonStillToGet = remainingPokemonToGet.slice(
        retrievalLimit,
        remainingPokemonToGet.length
      );
    } else {
      pokemonStillToGet = [];
      hasMore = false;
    }

    // If no pokemon have already been retrieved, update the state with those retrieved in this request
    if (retrievedPokemon.length < 1) {
      this.setState({
        pokemonToGet: pokemonStillToGet,
        retrievedPokemon: pokemonObjects,
        hasMore: hasMore,
      });
    } else {
      // If not, add the array of pokemon objects retrieved in this request to the pokemon objects already in state
      this.setState({
        pokemonToGet: pokemonStillToGet,
        retrievedPokemon: retrievedPokemon.concat(pokemonObjects),
        hasMore: hasMore,
      });
    }
  };

  // Initialises the pokemon list
  initPokemonList = () => {
    // The starting point and number of pokemon to retrieve from the API per request
    const interval = { offset: 0, limit: 2000 };

    try {
      (async () => {
        // Gets the json of all pokemon species
        let response = await getPokemonSpeciesList(interval);

        // Store all of the pokemon names in an array
        let pokemonNames = [];
        for (const item of response.results) {
          pokemonNames.push(item.name);
        }

        // Start getting the pokemon from the API
        this.getPokemonBatch(pokemonNames, []);

        // Update the state with the list of pokemon names
        this.setState({
          pokemonNames: pokemonNames,
        });
      })();
    } catch {
      console.error(`Failed to get the list of Pokemon`);
    }
  };

  // Checks if any pokemon have already been received and if so, gets the next batch
  getNextPokemonBatch = () => {
    const { pokemonToGet, retrievedPokemon } = this.state;
    if (retrievedPokemon.length) {
      this.getPokemonBatch(pokemonToGet, retrievedPokemon);
    }
  };

  // Resets the UI before loading the pokemon
  resetPokemon = () => {
    this.setState(
      {
        retrievedPokemon: [],
      },
      this.initPokemonList()
    );
  };

  // If the state implies that we should show the modal, render it
  renderModal = () => {
    if (this.state.showModal) {
      return (
        <Modal
          showModal={this.state.showModal}
          hideModal={this.hideModal}
          pokemon={this.state.modalPokemon}
        />
      );
    }
  };

  // Updates the state to initialise the modal
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
    // If the pokemon names list is empty, initialise the pokemon list
    if (!this.state.pokemonNames.length) {
      this.initPokemonList();
    }

    // Get the viewport height
    const viewportHeight = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );

    // Calculate the point for the search bar to stick
    let stickySearchPosition = Math.min(viewportHeight * 0.42);

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
          getPokemonBatch={this.getPokemonBatch}
        ></Header>
        <main>
          {this.renderModal()}
          <InfiniteScroll
            dataLength={retrievedPokemon.length}
            next={this.getNextPokemonBatch}
            hasMore={hasMore}
            scrollThreshold="80%"
            loader={<LoadingBarMain loadingLabel={loadingLabel}></LoadingBarMain>}
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
