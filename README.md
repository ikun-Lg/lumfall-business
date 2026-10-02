# lumfall-business

基于 [lumfall](https://www.npmjs.com/package/lumfall) 的 **B 端全栈模板，开箱即用**：
登录鉴权、项目工作台（Dashboard）、schema 驱动的管理页全部就位，克隆后改业务即可。

## 包含什么

| 能力 | 说明 |
| --- | --- |
| JWT 登录鉴权 | 登录页 `/view/login` + `/api/auth/*` 接口 + `jwt-verify` 全局中间件；token 双通道（Authorization 头 + cookie，框架页面免改造） |
| 项目工作台 | 框架 Dashboard（`/view/dashboard`），由 `model/` 下的 Dashboard DSL 驱动，顶栏切换项目 |
| schema 管理页 | 商品管理、用户管理两个完整的增删改查模块（搜索栏 + 表格 + 表单/详情抽屉），纯 DSL 配置 |
| 参数校验 | 全部接口登记 router-schema，启动期校验路由一致性 |
| 统一响应 | controller 基类 `this.success` / `this.fail`，错误码约定见框架文档 |

## 快速开始

```sh
pnpm install
pnpm start:dev          # 本地开发（前端 HMR + 服务）
# 或
pnpm start:prod         # 生产构建 + 启动
```

访问 <http://localhost:3000/view/login>，默认账号 **admin / 123456**
（mock 数据见 `app/service/auth.js`；生产环境用 `JWT_SECRET` 环境变量注入密钥）。

## 登录鉴权说明

```
登录页 → POST /api/auth/login（免鉴权）→ 签发 JWT
  ├─ 写入 localStorage（本模板页面的 request() 自动带 Authorization 头）
  └─ 写入 cookie lumfall_token（框架页面 $lumfallCurl 无法注入请求头，靠同源 cookie 携带）

所有 /api/* 请求经 app/middleware/api/jwt-verify.js 校验
  免鉴权白名单：/api/auth/login、/api/project/*（框架 dashboard 元数据接口）
  鉴权失败：HTTP 200 + { code: 401 }，前端 request() 封装统一跳转登录页
```

- 业务页面统一用 `app/pages/common/auth.js` 的 `request()` 发请求（自动带 token + 401 处理）
- 登出：`logout()` 清除 localStorage 与 cookie
- 修改 token 有效期 / cookie 名：`config/config.default.js` 的 `security.jwt`

## 目录速览

```text
app/
├── controller/{auth,business}.js     # 登录鉴权 + 商品/用户管理
├── service/{auth,business}.js        # JWT 签发（mock 账号）+ 数据逻辑（内存 mock）
├── router/ + router-schema/          # 路由与参数校验（一一对应）
├── middleware/api/jwt-verify.js      # JWT 鉴权中间件
├── middleware.js                     # 全局中间件注册（jwtVerify）
└── pages/
    ├── login/                        # 登录页 /view/login
    ├── project-list/                 # 项目工作台入口 /view/project-list
    └── common/auth.js                # token 工具 + request() 封装
model/business/                       # Dashboard DSL（商品管理 + 用户管理菜单）
```

## 二开指引

1. **接数据库**：`app/service/*.js` 里的内存 mock 换成真实存储——连接在
   `serviceStart({ plugins })` 里初始化（见框架文档「插件」），请求阶段使用
2. **加管理页**：在 `model/business/model.js` 加一个 `moduleType: "schema"`
   菜单 + 四件套（controller/service/router/router-schema）照抄用户管理，
   无需写前端页面
3. **自定义页面**：`app/pages/dashboard/router.js` 注册路由，菜单里配
   `moduleType: "custom"` 指向它（sider 子菜单的 path 必须以 `/` 开头）
4. **账号体系**：把 `app/service/auth.js` 的 mock 换成数据库查询；密码校验
   生产环境请用 bcrypt 等散列比对，不要明文存储

## DSL 与页面开发

- Dashboard DSL 编写规则：框架包内 `model/docs/dsl-guide.md`，或看在线文档
  的「DSL」章节
- schema 模块的后端接口契约（`GET <api>/list` 等）：文档「接口契约」章节
- 独立页面开发参考 `lumfall-basic-project/`
