/* This file contains utility functions for Google Analytics */

import ReactGA from "react-ga4";

export const initGA = (trackingId) => {
  if (process.env.NODE_ENV === "production") {
    ReactGA.initialize(trackingId);
    ReactGA.send("pageview");
  }
};