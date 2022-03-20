/* This file contains utility functions for processing data from already-retrieved pokemon objects */

// Appends leading zeros to a number
export function getNumberWithLeadingZeros(number, length) {
  let numberString = "" + number;
  while (numberString.length < length) {
    numberString = "0" + numberString;
  }
  return numberString;
}


// Clean up the text from the API (removes hyphens)
export function textCleanup(text) {
  if (text) {
    return text.toString().replace(/-/g, " ");
  }
}


// Gets the correct English version of a specified field from an array of possible content descriptions or names
export function getEnglishContent(array, field) {
  let englishContent;
  for (let i = 0; i < array.length; i++) {
    if (array[i].language.name === "en") {
      englishContent = array[i][field];
    }
  }
  return englishContent;
}


// Gets the correct pokemon name to use for display
export function getPokemonName(species, form) {
  let namesArray = [];
  // If a specific form has been passed, use the form name. If not, use the species name.
  if (form?.details?.names?.length) {
    namesArray = form.details.names;
  } else {
    namesArray = species.names;
  }
  return getEnglishContent(namesArray, "name");
}


// Gets the correct pokemon image to use for display
export function getImage(variant, form) {
  // Special case to handle all of the different pikachu variants where artwork is missing from the API
  if (
    variant?.species?.name === "pikachu" &&
    variant?.sprites?.other?.dream_world?.front_default === null &&
    variant?.sprites?.other["official-artwork"]?.front_default === null
  ) {
    return variant.sprites.front_default;
  }

  // If there's a form then we'll get the image for the form
  if (form?.details?.sprites?.back_default) {
    // Forms don't have dreamworld or official artwork sprites so we need to get the filename from the default sprite
    const defaultFormImageArray = form.details.sprites.back_default.split("/");
    const defaultFormImageFilename =
      defaultFormImageArray[defaultFormImageArray.length - 1];

    // If the variant has a dreamworld sprite, we'll find the matching dreamworld sprite for the form
    if (variant?.sprites?.other?.dream_world?.front_default) {
      const dreamWorldImage =
        "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/" +
        defaultFormImageFilename.replace(".png", ".svg");
      return dreamWorldImage;
    }
    // If the variant doesn't have a dreamworld sprite, we'll use the official artwork for the variant as forms don't have them
    else {
      return variant.sprites.other["official-artwork"].front_default;
    }
  }
  // If there's no form we'll use the image for the variant instead
  else {
    // If there's a dreamworld sprite for the variant, use that
    if (variant?.sprites?.other?.dream_world?.front_default) {
      return variant.sprites.other.dream_world.front_default;
    }
    // If not, use the official artwork for the variant
    else {
      return variant.sprites.other["official-artwork"].front_default;
    }
  }
}


// Handle the Galarian-specific evolutions
export function isGalarianEvolution(id) {
  // Array of Galarian-specific evolution IDs
  const galarianEvolutions = [
    863, // Perrserker
    865, // Sirfetch'd
    866, // Mr. Rime
    864, // Cursola
    862, // Obstagoon
    867, // Runerigus
  ];
  // If the ID matches one of those above return true, else return false
  return galarianEvolutions.includes(id) ? true : false;
}
