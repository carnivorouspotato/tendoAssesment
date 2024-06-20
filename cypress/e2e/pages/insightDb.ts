import { Facility } from '../../support/interfaces';
import insightDbSelectors from '../../utils/insightDbSelectors.json';
let monthlyComorbidityCBVD: any;
let monthlyComorbidityHeartFailure: any;
let comorbidityBySpecialtyCBVD: any;
let comorbidityBySpecialtyHeartfailure: any;

function getDate() {
  const date = new Date();
  date.setMonth(date.getMonth() - 1);
  const previousMonth = date.getMonth() + 1;
  const year = date.getFullYear();
  return `${previousMonth}/${year}`;
}
export default class insightDashboard {
  usersRole(userName: string) {
    type User = {
      id: number;
      email: string;
      first_name: string;
      last_name: string;
      permissions: string;
    }
     cy.request('GET', `https://reqres.in/api/users?userName=${userName}`).then((response: any) => {
      const userPermissions: User = response.data;
       return userPermissions.permissions;
    });
  }

  isInsightDashboardPageHealthy() {
    cy.intercept('GET', '/api/endpoint').as('apiCheck');
    cy.visit('http://localhost:3000/insight-dashboard');
    cy.wait('@apiCheck').then((apiIntercept) => {
      expect(apiIntercept.response.body, 'API call has data');
      expect(apiIntercept.response.statusCode).to.equal(200);
    });
  }

  createFacility() {
    interface newFacility {
      id: number;
    }
    const query = `CREATE TABLE facilities (
    id INT PRIMARY KEY AUTO_INCREMENT, -- Auto-incrementing ID
    facility_name VARCHAR(255) NOT NULL,
    monthly_summary JSON DEFAULT '{"value": null}', -- Default JSON object
    address VARCHAR(255),
    rating DECIMAL(3, 2), -- Allows for ratings like 4.5
    patient_capacity INT,
    number_of_staff INT,
    date_added TIMESTAMP DEFAULT CURRENT_TIMESTAMP -- Automatic timestamp
);`;
    cy.request('POST', 'https://example.com/api/sql/databricks', { query }).then((response) => {
      let facilityID: newFacility;
      return facilityID.id = response.body.id;
    });
  }

  inputFacilityData(facilityData: Facility) {
    const facilityID: any = this.createFacility();
    const query = `INSERT INTO facilities where id=${facilityID} (facility_name, monthly_summary, address, rating, patient_capacity, number_of_staff)
    VALUES ('${facilityData.facility_name}', '${facilityData.monthly_summary}', '${facilityData.address}', ${facilityData.rating}, ${facilityData.patient_capacity}, ${facilityData.number_of_staff});

);`;
    return cy.request('POST', 'https://example.com/api/sql/databricks', { query }).then((response) => {
       response.body;
    });
  }
  checkFacilityInsights(id: number) {
   return cy.request('GET', `https://example.com/api/insights?companyid=${id}`).then((response) => {
      const monthlySummaryArray = Object.entries(response.body.monthly_summary).map(([key, value]) => ({ key, value }));

      monthlySummaryArray.forEach((specality) => {
        expect(specality.value).to.equal(0);
      });
    });
  }
  checkFacilityReports(id: number) {
     return cy.request('GET', `https://example.com/api/reports?companyid=${id}`).then((response) => {
      const monthlySummaryArray: Array<{ key: string, value: number }> = Object.entries(response.body.monthly_summary).map(([key, value]) => ({
        key,
        value: value as number
      }));

      monthlySummaryArray.forEach((specality) => {
        expect(specality.value).to.equal(0);
      });

    });
  }

  checkDate(){
    cy.contains('Date Range').should('be.visible').then(() => {
      cy.get(insightDbSelectors.dateRangeSelector).within((dateRange) => {
        if (expect(dateRange.val()).to.contain(getDate())) {
          return;
        } else {
          throw new Error('Date range is not prior month.');
        }
      });
      return;
    });
  }

  getDashboardData() {
    monthlyComorbidityCBVD = cy.get(insightDbSelectors.monthlySummaryIframe.monthlySummaryIframeSelector).contains('CBVD').invoke('html', 'value');
    monthlyComorbidityHeartFailure = cy.get(insightDbSelectors.monthlySummaryIframe.monthlySummaryIframeSelector).contains('Heart Failure').invoke('html', 'value');
    comorbidityBySpecialtyCBVD = cy.get(insightDbSelectors.comorbidityIframe.comorbidityIframeSelector).contains('CBVD').invoke('html', 'value');
    comorbidityBySpecialtyHeartfailure = cy.get(insightDbSelectors.comorbidityIframe.comorbidityIframeSelector).contains('Heart Failure').invoke('html', 'value');
  return cy.writeFile('cypress/fixtures/insightDashboard.json', {
     monthlyComorbidity:{
       CBVD: monthlyComorbidityCBVD,
       HeartFailure: monthlyComorbidityHeartFailure
     },
     comorbidityBySpecialty:{
       CBVD: comorbidityBySpecialtyCBVD,
       HeartFailure: comorbidityBySpecialtyHeartfailure
     }
   }).then(()=>{
    cy.get(insightDbSelectors.dataUpdatedMessage).should('have.text', 'Data has been updated');
   });
  }

  changeDashboardValues(){
    cy.get(insightDbSelectors.dateRangeSelector).type('2024-01-05{tab}2024-30-05');
    cy.contains('Facility').should('be.visible').then(() => {
      cy.get(insightDbSelectors.facilitySelector).should('be.visible').type('Facility 1');
    });
    cy.contains('Specialty').should('be.visible').then(() => {
      cy.get(insightDbSelectors.specialtySelector).should('be.visible').type('Cardiology');
    });
  }

  getNewDashboardData() {
    cy.readFile('cypress/fixtures/insightDashboard.json').then((data) => {
      expect(data.monthlyComorbidity.CBVD).to.not.equal(monthlyComorbidityCBVD);
      expect(data.monthlyComorbidity.HeartFailure).to.not.equal(monthlyComorbidityHeartFailure);
      expect(data.comorbidityBySpecialty.CBVD).to.not.equal(comorbidityBySpecialtyCBVD);
      expect(data.comorbidityBySpecialty.HeartFailure).to.not.equal(comorbidityBySpecialtyHeartfailure);
    });
  }

  checkMonthlySummaryGraph(){
    const isUserAdmin = this.usersRole('drbun');
    cy.get(insightDbSelectors.monthlySummaryIframe.monthlySummaryDashboardBanner).should('contain.text', 'Monthly Summary of Comorbidity Opportunities').then(() => {
      cy.get(insightDbSelectors.monthlySummaryIframe.exportIcon).should('be.visible').click().then(() => {
        // @ts-ignore
        if (isUserAdmin === 'admin') {
          cy.get(insightDbSelectors.monthlySummaryIframe.exportAsPNG).and(insightDbSelectors.monthlySummaryIframe.exportAsPNG).should('be.visible').click().then(() => {
            cy.get(insightDbSelectors.exportSuccessfulMessage).should('be.visible').and('contain.text', 'Exported Successfully');
          });
          cy.get(insightDbSelectors.monthlySummaryIframe.exportAsJPEG).and(insightDbSelectors.monthlySummaryIframe.exportAsJPEG).should('be.visible').click().then(() => {
            cy.get(insightDbSelectors.exportSuccessfulMessage).should('be.visible').and('contain.text', 'Exported Successfully');
          });
        }
        cy.get(insightDbSelectors.monthlySummaryIframe.rotateGraph).should('be.visible').click().then(() => {
          cy.get(insightDbSelectors.monthlySummaryIframe.monthlySummaryIframeSelector).invoke('css', 'transform').should('contain', 'rotate(90deg)');
        });
        cy.get(insightDbSelectors.monthlySummaryIframe.toFullScreen).should('be.visible');
      });
    });
  }
  checkComorbidityGraph(){
    cy.get(insightDbSelectors.comorbidityIframe.comorbidityDashboardBanner).should('contain.text', 'Comorbidity Opportunities by Specialty').then(() => {
      cy.get(insightDbSelectors.comorbidityIframe.exportIcon).should('be.visible').click().then(() => {
          //@ts-ignore
          if (isUserAdmin === 'admin') {
            cy.get(insightDbSelectors.comorbidityIframe.exportAsPNG).and(insightDbSelectors.comorbidityIframe.exportAsPNG).should('be.visible').click().then(() => {
              cy.get(insightDbSelectors.exportSuccessfulMessage).should('be.visible').and('contain.text', 'Exported Successfully');
            });
            cy.get(insightDbSelectors.comorbidityIframe.exportIcon).click()
            cy.get(insightDbSelectors.comorbidityIframe.exportAsJPEG).and(insightDbSelectors.comorbidityIframe.exportAsJPEG).should('be.visible').click().then(() => {
              cy.get(insightDbSelectors.exportSuccessfulMessage).should('be.visible').and('contain.text', 'Exported Successfully');
            });
          }else{
            return;
          }
        cy.get(insightDbSelectors.comorbidityIframe.rotateGraph).should('be.visible').click().then(() => {
          cy.get(insightDbSelectors.comorbidityIframe.comorbidityIframeSelector).invoke('css', 'transform').should('contain', 'rotate(90deg)');
        });
        cy.get(insightDbSelectors.comorbidityIframe.toFullScreen).should('be.visible');
      });
    });
  }
  checkProviderScoreCard(){
    cy.get(insightDbSelectors.providerScorecardIFrame.providerDashboardBanner).should('contain.text', 'Provider Scorecard').then(() => {
      cy.get(insightDbSelectors.providerScorecardIFrame.exportIcon).should('be.visible').click().then(() => {
          //@ts-ignore
          if (isUserAdmin === 'admin') {
            cy.get(insightDbSelectors.comorbidityIframe.exportAsPNG).and(insightDbSelectors.comorbidityIframe.exportAsPNG).should('be.visible').click().then(() => {
              cy.get(insightDbSelectors.exportSuccessfulMessage).should('be.visible').and('contain.text', 'Exported Successfully');
            });
            cy.get(insightDbSelectors.comorbidityIframe.exportIcon).click()
            cy.get(insightDbSelectors.comorbidityIframe.exportAsJPEG).and(insightDbSelectors.comorbidityIframe.exportAsJPEG).should('be.visible').click().then(() => {
              cy.get(insightDbSelectors.exportSuccessfulMessage).should('be.visible').and('contain.text', 'Exported Successfully');
            });
          }else{
            return;
          }
        cy.get(insightDbSelectors.comorbidityIframe.rotateGraph).should('be.visible').click().then(() => {
          cy.get(insightDbSelectors.comorbidityIframe.comorbidityIframeSelector).invoke('css', 'transform').should('contain', 'rotate(90deg)');
        });
        cy.get(insightDbSelectors.comorbidityIframe.toFullScreen).should('be.visible');
      });
    });
  }
}
