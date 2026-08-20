import { deleteNestedKeys, sortKeys } from '../../../utils/ObjectUtils';

const assertIfPropsExist = ({ obj, dynamicProps }) => {
  dynamicProps.forEach((keyPath) => {
    if (keyPath.includes('.')) {
      const tempKeys = keyPath.split('.');
      const keyName = tempKeys.slice(-1)[0];
      tempKeys.splice(-1);
      const tempPropPath = `obj['${tempKeys.join('.').replaceAll('.', "']['")}']`;

      if (!eval(`Array.isArray(${tempPropPath})`)) {
        expect(eval(tempPropPath), keyName).to.have.property(keyName);
      } else {
        eval(tempPropPath).forEach((item) => {
          expect(item, keyName).to.have.property(keyName);
        });
      }
    } else {
      expect(obj, keyPath).to.have.property(keyPath);
    }
  });
};

Cypress.Commands.add('assertAPIResponse', ({
  response,
  httpStatus,
  responseDuration = 3000,
  dynamicProps = null,
  resultsFixturePath = null,
  propsToBeDeleted = null,
  expectedError = null,
  dynamicErrorProps = ['timestamp'],
}) => {
  expect(response.status).to.eq(httpStatus);

  if (dynamicProps) {
    assertIfPropsExist({ obj: response.body, dynamicProps });
  }

  if (responseDuration) {
    expect(response.duration, 'response time').to.not.be.greaterThan(responseDuration);
  }

  if (resultsFixturePath && propsToBeDeleted) {
    let filteredResponse = deleteNestedKeys(Cypress._.cloneDeep(response.body), propsToBeDeleted);
    cy.fixture(resultsFixturePath).then((responseFixture) => {
      let filteredFixture = deleteNestedKeys(responseFixture, propsToBeDeleted);
      filteredFixture = sortKeys(filteredFixture);
      filteredResponse = sortKeys(filteredResponse);
      expect(JSON.stringify(filteredResponse), 'fixture and response assertion').to.deep.equal(
        JSON.stringify(filteredFixture),
      );
    });
  }

  if (expectedError) {
    let filteredResponseError = deleteNestedKeys(Cypress._.cloneDeep(response.body), dynamicErrorProps);
    if (filteredResponseError.errors) {
      filteredResponseError.errors.sort();
    }
    filteredResponseError = sortKeys(filteredResponseError);
    let filteredExpectedError = sortKeys(expectedError);
    if (filteredExpectedError.errors) {
      filteredExpectedError.errors.sort();
    }
    expect(JSON.stringify(filteredResponseError), 'expected error assertion').to.deep.equal(
      JSON.stringify(filteredExpectedError),
    );
  }
});