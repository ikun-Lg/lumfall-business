module.exports = (app, router) => {
  const { auth: authController } = app.controllers;

  router.post("/api/auth/login", authController.postLogin.bind(authController));

  router.get(
    "/api/auth/current_user",
    authController.getCurrentUser.bind(authController)
  );
};
