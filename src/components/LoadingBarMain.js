import React from "react";
import "./LoadingBarMain.scss";

const LoadingBarMain = ({ loadingLabel }) => {

  // If loading label text has been supplied, render the loading label element
  let loadingLabelElement;
  if (loadingLabel) {
    loadingLabelElement = <p className={`loading-label`}>{loadingLabel}</p>;
  }

  return (
    <div className={`loading-bar`}>
      {loadingLabelElement}
      <div className={`lds-ellipsis`}>
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </div>
  );
};

export default LoadingBarMain;
