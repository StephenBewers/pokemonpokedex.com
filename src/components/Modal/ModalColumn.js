import React from "react";
import "./ModalColumn.scss";

const ModalColumn = ({ id, children }) => {
  return <div className="modal-column" id={id}>{children}</div>;
};

export default ModalColumn;
