/// <reference types="cypress" />

import { currentWeatherSchema } from "../../schema/weather/CurrentWeatherResponse";
import Units from "../../enum/Units";
import locationParams from "../../fixtures/api/weather/LocationMetricParams.json";
import invalidAuthTestData from "../../fixtures/api/weather/InvalidAuthTestData.json";

context("Weather AI — Current Weather API Tests", () => {
  context("Positive Tests", () => {
    //Happy path test
    it("T-0001 Returns 200 with valid params and Bearer token, response matches schema", () => {
      cy.getCurrentWeather({ ...locationParams }).then((response) => {
        currentWeatherSchema.validateSync(response.body, { strict: true });
        cy.assertAPIResponse({
          response,
          httpStatus: 200,
          responseDuration: 3000,
          // could not validate this response using fixture file because the response is dynamic and changes alot.
          dynamicProps: ["current.time", "daily", "hourly"],
        });
      });
    });

    //Edge cases
    it("T-0002 Echoes back requested lat/lon/units in the response body", () => {
      cy.getCurrentWeather({ ...locationParams }).then((response) => {
        cy.assertAPIResponse({ response, httpStatus: 200 });
        expect(response.body.lat).to.eq(locationParams.lat);
        expect(response.body.lon).to.eq(locationParams.lon);
        expect(response.body.units).to.eq(locationParams.units);
      });
    });

    it("T-0003 daily array length equals the response days count", () => {
      cy.getCurrentWeather({ ...locationParams }).then((response) => {
        cy.assertAPIResponse({ response, httpStatus: 200 });
        expect(response.body.daily).to.have.length(response.body.days);
      });
    });

    it('T-0004 units=imperial returns 200 with units field = "imperial"', () => {
      cy.getCurrentWeather({ ...locationParams, units: Units.IMPERIAL }).then((response) => {
        cy.assertAPIResponse({ response, httpStatus: 200 });
        expect(response.body.units).to.eq(Units.IMPERIAL);
      });
    });
  });

  context("Negative Tests", () => {
    invalidAuthTestData.forEach(({ description, headerOverride, expectedStatus, expectedError }) => {
      it(description, () => {
        cy.getCurrentWeather({ ...locationParams, headers: headerOverride }).then((response) => {
          cy.assertAPIResponse({ response, httpStatus: expectedStatus, expectedError });
        });
      });
    });

    // SKIPPED: api.weather-ai.co returns 502 for out-of-range lat instead of 400. 502 may be a server-side bug in api.weather-ai.co as it is not expected behavior.
    // Re-enable once the wrapper validates lat/lon before proxying upstream.
    // PLACEHOLDER expectedError — update once the wrapper returns a real 400 body.
    it.skip("T-0008 Out-of-range latitude (lat=999) returns 400", () => {
      cy.getCurrentWeather({ lat: 999, lon: locationParams.lon, units: locationParams.units }).then((response) => {
        cy.assertAPIResponse({
          response,
          httpStatus: 400,
          expectedError: { error: "Bad request" },
        });
      });
    });

    // SKIPPED: api.weather-ai.co returns 200 and defaults to metric units for invalid units instead of 400. 200 may be a server-side bug in api.weather-ai.co as it is not expected behavior.
    // Re-enable once units validations are in place.
    // PLACEHOLDER expectedError — update once the wrapper returns a real 400 body.
    it.skip("T-0009 Invalid units (units=kilometer) returns 400", () => {
      cy.getCurrentWeather({ lat: locationParams.lat, lon: locationParams.lon, units: "kilometer" }).then((response) => {
        cy.assertAPIResponse({
          response,
          httpStatus: 400,
          expectedError: { error: "Bad request" },
        });
      });
    });
  });
});