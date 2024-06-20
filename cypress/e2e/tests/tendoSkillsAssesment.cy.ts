
import insightDbSelectors from '../../utils/insightDbSelectors.json';
import insightDb from '../pages/insightDb';
describe('Tendo Skills Assessment', () => {
  const insightFunctions = new insightDb();
  let isAdmin;

  before(() => {
    isAdmin = insightFunctions.usersRole('drbun');
  insightFunctions.isInsightDashboardPageHealthy();
  });

  it('Checking default values and functionality of insight dashboard.', () => {
    cy.get(insightDbSelectors.insightDashboardBanner).should('be.visible');
   insightFunctions.checkDate();
   insightFunctions.getDashboardData(),
   insightFunctions.checkMonthlySummaryGraph();
   insightFunctions.checkComorbidityGraph();
  });
it('Will test insight dashboard backend services', ()=>{

  const facilityData = {
    facility_name: 'Tendo Treatment Center',
    monthly_summary: { cancer: 0, cbvd: 0, coagulopathy: 0, heart_failure: 0, hypernatremia: 0, hyponatremia: 0, idb: 0, obese: 0, paralysis: 0, renal_failure: 0, sever_liver_disease: 0, weightloss: 0 },
    address: '456 Elm Avenue',
    rating: 4.9,
    patient_capacity: 100,
    number_of_staff: 75
  };
  insightFunctions.inputFacilityData(facilityData).then((response) => {
    insightFunctions.checkFacilityInsights(response.body.id);
    insightFunctions.checkFacilityReports(response.body.id);
  });
});
});
