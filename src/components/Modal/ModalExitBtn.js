import React from "react";
import "./ModalExitBtn.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const ModalExitBtn = ({id, hideModal}) => {
    
    return (
        <button className="btn-modal-exit" id={id} type="button" aria-label="Close modal" onClick={hideModal}>
            <FontAwesomeIcon icon={faTimes} />
        </button>
    );
};

export default ModalExitBtn;