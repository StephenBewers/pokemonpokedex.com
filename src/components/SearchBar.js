import React, { useState, useEffect } from "react";
import "./SearchBar.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { getPokemonSpeciesList } from "../utils/pokeApiUtils";

// Gets the list of pokemon names for the search bar autocomplete
const getPokemonNameOptions = () => {
  // The starting point and number of pokemon to retrieve from the API per request
  const interval = { offset: 0, limit: 2000 };

  let pokemonNames = [];

  (async () => {
    try {
      // Gets the json of all pokemon species
      let response = await getPokemonSpeciesList(interval);

      // Store all of the pokemon names in an array
      for (const item of response.results) {
        pokemonNames.push(item.name);
      }
    } catch {
      console.error(`Failed to get the list of Pokemon names`);
    }
  })();

  return pokemonNames;
};

const SearchBar = ({
  updatePokemonCardList,
  anyModalActive,
  options = getPokemonNameOptions(),
}) => {
  const [activeOption, setActiveOption] = useState(0);
  const [filteredOptions, setFilteredOptions] = useState([]);
  const [showOptions, setShowOptions] = useState(false);
  const [userInput, setUserInput] = useState("");

  const resetState = () => {
    setActiveOption(0);
    setFilteredOptions([]);
    setShowOptions(false);
    setUserInput("");
  };

  useEffect(() => {
    let mounted = true;

    // If a modal is active, reset the state
    if (anyModalActive && mounted) {
      resetState();
    }
    
    // Cleanup on unmount
    return (() => {
      mounted = false;
    });
  }, [anyModalActive]);

  const filterOptions = (options, userInput) => {
    // Get the pokemon that begin with the user input string
    const optionsStartingWithUserInput = options.filter((option) =>
      option.toLowerCase().startsWith(userInput.toLowerCase())
    );

    // Get the pokemon that contain the user input string
    const optionsContainingUserInput = options.filter(
      (option) => option.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );

    // Return the filtered options with those starting with the user input first
    return optionsStartingWithUserInput.concat(
      optionsContainingUserInput.filter(
        (option) => optionsStartingWithUserInput.indexOf(option) < 0
      )
    );
  };

  // When the text in the search bar changes, filter the list of pokemon and display the suggestions
  const onChange = (event) => {
    const userInputText = event.currentTarget.value;
    if (userInputText.length) {
      const filteredOptionsArray = filterOptions(options, userInputText);
      setActiveOption(0);
      setFilteredOptions(filteredOptionsArray);
      setShowOptions(true);
      setUserInput(userInputText);
    }
    // If user input has been cleared, reset the state
    else {
      resetState();
    }
  };

  // When the user clicks one of the autocomplete suggestions, populate the search box with
  // the clicked pokemon name, load that pokemon card, and stop displaying suggestions
  const onClick = (event) => {
    setActiveOption(0);
    setFilteredOptions([]);
    setShowOptions(false);
    setUserInput(event.target.outerText);

    updatePokemonCardList([{ name: event.target.outerText.toLowerCase() }]);
  };

  // On clicking the submit button, search for the currently selected pokemon in the list
  const onSubmit = (event) => {
    setActiveOption(0);
    setFilteredOptions([]);
    setShowOptions(false);
    setUserInput(filteredOptions[activeOption]);

    updatePokemonCardList([
      {
        name: filteredOptions[activeOption].toLowerCase(),
      },
    ]);
  };

  // Handle key events for autocomplete suggestion list
  const onKeyDown = (event) => {
    // Return key provides the same action as the submit event
    if (event.keyCode === 13 && filteredOptions.length) {
      onSubmit(event);
    }

    // Up arrow selects the suggestion above the currently selected option if not already at the top
    else if (event.keyCode === 38) {
      if (activeOption === 0) {
        return;
      }
      setActiveOption((activeOption) => activeOption - 1);
    }

    // Down arrow selects the suggestion below the currently selected option if not already at the bottom
    else if (event.keyCode === 40) {
      if (activeOption - 1 === filteredOptions.length) {
        return;
      }
      setActiveOption((activeOption) => activeOption + 1);
    }

    // Esc key resets the state
    if (event.keyCode === 27) {
      resetState();
    }
  };

  // Change the currently selected option to the option the user moves their mouse over
  const onMouseOver = (event) => {
    const parent = event.target.parentNode;
    const optionIndex = [].indexOf.call(parent.children, event.target);
    setActiveOption(optionIndex);
  };

  // Lists the autocomplete options provided in JSX format for rendering
  const listOptions = (optionName, index) => {
    let className = "option";
    if (index === activeOption) {
      className = "option-active";
    }
    return (
      <li
        className={className}
        key={optionName}
        onClick={onClick}
        onMouseOver={onMouseOver}
      >
        {optionName}
      </li>
    );
  };

  // Provide the JSX code for the autocomplete suggestions list
  let optionList;
  if (showOptions && userInput) {
    // JSX if there are matching pokemon names in the list
    if (filteredOptions.length) {
      // If there are more than 5 options, only return the first 5
      if (filteredOptions.length > 5) {
        optionList = (
          <>
            <div className="options-container-divider"></div>
            <div className="options-container">
              <ul className="options">
                {filteredOptions.slice(0, 5).map(listOptions)}
              </ul>
            </div>
          </>
        );
      }

      // If there are 5 or fewer options, return all
      else {
        optionList = (
          <>
            <div className="options-container-divider"></div>
            <div className="options-container">
              <ul className="options">{filteredOptions.map(listOptions)}</ul>
            </div>
          </>
        );
      }
    }

    // JSX if there are no matching pokemon names in the list
    else {
      optionList = (
        <>
          <div className="options-container-divider"></div>
          <div className="options-container">
            <p className="no-results">
              <em>No pokémon found with that name!</em>
            </p>
          </div>
        </>
      );
    }
  }

  // Render the search button
  const getSearchBtn = (options) => {
    // If there are options available, render the enabled search button
    if (options > 0) {
      return (
        <button
          type="submit"
          name="submit"
          value=""
          className="search-btn"
          onClick={onSubmit}
        >
          <FontAwesomeIcon icon={faSearch} id="submitBtnIcon" />
        </button>
      );
    }
    // Otherwise the search button should be disabled to prevent searches for pokemon that do not exist
    else {
      return (
        <button
          type="submit"
          id="submit"
          name="submit"
          value=""
          disabled="disabled"
          className="search-btn"
          onClick={onSubmit}
        >
          <FontAwesomeIcon icon={faSearch} id="submitBtnIcon" />
        </button>
      );
    }
  };

  return (
    <div className={`search-container`}>
      <div className={`search-bar`}>
        <input
          type="search"
          name="search"
          placeholder="Search pokémon"
          className="search-box"
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={userInput}
        />
        <span className="search-divider"></span>
        {getSearchBtn(filteredOptions.length)}
      </div>
      {optionList}
    </div>
  );
};

export default SearchBar;
