import React, { Component } from "react";
import "./Modal.scss";
import PropTypes from "prop-types";
import ModalExitBtn from "./ModalExitBtn.js";
import ModalImagePanel from "./ModalImagePanel.js";
import ModalRow from "./ModalRow";
import ModalInfoItem from "./ModalInfoItem";
import ModalInfoValue from "./ModalInfoValue";
import ModalColumn from "./ModalColumn";
import PokemonDescription from "./PokemonDescription";
import PokemonTypeBtn from "./PokemonTypeBtn";
import PokemonAbility from "./PokemonAbility";
import PokemonStatTable from "./PokemonStatTable";
import CardList from "./CardList";
import { getName, textCleanup } from "../helpers.js";

// Constants for the Poke API
const Pokedex = require("pokeapi-js-wrapper");
const customOptions = {
  cacheImages: true,
};
const PokeApi = new Pokedex.Pokedex(customOptions);

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

// Resets the state of the modal to the default values
const resetState = () => ({
  abilitiesReceived: false,
  typesReceived: false,
  formsReceived: false,
  otherVariants: [],
  typeEffectiveness: getDefaultTypeEffectiveness(),
});

class Modal extends Component {
  constructor(props) {
    super(props);
    this.infoPanelRef = React.createRef();
    this.modalMainRef = React.createRef();
    this.refreshModal = this.refreshModal.bind(this);
    this.state = {
      ...resetState(),
      species: this.props.species,
      variant: this.props.variant,
      form: this.props.form,
    };
  }
  static propTypes = {
    showModal: PropTypes.bool,
    species: PropTypes.object.isRequired,
    variant: PropTypes.object.isRequired,
    form: PropTypes.object.isRequired,
    hideModal: PropTypes.func,
  };

  // Prevents clicks on the inner modal div triggering the outer modal click event
  innerModalClick(event) {
    event.stopPropagation();
  }

  componentDidMount() {
    // Fetch the details about abilities, types and other variants from the API
    this.getPokemonAbilityObjects(this.state.variant);
    this.getPokemonTypeObjects(this.state.variant);
    this.getPokemonFormObjects(this.state.variant);
    this.getOtherVariants(this.state.species, this.state.variant);
  }

  // Gets the pokemon ability objects from the API
  getPokemonAbilityObjects = (variant) => {
    if (variant.abilities.length) {
      try {
        (async () => {
          for (let i = 0; i < variant.abilities.length; i++) {
            const abilityObject = await PokeApi.resource(
              `${variant.abilities[i].ability.url}`
            );
            variant.abilities[i].details = abilityObject;
          }
          this.setState({
            variant: variant,
            abilitiesReceived: true,
          });
        })();
      } catch {
        console.error(`Failed to get ability object`);
      }
    }
  };

  // Calculates the effectiveness of each type against this pokemon
  calculateTypeEffectiveness = (type) => {
    let typeEffectiveness = getDefaultTypeEffectiveness();

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

  // Gets the pokemon type objects from the API
  getPokemonTypeObjects = (variant) => {
    let typeEffectiveness;
    if (variant.types.length) {
      try {
        (async () => {
          for (let i = 0; i < variant.types.length; i++) {
            const typeObject = await PokeApi.resource(
              `${variant.types[i].type.url}`
            );
            variant.types[i].details = typeObject;
            typeEffectiveness = this.calculateTypeEffectiveness(typeObject);
          }
          this.setState({
            variant: variant,
            typeEffectiveness: typeEffectiveness,
            typesReceived: true,
          });
        })();
      } catch {
        console.error(`Failed to get type object`);
      }
    }
  };

  // Gets the pokemon form objects from the API and returns the variant with forms added
  addFormsToVariant = async (variant) => {
    if (variant.forms.length) {
      try {
        for (let i = 0; i < variant.forms.length; i++) {
          const formObject = await PokeApi.resource(`${variant.forms[i].url}`);
          variant.forms[i].details = formObject;
        }
        return variant;
      } catch {
        console.error(`Failed to get form object`);
      }
    }
  };

  // Gets the form objects of the current pokemon variant and adds updated variant to state
  getPokemonFormObjects = (variant) => {
    if (!this.state.formsReceived) {
      try {
        (async () => {
          variant = await this.addFormsToVariant(variant);
          this.setState({
            variant: variant,
            formsReceived: true,
          });
        })();
      } catch {
        console.error(`Failed to get forms for the current variant`);
      }
    }
  };

  // Gets the other variants of this pokemon species from the API
  getOtherVariants = (species, currentVariant) => {
    const otherVariantsToGet = species.varieties.filter(
      (variant) => variant.pokemon.name !== currentVariant.name
    );
    let otherVariants = [];
    if (otherVariantsToGet.length) {
      try {
        (async () => {
          for (let i = 0; i < otherVariantsToGet.length; i++) {
            let variantObject = await PokeApi.resource(
              otherVariantsToGet[i].pokemon.url
            );
            otherVariants[i] = await this.addFormsToVariant(variantObject);
          }
          this.setState({
            otherVariants: otherVariants,
          });
        })();
      } catch {
        console.error(`Failed to get other variants`);
      }
    }
  };

  // Scrolls the referred element to the top
  scrollToTop = (ref) => ref.current.scroll({ top: 0, behavior: "auto" });

  // Refreshes the modal with a different pokemon
  refreshModal = (pokemon) => {
    // Scroll the modal elements back to the top
    this.scrollToTop(this.modalMainRef);
    this.scrollToTop(this.infoPanelRef);
    // Set the modal state for the new pokemon
    this.setState(
      {
        ...resetState(),
        species: pokemon.species,
        variant: pokemon.variant,
        form: pokemon.form,
      },
      () => {
        // Once state has changed, fetch the new abilities, types and other variants from the API
        this.getPokemonAbilityObjects(pokemon.variant);
        this.getPokemonTypeObjects(pokemon.variant);
        this.getPokemonFormObjects(pokemon.variant);
        this.getOtherVariants(pokemon.species, pokemon.variant);
      }
    );
  };

  render() {
    const { showModal, hideModal } = this.props;

    const {
      species,
      variant,
      form,
      abilitiesReceived,
      typeEffectiveness,
      typesReceived,
      otherVariants,
      formsReceived,
    } = this.state;

    // If the showModal state becomes false, hide the modal
    const visibleClassName = showModal ? "visible" : "hidden";

    // Gets the pokemon height in metres
    const getHeightInMetres = (height) => {
      return height / 10;
    };

    // Gets the pokemon height in feet
    const getHeightInFeet = (height) => {
      return getHeightInMetres(height) * 3.28084;
    };

    // Gets the remaining inches from the pokemon height in feet
    const getHeightRemainingInches = (height) => {
      return (getHeightInMetres(height) % 1) * 12;
    };

    // Gets the pokemon weight in kilograms
    const getWeightInKilograms = (weight) => {
      return weight / 10;
    };

    // Gets the pokemon weight in pounds
    const getWeightInPounds = (weight) => {
      return (getWeightInKilograms(weight) * 2.205).toFixed(1);
    };

    // Get catch rate as a percentage
    const getCapturePercent = (captureRate) => {
      return ((captureRate / 255) * 100).toFixed(2);
    };

    // Get the female gender percentage
    const getFemalePercent = (genderRate) => {
      let femalePercent = (genderRate / 8) * 100;
      return femalePercent % 1 === 0 ? femalePercent : femalePercent.toFixed(1);
    };

    // Get the male gender percentage
    const getMalePercent = (femalePercent) => {
      let malePercent = 100 - femalePercent;
      return malePercent % 1 === 0 ? malePercent : malePercent.toFixed(1);
    };

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
            ></PokemonTypeBtn>
          );
        }
        if (!typeBtns.length) {
          typeBtns.push(
            <PokemonTypeBtn
              type={"none"}
              key={`${effectivenessDescription}-type-btn-0`}
            ></PokemonTypeBtn>
          );
        }
        return typeBtns;
      } else {
        return <span>Loading type effectiveness...</span>;
      }
    };

    // Get pokemon information for display on the modal
    const types = form?.details?.types?.length
      ? form.details.types
      : variant.types;
    const habitat = form?.details?.is_battle_only
      ? "Battle"
      : species.habitat?.name;
    const height = variant.height;
    const heightInMetres = getHeightInMetres(height);
    const heightInFeetInches = `${parseInt(
      getHeightInFeet(height)
    )}' ${parseInt(getHeightRemainingInches(height))}"`;
    const weight = variant.weight;
    const weightInKilos = getWeightInKilograms(weight);
    const weightInPounds = getWeightInPounds(weight);
    const captureRate = species.capture_rate;
    const capturePercent = getCapturePercent(captureRate);
    const baseStats = variant.stats;
    const abilities = variant.abilities;
    const baseExperience = variant.base_experience;
    const baseFriendship = species.base_happiness;
    const growthRate = species.growth_rate.name;
    const genderRate = species.gender_rate;
    const femalePercent = getFemalePercent(genderRate);
    const malePercent = getMalePercent(femalePercent);
    const eggGroups = species.egg_groups;
    let allForms = [];

    // Display the habitat if there is one
    const displayHabitat = (habitat) => {
      if (habitat) {
        return (
          <ModalInfoItem label="Habitat" id="modal-habitat" subitem={true}>
            <ModalInfoValue value={textCleanup(habitat)}></ModalInfoValue>
          </ModalInfoItem>
        );
      }
    };

    // If the pokemon can be caught (i.e. isn't battle-only) display the catch rate.
    const displayCatchRate = (form, captureRate, capturePercent) => {
      if (!form.details?.is_battle_only) {
        return (
          <ModalInfoItem
            label="Catch rate"
            id="modal-catch-rate"
            subitem={true}
          >
            <ModalInfoValue value={captureRate}></ModalInfoValue>
            <ModalInfoValue
              value={`~ ${capturePercent}`}
              unit="%"
              alternative={true}
            ></ModalInfoValue>
          </ModalInfoItem>
        );
      }
    };

    // Displays the training details, depending on if the pokemon is battle-only or not
    const displayTrainingDetails = (
      form,
      baseExperience,
      baseFriendship,
      growthRate
    ) => {
      if (form.details?.is_battle_only) {
        return <p>This is a battle-only form which cannot be trained.</p>;
      } else {
        return (
          <ModalRow>
            <ModalInfoItem
              label="Base Experience"
              id="modal-base-exp"
              subitem={true}
            >
              <ModalInfoValue value={baseExperience}></ModalInfoValue>
            </ModalInfoItem>
            <ModalInfoItem
              label="Base Friendship"
              id="modal-base-friendship"
              subitem={true}
            >
              <ModalInfoValue value={baseFriendship}></ModalInfoValue>
            </ModalInfoItem>
            <ModalInfoItem
              label="Growth rate"
              id="modal-growth-rate"
              subitem={true}
            >
              <ModalInfoValue value={textCleanup(growthRate)}></ModalInfoValue>
            </ModalInfoItem>
          </ModalRow>
        );
      }
    };

    // Get the gender rates for rendering
    const getGenderSplit = (genderRate) => {
      if (genderRate === -1) {
        return <ModalInfoValue value={`No gender`}></ModalInfoValue>;
      } else {
        return (
          <>
            <ModalInfoValue
              value={`\u2640 ${femalePercent}`}
              unit="%"
            ></ModalInfoValue>
            <ModalInfoValue
              value={`\u2642 ${malePercent}`}
              unit="%"
            ></ModalInfoValue>
          </>
        );
      }
    };

    // Displays the breeding details, depending on if the pokemon is battle-only or not
    const displayBreedingDetails = (form, genderRate, eggGroups) => {
      if (form.details?.is_battle_only) {
        return <p>This is a battle-only form which cannot be bred.</p>;
      } else {
        return (
          <ModalRow>
            <ModalInfoItem
              label="Gender"
              id="modal-gender"
              subitem={true}
              row={true}
            >
              {getGenderSplit(genderRate)}
            </ModalInfoItem>
            <ModalInfoItem
              label="Egg groups"
              id="modal-egg-groups"
              subitem={true}
            >
              {eggGroups.map((eggGroup, i) => {
                return (
                  <ModalInfoValue
                    value={textCleanup(eggGroup.name)}
                    key={eggGroup.name}
                  ></ModalInfoValue>
                );
              })}
            </ModalInfoItem>
          </ModalRow>
        );
      }
    };

    // Get the weak, resistant and immune types
    let weakTypes = {};
    let normalTypes = {};
    let resistantTypes = {};
    let immuneTypes = {};
    if (typesReceived) {
      const typeEffectivenessArray = Object.entries(typeEffectiveness);
      weakTypes = typeEffectivenessArray
        .filter(([key, value]) => value > 1) // Get the types where the effectiveness is greater than 1
        .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1])); // Sort the types, highest effectiveness first
      normalTypes = typeEffectivenessArray.filter(
        ([key, value]) => value === 1
      ); // Get the types where the effectiveness is 1
      resistantTypes = typeEffectivenessArray
        .filter(([key, value]) => value < 1 && value !== 0) // Get the types where the effectiveness is less than 1 but not 0
        .sort((a, b) => parseFloat(b[1]) - parseFloat(a[1])); // Sort the types, highest effectiveness first
      immuneTypes = typeEffectivenessArray.filter(
        ([key, value]) => value === 0
      ); // Get the types where the effectiveness is 0
    }

    // Returns an array of pokemon objects for each form of the variant
    const getPokemonObjectsForEachForm = (variant) => {
      let pokemonObjectsArray = [];
      variant.forms.forEach((form) => {
        pokemonObjectsArray.push({
          species: species,
          variant: variant,
          form: form,
        });
      });
      return pokemonObjectsArray;
    };

    // Add the forms of the current variant to the list for display
    if (formsReceived) {
      allForms.push(getPokemonObjectsForEachForm(variant));
    }

    // Add the forms of the other variants to the list for display
    if (formsReceived && otherVariants.length) {
      otherVariants.forEach((variant) => {
        allForms.push(getPokemonObjectsForEachForm(variant));
      });
    }

    // Displays a list of cards for the other forms of this pokemon, if they exist
    const displayAllForms = (allForms, currentPokemon, getName) => {
      const speciesName = getName(currentPokemon.species);

      // Gets the description of the different forms, if it exists
      const getFormDescription = (species) => {
        if (species.form_descriptions.length) {
          let formDescription;
          // Find the English description
          for (let i = 0; i < species.form_descriptions.length; i++) {
            if (species.form_descriptions[i].language.name === "en") {
              formDescription = species.form_descriptions[i].description;
            }
          }
          return <p>{formDescription}</p>;
        }
      };

      // If there's no form, set the form ID to be the variant ID as it must be the default form
      if (Object.keys(currentPokemon.form).length === 0) {
        currentPokemon.form = { details: { id: currentPokemon.variant.id } };
      }

      // Remove the current form from the list of other forms to show
      const otherFormsToShow = allForms.filter(
        (pokemon) => pokemon.form.details.id !== currentPokemon.form.details.id
      );

      // If there are multiple forms of the pokemon, render the Other Forms section
      if (allForms.length > 1) {
        return (
          <ModalRow>
            <ModalInfoItem label={`Other forms of ${speciesName}`}>
              {getFormDescription(currentPokemon.species)}
              <ModalColumn>
                <CardList
                  pokemonList={otherFormsToShow}
                  modal={true}
                  currentPokemon={currentPokemon}
                  clickHandler={this.refreshModal}
                />
              </ModalColumn>
            </ModalInfoItem>
          </ModalRow>
        );
      }
    };

    return (
      <div className={`modal ${visibleClassName}`} onClick={hideModal}>
        <section
          className="modal-main"
          onClick={this.innerModalClick}
          ref={this.modalMainRef}
        >
          <ModalExitBtn hideModal={hideModal} />
          <ModalImagePanel
            species={species}
            variant={variant}
            form={form}
          />
          <div className="modal-info-panel" ref={this.infoPanelRef}>
            <PokemonDescription species={species} />
            <ModalRow id="modal-top-row">
              <ModalRow>
                <ModalInfoItem
                  label="Types"
                  id="modal-types"
                  row={true}
                  subitem={true}
                >
                  {types.map((type, i) => {
                    return (
                      <PokemonTypeBtn
                        type={type.type.name}
                        key={`type-btn-${i}`}
                      ></PokemonTypeBtn>
                    );
                  })}
                </ModalInfoItem>
                {displayHabitat(habitat)}
              </ModalRow>
              <ModalRow>
                <ModalInfoItem label="Height" id="modal-height" subitem={true}>
                  <ModalInfoValue
                    value={heightInMetres}
                    unit="m"
                  ></ModalInfoValue>
                  <ModalInfoValue
                    value={heightInFeetInches}
                    unit="ft/in"
                    alternative={true}
                  ></ModalInfoValue>
                </ModalInfoItem>
                <ModalInfoItem label="Weight" id="modal-weight" subitem={true}>
                  <ModalInfoValue
                    value={weightInKilos}
                    unit="kg"
                  ></ModalInfoValue>
                  <ModalInfoValue
                    value={weightInPounds}
                    unit="lb"
                    alternative={true}
                  ></ModalInfoValue>
                </ModalInfoItem>
                {displayCatchRate(form, captureRate, capturePercent)}
              </ModalRow>
            </ModalRow>
            <ModalRow id="modal-centre-section">
              <ModalColumn>
                <ModalRow id="modal-base-stats">
                  <ModalInfoItem label="Base stats">
                    <PokemonStatTable
                      stats={baseStats}
                      types={types}
                    ></PokemonStatTable>
                  </ModalInfoItem>
                </ModalRow>
                <ModalRow id="modal-abilities">
                  <ModalInfoItem label="Abilities">
                    {abilities.map((ability, i) => {
                      return (
                        <PokemonAbility
                          ability={ability}
                          detailsReceived={abilitiesReceived}
                          key={`ability-${i}`}
                        ></PokemonAbility>
                      );
                    })}
                  </ModalInfoItem>
                </ModalRow>
                <ModalRow id="modal-training">
                  <ModalInfoItem label="Training">
                    {displayTrainingDetails(
                      form,
                      baseExperience,
                      baseFriendship,
                      growthRate
                    )}
                  </ModalInfoItem>
                </ModalRow>
                <ModalRow id="modal-breeding">
                  <ModalInfoItem label="Breeding">
                    {displayBreedingDetails(form, genderRate, eggGroups)}
                  </ModalInfoItem>
                </ModalRow>
              </ModalColumn>
              <ModalColumn>
                <ModalRow>
                  <ModalInfoItem
                    label="Type effectiveness"
                    id="modal-type-effectiveness"
                  >
                    <p>
                      The effectiveness of move types on this pokémon under
                      normal battle conditions.
                    </p>
                    <ModalRow>
                      <ModalInfoItem
                        label="Weak to"
                        id="modal-types-weak"
                        subitem={true}
                        row={true}
                      >
                        {displayTypeEffectiveness(
                          weakTypes,
                          "weak",
                          typesReceived
                        )}
                      </ModalInfoItem>
                    </ModalRow>
                    <ModalRow>
                      <ModalInfoItem
                        label="Damaged normally by"
                        id="modal-types-normal"
                        subitem={true}
                        row={true}
                      >
                        {displayTypeEffectiveness(
                          normalTypes,
                          "normal",
                          typesReceived
                        )}
                      </ModalInfoItem>
                    </ModalRow>
                    <ModalRow>
                      <ModalInfoItem
                        label="Resistant to"
                        id="modal-types-resistant"
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
                        id="modal-types-immune"
                        subitem={true}
                        row={true}
                      >
                        {displayTypeEffectiveness(
                          immuneTypes,
                          "immune",
                          typesReceived
                        )}
                      </ModalInfoItem>
                    </ModalRow>
                  </ModalInfoItem>
                </ModalRow>
              </ModalColumn>
            </ModalRow>
            {displayAllForms(allForms.flat(), {species: species, variant: variant, form: form }, getName)}
          </div>
        </section>
      </div>
    );
  }
}

export default Modal;
