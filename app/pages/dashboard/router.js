module.exports = ({ routes, siderRoutes }) => {
  routes.push({
    path: "/view/dashboard/todo",
    component: () => import("./todo/todo.vue"),
  });

  //   custom自定义路由
  siderRoutes.push({
    path: "todo",
    component: () => import("./todo/todo.vue"),
  });
};
