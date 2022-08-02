import React, { useEffect, useState, useRef } from "react";
import "./ProgressBar.scss";

const useInterval = (callback, delay) => {
  const savedCallback = useRef();

  // Update the saved callback only if it has changed
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    // Set up the interval to run the saved callback at the specified delay
    let interval = setInterval(() => {
      savedCallback.current();
    }, delay);

    // Clear the interval when the component unmounts
    return () => clearInterval(interval);
  }, [delay]);
};

const ProgressBar = () => {
  const [progress, setProgress] = useState(0);

  // This is only a dummy progress bar so we will simply increment the progress every 0.75s
  useInterval(() => {
    // If the progress bar is less than 99%, increment
    if (progress < 99) {
      // Maximum progress that can be made without going over 99%
      let max = 98 - progress;
      // Increase the progress by a random number up to 12 (or up to the max if that is less than 12)
      setProgress(
        (progress) =>
          progress + (Math.floor(Math.random() * Math.min(max, 12)) + 2)
      );
    }
  }, 750);

  // Renders the progress
  const renderProgress = (progress) => {
    // If the progress is less than 40% show the label to the right of the bar
    if (progress < 40) {
      return (
        <>
          <span
            className="progress-bar-inner"
            style={{
              width: progress + "%",
            }}
          ></span>
          <span className="progress-amount">{progress}%</span>
        </>
      );
    }
    // Otherwise, show the label inside the progress bar
    else {
      return (
        <span
          className="progress-bar-inner"
          style={{
            width: progress + "%",
          }}
        >
          <span className="progress-amount">{progress}%</span>
        </span>
      );
    }
  };

  return (
    <div className="progress-bar">
      <span className="progress-bar-label">Loading: </span>
      <span className="progress-bar-outer">{renderProgress(progress)}</span>
    </div>
  );
};

export default ProgressBar;
