import React from "react";
import "./ModalRow.scss";

const ModalRow = ({ id, children }) => {
  return <div className="modal-row" id={id}>{children}</div>;
};

export default ModalRow;
