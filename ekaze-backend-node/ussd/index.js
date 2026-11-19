const ussdRoutes = require('./ussdRoutes');
const ussdController = require('./ussdController');
const ussdService = require('./ussdService');
const locales = require('./locales');

module.exports = {
  routes: ussdRoutes,
  controller: ussdController,
  service: ussdService,
  locales: locales
};
