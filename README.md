# lumfall-business

基于 [lumfall](https://www.npmjs.com/package/lumfall) 的 **B 端全栈模板，开箱即用**：
完整的管理台 SPA（对标主流 admin 后台）、JWT 登录鉴权、图表看板、RBAC 菜单权限、
schema 驱动的增删改查页全部就位，克隆后改业务即可。

## 包含什么

| 能力 | 说明 |
| --- | --- |
| 管理台 SPA | `/view/admin`：可折叠侧栏（图标菜单）+ 顶栏（折叠/面包屑/暗黑切换/全屏/用户下拉）+ 统一页头内容区 |
| JWT 登录鉴权 | 精美登录页 `/view/login` + `/api/auth/*` + `jwt-verify` 全局中间件；token 双通道（Authorization 头 + cookie，框架页面免改造） |
| 数据看板 | 统计卡片 + ECharts 图表（近 7 日订单/销售额折线、分类占比饼图），接口 mock 可换真实聚合 |
| Dashboard DSL 驱动菜单 | 侧栏菜单来自 `/api/project?projectKey=admin`（`model/` 下的 DSL 配置），schema/custom 模块自动映射路由 |
| 通用 CRUD 页 | `/view/admin/schema/:key`：一份字段 schema 驱动 搜索栏 + 表格 + 表单/详情抽屉（DSL `xxxOption` 机制），零页面代码加管理页 |
| RBAC | DSL 菜单项配 `roles: ["admin"]`，前端按当前用户角色过滤菜单 + 页面 403 拦截 |
| 个人中心 | 修改昵称 / 修改密码 |
| 参数校验 | 全部接口登记 router-schema，启动期校验路由一致性 |

## 快速开始

```sh
pnpm install
pnpm start:dev          # 本地开发（前端 HMR + 服务）
# 或
pnpm start:prod         # 生产构建 + 启动
```

访问 <http://localhost:3000/view/login>，默认账号 **admin / 123456**
（mock 数据见 `app/service/auth.js`；生产环境用 `JWT_SECRET` 环境变量注入密钥）。

登录后进入项目工作台（`/view/project-list`），点击 **Lumfall Admin** 进入管理台；
普通账号 `user / 123456` 用于验证 RBAC（看不到用户管理菜单）。

## 页面流转

```
/view/login（登录）→ /view/project-list（项目工作台，可切多项目）
    ├─ Lumfall Admin → /view/admin（管理台 SPA：看板 / 商品管理 / 用户管理 / 个人中心）
    └─ 其他项目（taobao/jd/pdd…）→ /view/dashboard（框架 Dashboard，DSL 多项目演示）
```

## 登录鉴权说明

```
登录页 → POST /api/auth/login（免鉴权）→ 签发 JWT
  ├─ 写入 localStorage（管理台 request() 自动带 Authorization 头）
  └─ 写入 cookie lumfall_token（框架页面 $lumfallCurl 无法注入请求头，靠同源 cookie 携带）

所有 /api/* 请求经 app/middleware/api/jwt-verify.js 校验
  免鉴权白名单：/api/auth/login、/api/project/*（框架 dashboard 元数据接口）
  鉴权失败：HTTP 200 + { code: 401 }，前端 request() 封装统一跳转登录页
```

- 管理台页面统一用 `app/pages/common/auth.js` 的 `request()` 发请求
- `/api/project/*` 数据接口还需要 `project_key`：管理台入口已固定
  `window.__LUMFALL__.projectKey`（`$lumfallCurl` 依赖它注入请求头）
- 修改 token 有效期 / cookie 名 / 白名单：`config/config.default.js` 的 `security.jwt`
  与 `app/middleware/api/jwt-verify.js`

## 目录速览

```text
app/
├── controller/{auth,business,dashboard}.js   # 鉴权 / 商品与用户 / 看板数据
├── service/{auth,business,dashboard}.js      # JWT（mock 账号）+ 数据逻辑（内存 mock）
├── router/ + router-schema/                  # 路由与参数校验（一一对应）
├── middleware/api/jwt-verify.js              # JWT 鉴权中间件
├── middleware.js                             # 全局中间件注册
└── pages/
    ├── login/                                # 登录页
    ├── project-list/                         # 项目工作台入口
    ├── common/auth.js                        # token 工具 + request() 封装
    └── admin/                                # 管理台 SPA
        ├── entry.admin.js                    # 路由 + projectKey 固定 + 主题
        ├── admin-config.js                   # 站点名 / 项目 key / 菜单图标 / custom 路由映射
        ├── stores/admin.js                   # 用户 / 菜单 / 折叠 / 主题（pinia）
        ├── layout/                           # 侧栏菜单 + 顶栏 + 布局
        └── views/                            # dashboard / schema-page（通用 CRUD）/ profile / 404
model/business/                               # Dashboard DSL（admin 项目 + 多项目演示）
```

## 二开指引

1. **加管理页**：`model/business/model.js` 加一个 `moduleType: "schema"` 菜单 +
   四件套（controller/service/router/router-schema）照抄用户管理——侧栏菜单和
   CRUD 页面自动生成，**无需写前端**
2. **接数据库**：`app/service/*.js` 的内存 mock 换成真实存储——连接在
   `serviceStart({ plugins })` 里初始化（见框架文档「插件」），请求阶段使用
3. **自定义页面**：`app/pages/admin/admin-config.js` 的 `CUSTOM_ROUTES` 登记
   管理台路由，`app/pages/dashboard/router.js` 注册框架 dashboard 路由
4. **RBAC**：DSL 菜单项配 `roles` 数组即可；按钮级权限可在 `schema-page`
   的按钮渲染处按 `store.user.role` 扩展
5. **账号体系**：把 `app/service/auth.js` 的 mock 换成数据库查询；生产环境
   密码用 bcrypt 等散列比对，不要明文存储

## DSL 与页面开发

- Dashboard DSL 编写规则：框架包内 `model/docs/dsl-guide.md`，或看在线文档的「DSL」章节
- schema 模块的后端接口契约（`GET <api>/list` 等）：文档「接口契约」章节
- 独立页面开发参考 `lumfall-basic-project/`

