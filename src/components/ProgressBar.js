import React, { Component } from "react";
import "./ProgressBar.scss";

class ProgressBar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      progress: 0,
    };
  }

  addProgress() {
    // If the progress bar is less than 99%, increment
    if (this.state.progress < 99) {
      // Maximum progress that can be made without going over 99%
      let max = 98 - this.state.progress;
      this.setState((state) => ({
        progress:
          state.progress + (Math.floor(Math.random() * Math.min(max, 12)) + 2),
      }));
    }
    // Otherwise, end the timer
    else {
      clearInterval(this.interval);
    }
  }

  componentDidMount() {
    this.interval = setInterval(() => this.addProgress(), 500);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  render() {
    const progress = this.state.progress;

    // Renders the progress
    const renderProgress = (progress) => {
      // If the progress is less than 20% show the label to the right of the bar
      if (progress < 20) {
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
          ><span className="progress-amount">{progress}%</span></span>
        );
      }
    };

    return (
      <div className="progress-bar">
        <span className="progress-bar-label">Loading: </span>
        <span className="progress-bar-outer">{renderProgress(progress)}</span>
      </div>
    );
  }
}

export default ProgressBar;
