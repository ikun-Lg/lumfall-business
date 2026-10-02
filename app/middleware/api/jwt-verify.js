// JWT 鉴权中间件：/api/* 请求默认需要登录态（Authorization: Bearer <token>
// 或登录后写入的 cookie）。免鉴权：登录接口与框架 dashboard 元数据接口
// （/api/project/*，与 projectHandler 的豁免理念一致——它们不是业务数据）。
// 鉴权失败返回 HTTP 200 + code 401，前端 request 封装统一处理跳转登录页。
const jwt = require("jsonwebtoken");

const DEFAULT_FREE_PATHS = [
  "/api/auth/login",
  "/api/project/model_list",
  "/api/project/list",
  "/api/project",
];

module.exports = (app) => {
  return async (ctx, next) => {
    if (ctx.path.indexOf("/api/") < 0) {
      return await next();
    }

    const jwtConfig = app.config?.security?.jwt || {};
    if (jwtConfig.enabled === false) {
      return await next();
    }

    const freePaths = new Set([
      ...DEFAULT_FREE_PATHS,
      ...(Array.isArray(jwtConfig.freePaths) ? jwtConfig.freePaths : []),
    ]);
    if (freePaths.has(ctx.path)) {
      return await next();
    }

    const cookieName = jwtConfig.cookieName || "lumfall_token";
    const authorization = ctx.request.headers.authorization || "";
    const token = authorization.startsWith("Bearer ")
      ? authorization.slice(7).trim()
      : ctx.cookies.get(cookieName) || "";

    if (!token) {
      ctx.status = 200;
      ctx.body = { success: false, code: 401, message: "未登录或登录已过期" };
      return;
    }

    try {
      const secret = jwtConfig.secret || "lumfall-business-dev-secret";
      ctx.user = jwt.verify(token, secret); // { userId, userName, role, iat, exp }
    } catch (e) {
      ctx.status = 200;
      ctx.body = { success: false, code: 401, message: "登录已过期，请重新登录" };
      return;
    }

    await next();
  };
};
