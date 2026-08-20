# weather-api-cypress

Cypress 14 API test suite for the Weather AI `/v1/weather` endpoint.

## Prerequisites

- Node.js 20+
- npm
- A valid API key for `api.weather-ai.co`

## Local setup

```bash
npm install
cp .env.example .env
# open .env and paste the real key next to WEATHER_API_KEY
```

## Running the tests

Interactive (Cypress runner):

```bash
npm run cy:open
```

Headless (also produces the mochawesome report):

```bash
npm run cy:run
```

## Reporting

The suite uses [`cypress-mochawesome-reporter`](https://www.npmjs.com/package/cypress-mochawesome-reporter).

After a headless run:

```bash
npm run cy:run
open cypress/reports/index.html
```

The dashboard renders:

- Overall pass/fail/skip pie + duration bars
- Every `context` group as an expandable section, tests grouped under Positive / Negative
- Per-test request duration, assertion detail, and any thrown stack traces
- Embedded screenshots on failures (via `embeddedScreenshots: true` + `inlineAssets: true`, so the single HTML file is self-contained and shareable)

## Test strategy

- **Positive + negative contexts.** Positive tests (`T-0001..T-0004`) prove the happy path — status, schema shape, echoed params, and unit switching. Negative tests (`T-01xx`) cover auth failures and invalid input.
- **Schema validation with Yup.** [cypress/schema/weather/CurrentWeatherResponse.js](cypress/schema/weather/CurrentWeatherResponse.js) defines the response contract in `strict` mode so unexpected fields fail the test — catches provider drift, not just missing keys.
- **One shared assertion helper.** [`cy.assertAPIResponse`](cypress/support/api/assertion/api_assertion.js) checks status, response time, optional deep-prop presence (dot-paths for dynamic fields like `current.time`), optional fixture diff, and optional `expectedError` body match. Keeps each `it` block focused on the *what*, not the *how*.
- **Per-domain custom command.** [`cy.getCurrentWeather`](cypress/support/api/weather/api_weather.js) centralizes the base URL, auth header, and query string. Defaults `failOnStatusCode: false` so negative tests can assert their own 4xx/5xx.
- **Data-driven where the shape repeats.** The three auth-failure cases live in [InvalidAuthTestData.json](cypress/fixtures/api/weather/InvalidAuthTestData.json) and are iterated with `forEach` — one `it` per row, no duplicated setup. Single-case negatives (`T-0110`, `T-0111`) stay as standalone `it` blocks.
- **Enums for magic values.** [Units.js](cypress/enum/Units.js) exposes only *valid* units; invalid values in tests are passed as raw strings so the enum doesn't become a dumping ground.
- **Fixtures are location-agnostic.** [LocationMetricParams.json](cypress/fixtures/api/weather/LocationMetricParams.json) holds `{lat, lon, units}`; swap the coordinates without renaming anything.
- **Skipped tests document upstream bugs.** `T-0110` (out-of-range lat → 502) and `T-0111` (invalid units → 200) are `.skip`ped with a comment explaining the upstream defect and the placeholder `expectedError`. Preferred over loosening the assertion, which would hide the bug.
- **CI safety net.** `retries.runMode: 1` in [cypress.config.js](cypress.config.js) tolerates transient network flakes without masking deterministic failures (which still fail both attempts).

## CI

GitHub Actions workflow lives at [.github/workflows/cypress.yml](.github/workflows/cypress.yml). It runs on push to `main` or by the user on the repository's Actions page under Cypress Tests workflow.

Configure the repo (Settings → Secrets and variables → Actions):

- **Secret** `WEATHER_API_KEY` — the Bearer token used by the tests
- **Variable** `WEATHER_BASE_URL` — e.g. `https://api.weather-ai.co`

Two artifacts are uploaded per run:

- `mochawesome-report` — always uploaded (contains `cypress/reports/`)
- `cypress-screenshots` — uploaded only on failure

## Project layout

```
cypress/
  api/weather/CurrentWeather_spec.js      
  const/APIPaths.js
  enum/ContentType.js, Units.js
  fixtures/api/weather/
    LocationMetricParams.json
    InvalidAuthTestData.json
  schema/weather/CurrentWeatherResponse.js  # Yup schema
  support/
    e2e.js                                  
    commands.js                            
    api/weather/api_weather.js              
    api/assertion/api_assertion.js          
  utils/ObjectUtils.js
.gitignore
cypress.config.js
package.json
```
