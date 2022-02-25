import React, { Component } from "react";
import "./PokemonTypeEffectiveness.scss";
import ModalRow from "../Modal/ModalRow";
import ModalInfoItem from "../Modal/ModalInfoItem";
import PokemonTypeBtn from "../Pokemon/PokemonTypeBtn";
import LoadingBarSmall from "../LoadingSpinnerSmall";
import {
  errorHandler,
  cancelPromise,
  makeCancellable,
  getResource,
} from "../../helpers.js";

// Array to store promises to return the additional data. Promises will be cancelled on unmount.
let typePromises = [];

// Default type effectiveness
const defaultTypeEffectivenessValue = 1;
const getDefaultTypeEffectiveness = () => {
  return {
    bug: defaultTypeEffectivenessValue,
    dark: defaultTypeEffectivenessValue,
    dragon: defaultTypeEffectivenessValue,
    electric: defaultTypeEffectivenessValue,
    fairy: defaultTypeEffectivenessValue,
    fighting: defaultTypeEffectivenessValue,
    fire: defaultTypeEffectivenessValue,
    flying: defaultTypeEffectivenessValue,
    ghost: defaultTypeEffectivenessValue,
    grass: defaultTypeEffectivenessValue,
    ground: defaultTypeEffectivenessValue,
    ice: defaultTypeEffectivenessValue,
    normal: defaultTypeEffectivenessValue,
    poison: defaultTypeEffectivenessValue,
    psychic: defaultTypeEffectivenessValue,
    rock: defaultTypeEffectivenessValue,
    steel: defaultTypeEffectivenessValue,
    water: defaultTypeEffectivenessValue,
  };
};

class PokemonTypeEffectiveness extends Component {
  constructor(props) {
    super(props);
    this.state = {
      types: this.props.pokemon.variant.types,
      typesReceived: false,
      typeEffectiveness: getDefaultTypeEffectiveness(),
    };
  }

  componentDidMount() {
    let { pokemon } = this.props;

    // Fetch details about the pokemon types from the API
    typePromises = this.getTypePromises(pokemon);
  }

  componentDidUpdate(prevProps) {
    let { pokemon } = this.props;

    // If the variant has changed
    if (prevProps.pokemon.variant.id !== this.props.pokemon.variant.id) {
      // Clear the existing promises
      typePromises = [];

      // Update state with the new pokemon types
      this.setState({
        types: this.props.pokemon.variant.types,
        typesReceived: false,
        typeEffectiveness: getDefaultTypeEffectiveness(),
      });

      // Get the type promises for the new pokemon
      typePromises = this.getTypePromises(pokemon);
    }

    // If the type promises have been retrieved, update the types in state
    if (typePromises.length && !this.state.typesReceived) {
      this.updateTypes(pokemon, typePromises);
    }
  }

  componentWillUnmount() {
    // Cancel the type promises
    if (typePromises.length) {
      typePromises.forEach((promise) => {
        cancelPromise(promise, errorHandler);
      });
    }
  }

  // Gets cancellable promises to return the type objects from the API
  getTypePromises = (pokemon) => {
    const types = pokemon.variant.types;
    let typePromises = [];
    if (types.length) {
      for (let i = 0; i < types.length; i++) {
        typePromises.push(makeCancellable(getResource(`${types[i].type.url}`)));
      }
    }
    return typePromises;
  };

  // Once all type promises have resolved, add the type details to the variant and update state
  updateTypes = (pokemon, typePromises) => {
    Promise.all(typePromises)
      .then((promises) => {
        (async () => {
          for (let i = 0; i < promises.length; i++) {
            try {
              pokemon.variant.types[i].details = await promises[i].promise;
            } catch (error) {
              errorHandler(error);
            }
          }
          let typeEffectiveness = getDefaultTypeEffectiveness();
          pokemon.variant.types.forEach((type) => {
            typeEffectiveness = this.calculateTypeEffectiveness(
              typeEffectiveness,
              type.details
            );
          });
          this.setState({
            types: pokemon.variant.types,
            typeEffectiveness: typeEffectiveness,
            typesReceived: true,
          });
        })();
      })
      .catch((error) => {
        errorHandler(error);
      });
  };

  // Calculates the effectiveness of each type against this pokemon
  calculateTypeEffectiveness = (typeEffectiveness, type) => {
    // Calculate double damage types
    if (type.damage_relations.double_damage_from.length) {
      type.damage_relations.double_damage_from.forEach((doubleType) => {
        typeEffectiveness[doubleType.name] =
          typeEffectiveness[doubleType.name] * 2;
      });
    }

    // Calculate half damage types
    if (type.damage_relations.half_damage_from.length) {
      type.damage_relations.half_damage_from.forEach((halfType) => {
        typeEffectiveness[halfType.name] =
          typeEffectiveness[halfType.name] * 0.5;
      });
    }

    // Calculate no damage types
    if (type.damage_relations.no_damage_from.length) {
      type.damage_relations.no_damage_from.forEach((immuneType) => {
        typeEffectiveness[immuneType.name] =
          typeEffectiveness[immuneType.name] * 0;
      });
    }
    return typeEffectiveness;
  };

  render() {
    // Get the type button click function from props
    const { filterBtnClick } = this.props;

    // If the type details have been received, returns the JSX to display the type effectiveness buttons
    const displayTypeEffectiveness = (
      types,
      effectivenessDescription,
      typesReceived
    ) => {
      if (typesReceived) {
        let typeBtns = [];
        for (let i = 0; i < types.length; i++) {
          typeBtns.push(
            <PokemonTypeBtn
              type={types[i][0]}
              effectiveness={types[i][1]}
              key={`${effectivenessDescription}-type-btn-${i}`}
              filterBtnClick={filterBtnClick}
            ></PokemonTypeBtn>
          );
        }
        if (!typeBtns.length) {
          typeBtns.push(
            <PokemonTypeBtn
              type={"none"}
              key={`${effectivenessDescription}-type-btn-0`}
              filterBtnClick={filterBtnClick}
            ></PokemonTypeBtn>
          );
        }
        return typeBtns;
      } else {
        return <LoadingBarSmall></LoadingBarSmall>;
      }
    };

    let weakTypes = {};
    let normalTypes = {};
    let resistantTypes = {};
    let immuneTypes = {};
    const { typesReceived, typeEffectiveness } = this.state;

    // If the types have been received, get the weak, resistant and immune types
    if (typesReceived) {
      const typeEffectivenessArray = Object.entries(typeEffectiveness);

      // Get the types where the effectiveness is greater than 1 and sort by highest effectiveness first
      weakTypes = typeEffectivenessArray
        .filter(([key, value]) => value > 1)
        .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));

      // Get the types where the effectiveness is 1
      normalTypes = typeEffectivenessArray.filter(
        ([key, value]) => value === 1
      );

      // Get the types where the effectiveness is less than 1 but not 0 and sort by highest effectiveness first
      resistantTypes = typeEffectivenessArray
        .filter(([key, value]) => value < 1 && value !== 0)
        .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1]));

      // Get the types where the effectiveness is 0
      immuneTypes = typeEffectivenessArray.filter(
        ([key, value]) => value === 0
      );
    }

    return (
      <ModalRow>
        <ModalInfoItem
          label="Type effectiveness"
          id="pokemon-type-effectiveness"
        >
          <p>
            The effectiveness of move types on this pokémon under normal battle
            conditions.
          </p>
          <ModalRow>
            <ModalInfoItem
              label="Weak to"
              id="pokemon-types-weak"
              subitem={true}
              row={true}
            >
              {displayTypeEffectiveness(weakTypes, "weak", typesReceived)}
            </ModalInfoItem>
          </ModalRow>
          <ModalRow>
            <ModalInfoItem
              label="Damaged normally by"
              id="pokemon-types-normal"
              subitem={true}
              row={true}
            >
              {displayTypeEffectiveness(normalTypes, "normal", typesReceived)}
            </ModalInfoItem>
          </ModalRow>
          <ModalRow>
            <ModalInfoItem
              label="Resistant to"
              id="pokemon-types-resistant"
              subitem={true}
              row={true}
            >
              {displayTypeEffectiveness(
                resistantTypes,
                "resistant",
                typesReceived
              )}
            </ModalInfoItem>
          </ModalRow>
          <ModalRow>
            <ModalInfoItem
              label="Immune to"
              id="pokemon-types-immune"
              subitem={true}
              row={true}
            >
              {displayTypeEffectiveness(immuneTypes, "immune", typesReceived)}
            </ModalInfoItem>
          </ModalRow>
        </ModalInfoItem>
      </ModalRow>
    );
  }
}

export default PokemonTypeEffectiveness;
