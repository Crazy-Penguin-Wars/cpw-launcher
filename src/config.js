const DEFAULT_SERVER_URL = process.env.CPW_SERVER_URL || "https://michielvde.eu.pythonanywhere.com";
const LOCAL_TEST_SERVER_URL = "http://127.0.0.1:8000";

function originFor(url) {
  return new URL(url).origin;
}

const ALLOWED_SERVER_ORIGINS = new Set([
  originFor(DEFAULT_SERVER_URL),
  originFor(LOCAL_TEST_SERVER_URL),
]);

module.exports = {
  DEFAULT_SERVER_URL,
  ALLOWED_SERVER_ORIGINS,
};
