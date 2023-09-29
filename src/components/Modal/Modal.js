import React, { useState, useEffect, useRef } from "react";
import "./Modal.scss";
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
import { getResource } from "../../utils/pokeApiUtils";
import ModalRibbon from "./ModalRibbon";

const Modal = ({ active, hideModal, filterBtnClick, pokemon }) => {
  const infoPanelRef = useRef();
  const modalMainRef = useRef();

  const [pokemonState, setPokemonState] = useState(pokemon);
  const [formsOfCurrentVariantReceived, setFormsOfCurrentVariantReceived] =
    useState(false);

  // Prevents clicks on the inner modal div triggering the outer modal click event
  const innerModalClick = (event) => {
    event.stopPropagation();
  };

  // Scrolls the referred element to the top
  const scrollToTop = (ref) => ref.current.scroll({ top: 0, behavior: "auto" });

  // Fetch forms from the API if the pokemon has changed
  useEffect(() => {
    let mounted = true;
    let controller = new AbortController();

    const formsArray = pokemonState.variant.forms;
    let pokemonWithFormDetails = pokemonState;

    (async () => {
      if (formsArray.length && !formsOfCurrentVariantReceived) {
        for (let i = 0; i < formsArray.length; i++) {
          try {
            pokemonWithFormDetails.variant.forms[i].details = await getResource(
              `${formsArray[i].url}`,
              {
                signal: controller.signal,
              }
            );
          } catch (error) {
            console.error(error);
          }
        }
      }

      if (mounted) {
        setPokemonState(pokemonWithFormDetails);
        setFormsOfCurrentVariantReceived(true);
      }
    })();

    // Cleanup on unmount
    return () => {
      controller?.abort();
      mounted = false;
    };
  }, [pokemonState, formsOfCurrentVariantReceived]);

  // Refreshes the modal with a different pokemon
  const refreshModal = (newPokemon) => {
    // Scroll the modal elements back to the top
    scrollToTop(modalMainRef);
    scrollToTop(infoPanelRef);
    // Set the modal state for the new pokemon
    setPokemonState(newPokemon);
    setFormsOfCurrentVariantReceived(false);
  };

  // If the active state becomes false, hide the modal
  const visibleClassName = active ? "visible" : "hidden";

  return (
    <div className={`modal ${visibleClassName}`} onClick={hideModal}>
      <ModalExitBtn hideModal={hideModal} id="btn-modal-exit-portrait" />
      <section
        className="modal-main"
        onClick={innerModalClick}
        ref={modalMainRef}
      >
        <ModalExitBtn hideModal={hideModal} id="btn-modal-exit-landscape" />
        <ModalRibbon pokemon={pokemonState} />
        <ModalImagePanel
          pokemon={pokemonState}
          key={`image-${pokemonState.variant.id}`}
        />
        <div className="modal-info-panel" ref={infoPanelRef}>
          <PokemonDescription
            pokemon={pokemonState}
            key={`description-${pokemonState.species.id}`}
          />
          <ModalRow id="modal-top-row">
            <PokemonTypes
              pokemon={pokemonState}
              key={`types-${pokemonState.variant.id}`}
              filterBtnClick={filterBtnClick}
            />
            <PokemonHabitat
              pokemon={pokemonState}
              key={`habitat-${pokemonState.species.id}`}
            />
            <PokemonGender
              pokemon={pokemonState}
              key={`gender-${pokemonState.species.id}`}
            />
            <PokemonCatchRate
              pokemon={pokemonState}
              key={`catch-rate-${pokemonState.species.id}`}
            />
            <PokemonHeight
              pokemon={pokemonState}
              key={`height-${pokemonState.variant.id}`}
            />
            <PokemonWeight
              pokemon={pokemonState}
              key={`weight-${pokemonState.variant.id}`}
            />
          </ModalRow>
          <ModalRow id="modal-centre-section">
            <ModalColumn>
              <PokemonBaseStats
                pokemon={pokemonState}
                key={`base-stats-${pokemonState.variant.id}`}
              />
              <PokemonAbilities
                pokemon={pokemonState}
                key={`abilities-${pokemonState.variant.id}`}
              />
              <PokemonTraining
                pokemon={pokemonState}
                key={`training-${pokemonState.variant.id}`}
              />
            </ModalColumn>
            <ModalColumn>
              <PokemonTypeEffectiveness
                pokemon={pokemonState}
                key={`type-effectiveness-${pokemonState.variant.id}`}
                filterBtnClick={filterBtnClick}
              />
            </ModalColumn>
          </ModalRow>
          <PokemonEvolution
            pokemon={pokemonState}
            clickHandler={refreshModal}
            key={`evolution-${pokemonState.variant.id}`}
          />
          <PokemonOtherForms
            pokemon={pokemonState}
            formsOfCurrentVariantReceived={formsOfCurrentVariantReceived}
            refreshModal={refreshModal}
            key={`other-forms-${pokemonState.variant.id}`}
          />
        </div>
      </section>
    </div>
  );
};

export default Modal;
