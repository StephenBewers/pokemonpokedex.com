// Wraps around a Promise to make it cancellable as per ReactJs blog post "isMounted is an Antipattern"
export function makeCancellable(promise) {
  let hasCancelled_ = false;

  const wrappedPromise = new Promise((resolve, reject) => {
    promise.then(
      val => hasCancelled_ ? reject({isCancelled: true}) : resolve(val),
      error => hasCancelled_ ? reject({isCancelled: true}) : reject(error)
    );
  });

  return {
    promise: wrappedPromise,
    cancel() {
      hasCancelled_ = true;
    },
  };
};

// Returns a promise to get the resource from the provided URL
export function getResource(PokeApi, url) {
  return PokeApi.resource(url)
}

// Appends the leading zeros to the pokemon number
export function getNumberWithLeadingZeros(number, length) {
  let pokemonNumber = "" + number;
  while (pokemonNumber.length < length) {
    pokemonNumber = "0" + pokemonNumber;
  }
  return pokemonNumber;
}

// Clean up the text from the API (removes hyphens)
export function textCleanup(text) {
  if (text) {
    return text.toString().replace(/-/g, " ");
  }
}

// Gets the correct pokemon name to use
export function getName(species, form) {
  let namesArray = [];
  let pokemonName;
  // If a specific form has been passed, use the form name. If not, use the species name.
  if (form?.details?.names.length) {
    namesArray = form.details.names;
  } else {
    namesArray = species.names;
  }
  // Find the English name
  for (let i = 0; i < namesArray.length; i++) {
    if (namesArray[i].language.name === "en") {
      pokemonName = namesArray[i].name;
    }
  }
  return pokemonName;
};

// Gets the correct pokemon image to use
export function getImage(variant, form) {

  // Special case to handle all of the different pikachu variants where artwork is missing from the API
  if (variant?.species?.name === "pikachu" && variant?.sprites?.other?.dream_world?.front_default === null && variant?.sprites?.other["official-artwork"]?.front_default === null) {
    return variant.sprites.front_default;
  }

  // If there's a form then we'll get the image for the form
  if (form?.details?.sprites?.back_default){

    // Forms don't have dreamworld or official artwork sprites so we need to get the filename from the default sprite
    const defaultFormImageArray = form.details.sprites.back_default.split("/");
    const defaultFormImageFilename = defaultFormImageArray[defaultFormImageArray.length - 1];

    // If the variant has a dreamworld sprite, we'll find the matching dreamworld sprite for the form
    if (variant?.sprites?.other?.dream_world?.front_default) {
      const dreamWorldImage = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/dream-world/" + defaultFormImageFilename.replace(".png", ".svg");;
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