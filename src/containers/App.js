import React, { Component } from "react";
import "./App.scss";
import Header from "../components/Header.js";
import InfiniteScroll from "react-infinite-scroll-component";
import CardList from "../components/CardList.js";
import Modal from "../components/Modal/Modal.js";
import ProgressBar from "../components/ProgressBar";
import LoadingSpinnerMain from "../components/LoadingSpinnerMain";
import { getPokemonSpeciesList, getPokemon, getType } from "../helpers.js";
class App extends Component {
  constructor() {
    super();
    this.updatePokemonCardList = this.updatePokemonCardList.bind(this);
    this.typeBtnClick = this.typeBtnClick.bind(this);
    this.initModal = this.initModal.bind(this);
    this.hideModal = this.hideModal.bind(this);
    this.filterBtnClick = this.filterBtnClick.bind(this);
    this.closeFilterMenu = this.closeFilterMenu.bind(this);
    this.state = {
      pokemonNames: [],
      pokemonToGet: [],
      retrievedPokemon: [],
      retrievalLimit: 12,
      hasMore: true,
      stickyNav: false,
      showModal: false,
      modalPokemon: "",
      clearSearchBar: false,
      cardListTitle: "",
      showProgressBar: false,
      filterMenuActive: false,
    };
  }

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

        // Update the state with the list of pokemon names
        this.setState({
          pokemonNames: pokemonNames,
        });
      })();
    } catch {
      console.error(`Failed to get the list of Pokemon`);
    }
  };

  // Retrieves specified pokemon objects from the API
  getPokemonBatch = async (
    remainingPokemonToGet,
    retrievedPokemon,
    areVariants
  ) => {
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
    const pokemonObjects = await getPokemon(pokemonToGetNow, areVariants);

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

    // Hides the loading bar if needed
    const doesProgressBarNeedHiding = (hasMore) => {
      if (!hasMore) {
        this.hideProgressBar();
      }
    };

    // If no pokemon have already been retrieved, update the state with those retrieved in this request
    if (retrievedPokemon.length < 1) {
      this.setState(
        {
          pokemonToGet: pokemonStillToGet,
          retrievedPokemon: pokemonObjects,
          hasMore: hasMore,
        },
        () => {
          doesProgressBarNeedHiding();
        }
      );
    } else {
      // If not, add the array of pokemon objects retrieved in this request to the pokemon objects already in state
      this.setState(
        {
          pokemonToGet: pokemonStillToGet,
          retrievedPokemon: retrievedPokemon.concat(pokemonObjects),
          hasMore: hasMore,
        },
        () => {
          doesProgressBarNeedHiding();
        }
      );
    }
  };

  // Checks if any pokemon have already been received and if so, gets the next batch
  getNextPokemonBatch = () => {
    const { pokemonToGet, retrievedPokemon } = this.state;
    if (retrievedPokemon.length) {
      this.getPokemonBatch(pokemonToGet, retrievedPokemon);
    }
  };

  // Handles a type button being clicked
  typeBtnClick = async (type) => {
    // Clear the search bar
    this.setState({
      clearSearchBar: true,
    });
    
    // If the modal is showing, hide it
    if (this.state.showModal) {
      this.hideModal();
    }

    // If the filter menu is open, close it
    if(this.state.filterMenuActive) { this.closeFilterMenu() };

    // Show the progress bar
    this.initProgressBar();

    // Clear the existing pokemon card list
    this.updatePokemonCardList();

    // Get the type from the API
    const typeObject = await getType(type);
    const cardListTitle = `${type} pokémon`;
    const areVariants = true;

    // Get the list of pokemon for this type
    let pokemonList = [];
    for (let pokemon of typeObject.pokemon) {
      pokemonList.push(pokemon.pokemon.name);
    }

    // Update the card list to pokemon of this type
    this.updatePokemonCardList(pokemonList, cardListTitle, areVariants);
  };

  // Updates the pokemon card list displaying on the main page (call without params to reset)
  updatePokemonCardList = (pokemonList, cardListTitle, areVariants) => {
    const loadPokemonList = (pokemonList) => {
      // If a pokemon list has been supplied, load it
      if (pokemonList?.length) {
        this.getPokemonBatch(pokemonList, [], areVariants);
      }
    };

    // Clear any previously retrieved pokemon and update the card list title
    this.setState(
      {
        retrievedPokemon: [],
        cardListTitle: cardListTitle,
      },
      loadPokemonList(pokemonList)
    );
  };

  // Updates the state to initialise the modal
  initModal = (pokemon) => {
    this.setState({
      showModal: true,
      modalPokemon: pokemon,
      clearSearchBar: true,
    });
  };

  // Hides the modal
  hideModal = () => {
    this.setState({ showModal: false, clearSearchBar: false });
  };

  // Updates the state to initialise the progress bar
  initProgressBar = () => {
    this.setState({
      showProgressBar: true,
    });
  };

  // Hides the progress bar
  hideProgressBar = () => {
    this.setState({ showProgressBar: false });
  };

  // Toggle the filter menu active state on filter button click
  filterBtnClick = () => {
    this.setState({
      filterMenuActive: !this.state.filterMenuActive,
    });
  };

  // Closes the filter panel
  closeFilterMenu = () => {
    this.setState({ filterMenuActive: false });
  }

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

    // Calculate the point for the nav bar to stick
    let stickyNavPosition = Math.min(viewportHeight * 0.42);

    // Checks if the user has scrolled past the sticky position
    const checkStickyPosition = () => {
      // If we pass the sticky position, make the search bar stick
      if (window.scrollY >= stickyNavPosition) {
        if (!this.state.stickyNav) {
          this.setState({ stickyNav: true });
        }
      } else {
        if (this.state.stickyNav) {
          this.setState({ stickyNav: false });
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
    const {
      pokemonNames,
      retrievedPokemon,
      hasMore,
      stickyNav,
      clearSearchBar,
      showModal,
      showProgressBar,
      cardListTitle,
      filterMenuActive,
    } = this.state;
    const loadingLabel = retrievedPokemon.length
      ? "Looking for more pokémon"
      : "Looking for pokémon";

    // If the state implies that we should show the progress bar, render it
    const renderProgressBar = () => {
      if (showProgressBar) {
        return (
        <div className="progress-overlay">
          <ProgressBar></ProgressBar>
        </div>
        )
      }
    };

    // If the state implies that we should show the modal, render it
    const renderModal = () => {
      if (showModal) {
        return (
          <Modal
            showModal={this.state.showModal}
            hideModal={this.hideModal}
            typeBtnClick={this.typeBtnClick}
            pokemon={this.state.modalPokemon}
          />
        );
      }
    };

    // If pokemon have been retrieved, render the card list
    const renderCardList = () => {
      if (retrievedPokemon.length) {
        return (
          <InfiniteScroll
            dataLength={retrievedPokemon.length}
            next={this.getNextPokemonBatch}
            hasMore={hasMore}
            scrollThreshold="80%"
            loader={
              <LoadingSpinnerMain
                loadingLabel={loadingLabel}
              ></LoadingSpinnerMain>
            }
          >
            <CardList
              pokemonList={retrievedPokemon}
              title={cardListTitle}
              clickHandler={this.initModal}
              updatePokemonCardList={this.updatePokemonCardList}
            />
          </InfiniteScroll>
        );
      }
    };

    // If the filter menu is open, render the overlay
    const renderFilterOverlay = (filterMenuActive) => {
      if (filterMenuActive) {
        return <div className="filter-overlay"></div>
      } else {
        return null;
      }
    }

    return (
      <>
        <Header
          stickyNav={stickyNav}
          searchOptions={pokemonNames}
          updatePokemonCardList={this.updatePokemonCardList}
          clearSearchBar={clearSearchBar}
          typeBtnClick={this.typeBtnClick}
          filterBtnClick={this.filterBtnClick}
          filterMenuActive={filterMenuActive}
          closeFilterMenu={this.closeFilterMenu}
        ></Header>
        <main>
          {renderFilterOverlay(filterMenuActive)}
          {renderProgressBar()}
          {renderModal()}
          {renderCardList()}
        </main>
      </>
    );
  }
}

export default App;
