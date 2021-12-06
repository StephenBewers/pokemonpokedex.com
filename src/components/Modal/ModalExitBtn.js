import React from "react";
import "./ModalExitBtn.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const ModalExitBtn = ({hideModal}) => {
    
    return (
        <div className="btn-modal-exit" role="button" onClick={hideModal}>
            <FontAwesomeIcon icon={faTimes} />
        </div>
    );
};

export default ModalExitBtn;