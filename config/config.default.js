// 所有环境共享的基础配置。合并顺序（后者覆盖前者同名键）：
//   框架 config.default -> 业务 config.default -> 框架 config.<env> -> 业务 config.<env>
module.exports = {
  name: "lumfall-business",
  apiBasePath: "/api",

  security: {
    // 接口签名校验（前端 $lumfallCurl 自动携带 s_t/s_sign）。生产环境开启：
    // apiSignature: { enabled: true, secret: process.env.API_SIGN_SECRET },
    apiSignature: {
      enabled: false,
      maxAgeMs: 600000,
    },
    // project_key 校验：/api/project/* 数据接口需要项目上下文（框架内置豁免除外）
    projectKey: {
      enabled: true,
      headerName: "project_key",
    },
    // JWT 登录鉴权（本模板核心）：/api/* 请求默认需要 Bearer token 或 cookie，
    // 免鉴权路径见 app/middleware/api/jwt-verify.js（/api/auth/login 与框架
    // dashboard 元数据接口 /api/project/* 内置豁免）
    jwt: {
      enabled: true,
      // 生产环境务必通过环境变量注入：JWT_SECRET=$(openssl rand -hex 32)
      secret: process.env.JWT_SECRET || "lumfall-business-dev-secret",
      // token 有效期（秒），同时用于登录后写入的 cookie max-age
      maxAgeSeconds: 43200,
      // 追加免鉴权路径（可选）
      freePaths: [],
      // cookie 名（框架页面 $lumfallCurl 无法注入请求头，登录后通过 cookie 携带 token）
      cookieName: "lumfall_token",
    },
  },
};
