import React, { useState, useEffect } from "react";
import "./App.scss";
import Header from "../components/Header.js";
import InfiniteScroll from "react-infinite-scroll-component";
import CardList from "../components/CardList.js";
import Modal from "../components/Modal/Modal.js";
import ProgressBar from "../components/ProgressBar";
import LoadingSpinnerMain from "../components/LoadingSpinnerMain";
import CookieConsent, {
  getCookieConsentValue,
  Cookies,
} from "react-cookie-consent";
import { initGA } from "../utils/gaUtils";
import { getPokemon, getType, getGeneration } from "../utils/pokeApiUtils";

const App = () => {
  const [pokemonToGet, setPokemonToGet] = useState([]);
  const [retrievedPokemon, setRetrievedPokemon] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [stickyNav, setStickyNav] = useState(false);
  const [modalActive, setModalActive] = useState(false);
  const [modalPokemon, setModalPokemon] = useState("");
  const [cardListTitle, setCardListTitle] = useState("");
  const [showProgressBar, setShowProgressBar] = useState(false);
  const [filterMenuActive, setFilterMenuActive] = useState(false);

  const retrievalLimit = 12;
  const anyModalActive = modalActive || filterMenuActive ? true : false;

  useEffect(() => {
    // Get the viewport height
    const viewportHeight = Math.max(
      document.documentElement.clientHeight || 0,
      window.innerHeight || 0
    );

    // Calculate the point for the nav bar to stick
    const stickyNavPosition = Math.min(viewportHeight * 0.42);

    // Checks if the user has scrolled past the sticky position
    const checkStickyPosition = () => {
      // If we pass the sticky position, make the search bar stick
      if (window.scrollY >= stickyNavPosition && !stickyNav) {
        setStickyNav(true);
      } else {
        setStickyNav(false);
      }
    };

    // Listen for scrolling and/or mouse wheeling
    window.addEventListener("scroll", checkStickyPosition, {
      passive: true,
    });
    window.addEventListener("wheel", checkStickyPosition, {
      passive: true,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Lint rule is disabled as we want this effect to behave like componentDidMount and passing the empty array is correct

  // Handles the cookie accept
  const handleCookieAccept = () => {
    if (process.env.REACT_APP_GOOGLE_ANALYTICS_ID) {
      initGA(process.env.REACT_APP_GOOGLE_ANALYTICS_ID);
    }
  };

  // Handles the cookie decline
  const handleCookieDecline = () => {
    // Remove Google Analytics cookies
    Cookies.remove("_ga");
    Cookies.remove("_gat");
    Cookies.remove("_gid");
  };

  // Updates the state to initialise the modal
  const initModal = (pokemon) => {
    setModalActive(true);
    setModalPokemon(pokemon);
  };

  // Hides the modal
  const hideModal = () => {
    setModalActive(false);
  };

  // Toggle the filter menu active state on filter button click
  const toggleFilterMenuState = () => {
    setFilterMenuActive(!filterMenuActive);
  };

  // Handles a filter button being clicked
  const filterBtnClick = async (btnType, btnValue) => {
    // If the modal is showing, hide it
    if (modalActive) {
      hideModal();
    }

    // If the filter menu is open, close it
    if (filterMenuActive) {
      closeFilterMenu();
    }

    // Show the progress bar
    setShowProgressBar(true);

    // Clear the existing pokemon card list
    updatePokemonCardList();

    let cardListTitle;
    let pokemonList = [];

    // Handle type button clicks
    if (btnType === "type") {
      let typeObject = await getType(btnValue);
      cardListTitle = `${btnValue} pokémon`;

      // Get the list of pokemon for this type
      for (let pokemon of typeObject.pokemon) {
        pokemonList.push(pokemon.pokemon);
      }
    }

    // Handle generation button clicks
    else if (btnType === "generation") {
      let generationObject = await getGeneration(btnValue);
      cardListTitle = `Gen ${btnValue} pokémon`;

      // Gets the pokemon number from the URL
      const getPokemonNumber = (url) => {
        return parseInt(
          url
            .split("/")
            .filter((e) => e)
            .slice(-1)
        );
      };

      // Sort the pokemon returned for this generation into numerical order
      generationObject[0]["pokemon_species"].sort((a, b) =>
        getPokemonNumber(a.url) > getPokemonNumber(b.url)
          ? 1
          : getPokemonNumber(b.url) > getPokemonNumber(a.url)
          ? -1
          : 0
      );

      // Get the list of pokemon for this generation
      for (let pokemon of generationObject[0]["pokemon_species"]) {
        pokemonList.push(pokemon);
      }
    }

    // Update the card list to show pokemon returned from the button click
    updatePokemonCardList(pokemonList, cardListTitle);
  };

  // Closes the filter panel
  const closeFilterMenu = () => {
    setFilterMenuActive(false);
  };

  // Retrieves specified pokemon objects from the API
  const getPokemonBatch = async (remainingPokemonToGet, retrievedPokemon) => {
    // Compares the number of pokemon already retrieved to the total to get
    if (retrievedPokemon.length >= remainingPokemonToGet.length) {
      // If there are no more to retrieve, set the hasMore flag to false
      setHasMore(false);
      return;
    } else {
      setHasMore(true);
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

    // Hides the loading bar if needed
    const doesProgressBarNeedHiding = (hasMore) => {
      if (!hasMore) {
        setShowProgressBar(false);
      }
    };

    // If no pokemon have already been retrieved, update the state with those retrieved in this request
    if (retrievedPokemon.length < 1) {
      setRetrievedPokemon(pokemonObjects);
    } else {
      // If not, add the array of pokemon objects retrieved in this request to the pokemon objects already in state
      setRetrievedPokemon(retrievedPokemon.concat(pokemonObjects));
    }

    setPokemonToGet(pokemonStillToGet);
    setHasMore(hasMore);
    doesProgressBarNeedHiding();
  };

  // Checks if any pokemon have already been received and if so, gets the next batch
  const getNextPokemonBatch = () => {
    if (retrievedPokemon.length) {
      getPokemonBatch(pokemonToGet, retrievedPokemon);
    }
  };

  // Updates the pokemon card list displaying on the main page (call without params to reset)
  const updatePokemonCardList = (pokemonList, cardListTitle) => {
    const loadPokemonList = (pokemonList) => {
      // If a pokemon list has been supplied, load it
      if (pokemonList?.length) {
        getPokemonBatch(pokemonList, []);
      }
    };

    // Clear any previously retrieved pokemon and update the card list title
    setRetrievedPokemon([]);
    setCardListTitle(cardListTitle);
    loadPokemonList(pokemonList);
  };

  useEffect(() => {
    // Checks the cookie consent value and if we have consent, handle as an accept
    const isConsent = getCookieConsentValue();
    if (isConsent === "true") {
      handleCookieAccept();
    }
  }, []);

  const loadingLabel = retrievedPokemon.length
    ? "Looking for more pokémon"
    : "Looking for pokémon";

  const mainClass = modalActive ? "fixed" : "default";

  // If the state implies that we should show the progress bar, render it
  const renderProgressBar = () => {
    if (showProgressBar) {
      return (
        <div className="progress-overlay">
          <ProgressBar></ProgressBar>
        </div>
      );
    }
  };

  // If the state implies that we should show the modal, render it
  const renderModal = () => {
    if (modalActive) {
      return (
        <Modal
          active={modalActive}
          hideModal={hideModal}
          filterBtnClick={filterBtnClick}
          pokemon={modalPokemon}
        />
      );
    }
  };

  // If pokemon have been retrieved and no modals are active, render the card list
  const renderCardList = () => {
    if (retrievedPokemon.length && !anyModalActive) {
      return (
        <InfiniteScroll
          dataLength={retrievedPokemon.length}
          next={getNextPokemonBatch}
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
            clickHandler={initModal}
            updatePokemonCardList={updatePokemonCardList}
          />
        </InfiniteScroll>
      );
    }
  };

  return (
    <>
      <Header
        stickyNav={stickyNav}
        updatePokemonCardList={updatePokemonCardList}
        modalActive={modalActive}
        anyModalActive={anyModalActive}
        filterBtnClick={filterBtnClick}
        toggleFilterMenuState={toggleFilterMenuState}
        filterMenuActive={filterMenuActive}
      ></Header>
      <main className={mainClass}>
        {renderProgressBar()}
        {renderModal()}
        {renderCardList()}
      </main>
      <CookieConsent
        enableDeclineButton
        onAccept={handleCookieAccept}
        onDecline={handleCookieDecline}
        buttonText={"Allow"}
        declineButtonText={"Disable"}
        disableStyles={true}
        containerClasses={"cookie-bar"}
        contentClasses={"cookie-bar-content"}
        buttonWrapperClasses={"cookie-bar-btns"}
        buttonClasses={"cookie-btn-accept"}
        declineButtonClasses={"cookie-btn-decline"}
      >
        Pokémon Pokédex only uses cookies to analyse how the app is used.
      </CookieConsent>
    </>
  );
};

export default App;
