import React from "react";
import "./ModalInfoItem.scss";

const ModalInfoItem = ({ label, id, subitem, row, children }) => {

    // Returns the correct class name for the info item
    const getItemClassName = () => {
        return subitem ? "modal-info-subitem" : "modal-info-item"
    }

    // Returns the correct class name for the label
    const getLabelClassName = () => {
        return subitem ? "modal-info-sublabel" : "modal-info-label"
    }

    // Returns the children ready for presentation
    const getChildren = () => {
        if (row) {
            return <span className="modal-info-values-row">{children}</span>
        } else {
            return <>{children}</>
        }
    }

    return (
        <div className={getItemClassName()} id={id}>
            <span className={getLabelClassName()}>{label}</span>
            {getChildren()}
        </div>
    )
}

export default ModalInfoItem;