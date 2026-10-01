const { serviceStart } = require("lumfall");

const app = serviceStart();

console.log("middlewares", app.middlewares);
console.log("router-schema", app.routerSchema);
console.log("controllers", app.controllers);
console.log("services", app.services);
console.log("config", app.config);
// extend loader 是把返回值直接挂到 app 上（框架自带 app.logger / app.health），
// 并不存在 app.customExtend 这个聚合对象
console.log("extend", { logger: typeof app.logger, health: typeof app.health });

module.exports = app;




