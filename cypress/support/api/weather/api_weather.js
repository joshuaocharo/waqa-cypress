/// <reference types="cypress" />

import ContentType from '../../../enum/ContentType';
import { WEATHER_ENDPOINT } from '../../../const/APIPaths';

Cypress.Commands.add('getCurrentWeather', ({
  lat,
  lon,
  units = 'metric',
  headers = null,
  failOnStatusCode = false,
} = {}) => {
  const baseUrl = Cypress.env('WEATHER_BASE_URL') || 'https://api.weather-ai.co';
  const apiKey = Cypress.env('WEATHER_API_KEY');

  const defaultHeaders = {
    'content-type': ContentType.APPLICATION_JSON,
    'accept': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };

  const finalHeaders = headers === null ? defaultHeaders : headers;

  return cy.request({
    method: 'GET',
    url: `${baseUrl}${WEATHER_ENDPOINT}`,
    qs: { lat, lon, units },
    headers: finalHeaders,
    failOnStatusCode,
  });
});