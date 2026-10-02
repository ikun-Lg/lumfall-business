module.exports = (app, router) => {
  const { business: businessController } = app.controllers;

  router.get(
    "/api/project/product/list",
    businessController.getBusinessList.bind(businessController),
  );

  router.get(
    "/api/project/product",
    businessController.getBusiness.bind(businessController),
  );

  router.get(
    "/api/project/productEnum/list",
    businessController.getProductEnumList.bind(businessController),
  );

  router.post(
    "/api/project/product",
    businessController.createBusiness.bind(businessController),
  );

  router.put(
    "/api/project/product",
    businessController.updateBusiness.bind(businessController),
  );

  router.delete(
    "/api/project/product",
    businessController.deleteBusinessList.bind(businessController),
  );

  // ===== 用户管理（schema 模块接口契约：列表 GET <api>/list，单条/增/改/删走 <api>） =====

  router.get(
    "/api/business/user/list",
    businessController.getUserList.bind(businessController),
  );

  router.get(
    "/api/business/user",
    businessController.getUser.bind(businessController),
  );

  router.post(
    "/api/business/user",
    businessController.createUser.bind(businessController),
  );

  router.put(
    "/api/business/user",
    businessController.updateUser.bind(businessController),
  );

  router.delete(
    "/api/business/user",
    businessController.deleteUser.bind(businessController),
  );
};
