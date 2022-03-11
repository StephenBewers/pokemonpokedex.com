import React, { Component } from "react";
import "./Modal.scss";
import PropTypes from "prop-types";
import ModalExitBtn from "./ModalExitBtn.js";
import ModalImagePanel from "./ModalImagePanel.js";
import ModalRow from "./ModalRow";
import ModalColumn from "./ModalColumn";
import PokemonDescription from "../Pokemon/PokemonDescription";
import PokemonTypes from "../Pokemon/PokemonTypes";
import PokemonHabitat from "../Pokemon/PokemonHabitat";
import PokemonCatchRate from "../Pokemon/PokemonCatchRate";
import PokemonHeight from "../Pokemon/PokemonHeight";
import PokemonWeight from "../Pokemon/PokemonWeight";
import PokemonAbilities from "../Pokemon/PokemonAbilities";
import PokemonBaseStats from "../Pokemon/PokemonBaseStats";
import PokemonGender from "../Pokemon/PokemonGender";
import PokemonTraining from "../Pokemon/PokemonTraining";
import PokemonTypeEffectiveness from "../Pokemon/PokemonTypeEffectiveness";
import PokemonOtherForms from "../Pokemon/PokemonOtherForms";
import PokemonEvolution from "../Pokemon/PokemonEvolution";
import { errorHandler, cancelPromise, getFormPromises } from "../../helpers.js";
import ModalRibbon from "./ModalRibbon";

// Array that will store promises to return the current variant forms. Promises will be cancelled on unmount.
let formOfCurrentVariantPromises = [];

class Modal extends Component {
  constructor(props) {
    super(props);
    this.infoPanelRef = React.createRef();
    this.modalMainRef = React.createRef();
    this.refreshModal = this.refreshModal.bind(this);
    this.state = {
      pokemon: this.props.pokemon,
      formsOfCurrentVariantReceived: false,
    };
  }
  static propTypes = {
    showModal: PropTypes.bool,
    pokemon: PropTypes.object.isRequired,
    hideModal: PropTypes.func,
    filterBtnClick: PropTypes.func,
  };

  // Prevents clicks on the inner modal div triggering the outer modal click event
  innerModalClick(event) {
    event.stopPropagation();
  }

  // Scrolls the referred element to the top
  scrollToTop = (ref) => ref.current.scroll({ top: 0, behavior: "auto" });

  componentDidMount() {
    let { pokemon } = this.state;

    // Fetch the different forms of the current variant from the API
    formOfCurrentVariantPromises = getFormPromises(pokemon);

    if (formOfCurrentVariantPromises.length) {
      this.updateForms(pokemon, formOfCurrentVariantPromises);
    }
  }

  componentWillUnmount() {
    // Cancel the form promises
    if (formOfCurrentVariantPromises.length) {
      formOfCurrentVariantPromises.forEach((promise) => {
        cancelPromise(promise, errorHandler);
      });
    }
  }

  // Once all form promises have resolved, add the form details to the variant and update state
  updateForms = (pokemon, formOfCurrentVariantPromises) => {
    Promise.all(formOfCurrentVariantPromises)
      .then((promises) => {
        (async () => {
          for (let i = 0; i < promises.length; i++) {
            try {
              pokemon.variant.forms[i].details = await promises[i].promise;
            } catch (error) {
              errorHandler(error);
            }
          }
          this.setState({
            pokemon: pokemon,
            formsOfCurrentVariantReceived: true,
          });
        })();
      })
      .catch((error) => {
        errorHandler(error);
      });
  };

  // Refreshes the modal with a different pokemon
  refreshModal = (pokemon) => {
    // Scroll the modal elements back to the top
    this.scrollToTop(this.modalMainRef);
    this.scrollToTop(this.infoPanelRef);
    // Set the modal state for the new pokemon
    this.setState(
      {
        pokemon: pokemon,
        formsOfCurrentVariantReceived: false,
      },
      () => {
        // Once state has changed, clear the existing promise array
        formOfCurrentVariantPromises = [];

        /* Then run the componentDidMount function
        to retrieve details for the new pokemon */
        this.componentDidMount();
      }
    );
  };

  render() {
    const { showModal, hideModal, filterBtnClick } = this.props;

    const { pokemon, formsOfCurrentVariantReceived } = this.state;

    // If the showModal state becomes false, hide the modal
    const visibleClassName = showModal ? "visible" : "hidden";

    return (
      <div className={`modal ${visibleClassName}`} onClick={hideModal}>
        <ModalExitBtn hideModal={hideModal} />
        <section
          className="modal-main"
          onClick={this.innerModalClick}
          ref={this.modalMainRef}
        >
          <ModalRibbon pokemon={pokemon} />
          <ModalImagePanel
            pokemon={pokemon}
            key={`image-${pokemon.variant.id}`}
          />
          <div className="modal-info-panel" ref={this.infoPanelRef}>
            <PokemonDescription
              pokemon={pokemon}
              key={`description-${pokemon.species.id}`}
            />
            <ModalRow id="modal-top-row">
              <PokemonTypes
                pokemon={pokemon}
                key={`types-${pokemon.variant.id}`}
                filterBtnClick={filterBtnClick}
              />
              <PokemonHabitat
                pokemon={pokemon}
                key={`habitat-${pokemon.species.id}`}
              />
              <PokemonCatchRate
                pokemon={pokemon}
                key={`catch-rate-${pokemon.species.id}`}
              />
              <PokemonHeight
                pokemon={pokemon}
                key={`height-${pokemon.variant.id}`}
              />
              <PokemonWeight
                pokemon={pokemon}
                key={`weight-${pokemon.variant.id}`}
              />
              <PokemonGender
                pokemon={pokemon}
                key={`gender-${pokemon.species.id}`}
              />
            </ModalRow>
            <ModalRow id="modal-centre-section">
              <ModalColumn>
                <PokemonBaseStats
                  pokemon={pokemon}
                  key={`base-stats-${pokemon.variant.id}`}
                />
                <PokemonAbilities
                  pokemon={pokemon}
                  key={`abilities-${pokemon.variant.id}`}
                />
                <PokemonTraining
                  pokemon={pokemon}
                  key={`training-${pokemon.variant.id}`}
                />
              </ModalColumn>
              <ModalColumn>
                <PokemonTypeEffectiveness
                  pokemon={pokemon}
                  key={`type-effectiveness-${pokemon.variant.id}`}
                  filterBtnClick={filterBtnClick}
                />
              </ModalColumn>
            </ModalRow>
            <PokemonEvolution
              pokemon={pokemon}
              clickHandler={this.refreshModal}
              key={`evolution-${pokemon.variant.id}`}
            />
            <PokemonOtherForms
              pokemon={pokemon}
              formsOfCurrentVariantReceived={formsOfCurrentVariantReceived}
              refreshModal={this.refreshModal}
              key={`other-forms-${pokemon.variant.id}`}
            />
          </div>
        </section>
      </div>
    );
  }
}

export default Modal;
