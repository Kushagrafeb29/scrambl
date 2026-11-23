import ReactGA from 'react-ga4';

const TRACKING_ID = "G-060JNPH3K4"; // From firebase.js measurementId

export const initGA = () => {
  ReactGA.initialize(TRACKING_ID);
};

export const logPageView = (path) => {
  ReactGA.send({ hitType: "pageview", page: path });
};

export const logEvent = (category, action, label) => {
  ReactGA.event({
    category,
    action,
    label,
  });
};

export const logGameEvent = (level, action) => {
  ReactGA.event({
    category: "Game",
    action: action,
    label: `Level ${level}`,
  });
};
