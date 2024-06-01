import PropTypes from "prop-types";

const DAY_IN_SECONDS = 86400;
const HOUR_IN_SECONDS = 3600;
const MINUTE_IN_SECONDS = 60;

const Time = ({ seconds }) => {
  const timeFormatted = formatTime(seconds);

  return <div style={{ display: "flex" }}>{timeFormatted}</div>;
};

const formatTime = (seconds: number) => {
  let days, hours, minutes;

  if (seconds < 60) {
    return `${seconds} seconds`;
  } else if (seconds < 3600) {
    minutes = Math.floor(seconds / 60);
    return `${minutes} minutes ${seconds % 60} seconds`;
  } else if (seconds < 86400) {
    hours = Math.floor(seconds / 3600);
    minutes = Math.floor((seconds % 3600) / 60);
    return `${hours} hours ${minutes} minutes`;
  } else {
    days = Math.floor(seconds / 86400);
    hours = Math.floor((seconds % 86400) / 3600);
    minutes = Math.floor(((seconds % 86400) % 3600) / 60);
    return `${days} days ${hours} hours ${minutes} minutes`;
  }
};

Time.propTypes = {
  seconds: PropTypes.number,
};

export default Time;
