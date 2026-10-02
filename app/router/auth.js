module.exports = (app, router) => {
  const { auth: authController } = app.controllers;

  router.post("/api/auth/login", authController.postLogin.bind(authController));

  router.get(
    "/api/auth/current_user",
    authController.getCurrentUser.bind(authController)
  );

  router.post(
    "/api/auth/update_profile",
    authController.updateProfile.bind(authController)
  );

  router.post(
    "/api/auth/change_password",
    authController.changePassword.bind(authController)
  );
};
