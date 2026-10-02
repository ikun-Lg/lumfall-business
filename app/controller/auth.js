// 登录鉴权 controller。登录接口在 jwt-verify 白名单里，匿名可访问；
// current_user 用于前端校验登录态 / 展示用户信息（token 从 header 或 cookie 取）。
module.exports = (app) => {
  const BaseController = require("lumfall").Controller.Base(app);

  return class AuthController extends BaseController {
    async postLogin(ctx) {
      const { auth: authService } = this.services;
      const result = authService.login(ctx.request.body);

      if (!result) {
        await this.fail(ctx, "账号或密码错误", 50000);
        return;
      }

      // 登录成功同时写 cookie：框架页面（dashboard/schema-view）内部用
      // $lumfallCurl 发请求、无法注入请求头，靠同源 cookie 携带登录态
      const cookieName = this.config.security?.jwt?.cookieName || "lumfall_token";
      ctx.cookies.set(cookieName, result.token, {
        maxAge: result.maxAgeSeconds * 1000,
        httpOnly: false, // 前端登出时需要清除，保持可读写
        sameSite: "lax",
      });

      await this.success(ctx, result);
    }

    async getCurrentUser(ctx) {
      const { auth: authService } = this.services;
      const authorization = ctx.request.headers.authorization || "";
      const cookieName = this.config.security?.jwt?.cookieName || "lumfall_token";
      const token = authorization.startsWith("Bearer ")
        ? authorization.slice(7).trim()
        : ctx.cookies.get(cookieName) || "";

      const user = authService.getUserByToken(token);
      if (!user) {
        await this.fail(ctx, "未登录或登录已过期", 401);
        return;
      }

      await this.success(ctx, user);
    }

    // ===== 个人中心 =====

    async updateProfile(ctx) {
      const { auth: authService } = this.services;
      const user = authService.updateProfile({
        userId: ctx.user.userId,
        nickname: ctx.request.body.nickname,
      });
      if (!user) {
        await this.fail(ctx, "用户不存在", 50000);
        return;
      }
      await this.success(ctx, user);
    }

    async changePassword(ctx) {
      const { auth: authService } = this.services;
      const result = authService.changePassword({
        userId: ctx.user.userId,
        oldPassword: ctx.request.body.oldPassword,
        newPassword: ctx.request.body.newPassword,
      });
      if (!result) {
        await this.fail(ctx, "原密码错误", 50000);
        return;
      }
      await this.success(ctx, null);
    }
  };
};
