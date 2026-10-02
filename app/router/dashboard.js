module.exports = (app, router) => {
  const { dashboard: dashboardController } = app.controllers;

  router.get(
    "/api/dashboard/stats",
    dashboardController.getStats.bind(dashboardController)
  );

  router.get(
    "/api/dashboard/trends",
    dashboardController.getTrends.bind(dashboardController)
  );
};
