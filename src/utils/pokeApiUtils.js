/* This file contains utility functions for retrieving data from PokeAPI */

// Constants for the Poke API
const Pokedex = require("pokeapi-js-wrapper");
const customOptions = {
  cacheImages: true,
};
export const PokeApi = new Pokedex.Pokedex(customOptions);

// Returns a promise to get the resource from the provided URL
export function getResource(url) {
  return PokeApi.resource(url);
}

// Returns a promise to get a list of pokemon species
export function getPokemonSpeciesList(interval) {
  return PokeApi.getPokemonSpeciesList(interval);
}

// Returns a promise to get a type
export function getType(type) {
  return PokeApi.getTypeByName(type);
}

// Returns a promise to get a generation
export function getGeneration(generation) {
  return PokeApi.getGenerationByName(generation);
}

// Retrieves the specified pokemon from the API
export async function getPokemon(arrayOfPokemonToGet) {
  try {
    let pokemonObjects = [];

    for (const pokemon of arrayOfPokemonToGet) {

      let pokemonSpecies;
      let pokemonVariant;

      // If the object to be retrieved is a pokemon species
      if(!pokemon.url || pokemon.url.includes("pokemon-species")) {

        // If we don't have a URL we'll use the species name
        if (!pokemon.url) {
          pokemonSpecies = await PokeApi.getPokemonSpeciesByName(pokemon.name);
        } else {
          // Otherwise, get the pokemon species from the API using the URL
          pokemonSpecies = await PokeApi.resource(pokemon.url);
        }

        // Get the data for the default variant of the species
        for (let i = 0; i < pokemonSpecies.varieties.length; i++) {
          if (pokemonSpecies.varieties[i].is_default) {
            pokemonVariant = await PokeApi.resource(
              `${pokemonSpecies.varieties[i].pokemon.url}`
            );
          }
        }
      }
      // Else it must be a pokemon variant
      else {
        // Get the pokemon variant from the API
        pokemonVariant = await PokeApi.resource(pokemon.url);

        // Get the pokemon species from the API
        pokemonSpecies = await PokeApi.resource(
          pokemonVariant.species.url
        );
      }

      // Add the pokemon object to the array of pokemon objects retrieved in this request
      pokemonObjects.push({
        species: pokemonSpecies,
        variant: pokemonVariant,
        form: {},
      });
    }

    // Return the array of pokemon objects
    return pokemonObjects;
  } catch {
    console.error(`Unable to retrieve pokemon`);
  }
}