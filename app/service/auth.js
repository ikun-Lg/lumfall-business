// 登录鉴权 service：账号校验 + JWT 签发/解析。
// 账号数据为内存 mock（重启即还原）；接入真实用户体系时，把 users 换成
// 数据库查询（可在插件里初始化连接，见 lumfall 文档「插件」）。
const jwt = require("jsonwebtoken");

const userPool = [
  { userId: "U0001", userName: "admin", password: "123456", nickname: "管理员", role: "admin" },
  { userId: "U0002", userName: "user", password: "123456", nickname: "普通用户", role: "user" },
];

module.exports = (app) => {
  const BaseService = require("lumfall").Service.Base(app);

  return class AuthService extends BaseService {
    get jwtConfig() {
      return this.config.security?.jwt || {};
    }

    get secret() {
      return this.jwtConfig.secret || "lumfall-business-dev-secret";
    }

    get maxAgeSeconds() {
      return this.jwtConfig.maxAgeSeconds || 43200;
    }

    /**
     * 登录：校验账号密码，签发 JWT
     * @param {{ username: string, password: string }} param0
     * @returns {object|null} 失败返回 null
     */
    login({ username, password }) {
      const user = userPool.find((item) => item.userName === username);
      if (!user || user.password !== password) {
        return null;
      }

      const token = jwt.sign(
        { userId: user.userId, userName: user.userName, role: user.role },
        this.secret,
        { expiresIn: this.maxAgeSeconds }
      );

      const { password: _password, ...safeUser } = user;
      return { token, maxAgeSeconds: this.maxAgeSeconds, user: safeUser };
    }

    /**
     * 解析 token（供 getCurrentUser 使用）
     * @param {string} token
     * @returns {object|null} 无效/过期返回 null
     */
    getUserByToken(token) {
      try {
        const payload = jwt.verify(token, this.secret);
        const user = userPool.find((item) => item.userId === payload.userId);
        if (!user) return null;
        const { password: _password, ...safeUser } = user;
        return safeUser;
      } catch (e) {
        return null;
      }
    }
  };
};
