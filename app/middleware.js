// 业务全局中间件注册入口。执行时机在框架全局中间件之后（static → nunjucks →
// bodyParser → errorHandler → monitoring → apiParamsVerify → securityPolicy），
// 这里注册的中间件位于框架链内层：参数校验通过后再做登录鉴权。
module.exports = (app) => {
  app.use(app.middlewares.api.jwtVerify);
};
