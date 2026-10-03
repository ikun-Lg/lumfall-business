# lumfall-business

基于 [lumfall](https://www.npmjs.com/package/lumfall) 的 **B 端全栈管理台模板，开箱即用**：
一个管理台承载**电商系统 + 课程系统**两套完整业务，Dashboard DSL 全形态驱动（菜单分组 /
schema 四视图 / sider 复合视图 / iframe / custom），JWT 登录鉴权、RBAC、业务侧 DSL 扩展控件、
插件化数据仓库、健康检查、请求观测全部就位，克隆后改业务即可。

## 快速开始

```sh
pnpm install

# 开发（前端 dev server + 服务并行）
pnpm start:dev

# 生产
pnpm build:prod && pnpm prod
```

访问 `http://localhost:3000/view/login`，默认账号：

| 账号 | 密码 | 角色 | 说明 |
| --- | --- | --- | --- |
| admin | 123456 | admin | 可见全部菜单（含退款管理、系统用户） |
| user | 123456 | user | RBAC 演示：admin 专属菜单不可见 |

## 包含什么

| 能力 | 说明 |
| --- | --- |
| 管理台 SPA | `/view/admin`：可折叠图标侧栏 + 顶栏（**系统切换器** / 面包屑 / 暗黑切换 / 全屏 / 用户下拉） |
| 双业务系统 | 顶部切换「电商系统 / 课程系统」——菜单、看板统计口径、分析页随系统切换；各自由一个 DSL Model 声明 |
| JWT 登录鉴权 | 登录页 `/view/login` + `/api/auth/*` + `jwt-verify` 全局中间件；token 双通道（Authorization 头 + cookie） |
| Dashboard DSL 全形态 | `model/` 声明菜单：`custom`（自定义页）/ `group`（分组子菜单）/ `schema`（CRUD 列表页）/ `sider`（侧边栏复合视图）/ `iframe`(嵌入页) 全部用上 |
| 通用 CRUD 页 | `/view/admin/schema/:key`：一份字段 schema 驱动 搜索栏 + 表格 + 表单/详情抽屉，零页面代码加管理页 |
| RBAC | DSL 菜单项配 `roles: ["admin"]`，前端按角色过滤菜单 + 页面 403 拦截 |
| 业务侧 DSL 扩展 | 表单控件 `textarea` / `switch` / `radioGroup` / `rate` / `dynamicSelect`、搜索控件 `numberRange`，经框架 `$business*` 别名注册合并 |
| 数据看板 | 统计卡片 + ECharts 双图表，`domain` 参数区分电商 / 课程聚合口径 |
| 数据统计（sider） | 销售分析 / 学习分析页（30 日趋势、状态分布、Top 榜）+ 服务监控（iframe 内嵌 `/view/health`） |
| 数据仓库插件 | `plugin/store` 经 `serviceStart({ plugins })` 挂载，内存数据仓库 + 全量 seed（重启不变），业务 service 零 SQL 起步 |
| 服务端全 feat | 生命周期 hook（启动诊断摘要）、monitoring 请求观测（traceId 日志）、health 探针（`/health/ready`）、configSchema 配置强校验 |
| 参数校验 | 全部接口程序化生成 router-schema，启动期校验路由一致性 |
| 个人中心 | 修改昵称 / 修改密码 |

## 两套业务系统

| 系统 | Model | 管理台 Project | 模块 |
| --- | --- | --- | --- |
| 电商系统 | `model/business/` | `admin` | 商品 / 分类 / 订单（发货·取消状态流转）/ 退款（审核，admin）\| 会员 / 系统用户（admin）\| 优惠券 / 轮播图 \| 数据统计（销售分析 + 服务监控） |
| 课程系统 | `model/course/` | `edu-admin` | 课程 / 章节 / 分类（含业务扩展表单 dynamicSelect）\| 课时 / 讲师（rate 评分控件）/ 学员 \| 课程订单（退款流转）\| 数据统计（学习分析 + 服务监控） |

- 项目列表页 `/view/project-list` 展示全部 Model / Project，点卡片进入对应系统。
- 换业务：改 `model/` 下的 DSL + `app/service` / `app/controller` 各加一组接口即可，页面零代码。

## DSL 用法

完整编写规则见框架包内文档：`node_modules/lumfall/model/docs/dsl-guide.md`（菜单项、
schemaConfig 四视图、按钮与动态组件、Model/Project 合并规则、接口契约）。

本模板在框架契约之上做了三个**业务侧扩展**（均只改业务代码，未动框架）：

| 扩展 | DSL 写法 | 实现位置 |
| --- | --- | --- |
| 状态流转按钮 | `eventKey: "patch"` + `eventOption.params`（支持 `"schema::<field>"` 取行值）+ `eventOption.confirm` 确认文案，走 `PATCH <api>` | `app/pages/admin/views/schema-page.vue` |
| 行按钮显隐 | rowButtons 配 `visibleWhen: { field, value }`，按行数据决定按钮显示 | `app/pages/admin/components/business-table.vue` |
| 行选择批量删除 | tableConfig 配 `rowSelection: true`，勾选后出现「批量删除」 | 同上 |

扩展控件（`app/pages/widgets/` 下，经 `$businessFormItemConfig` / `$businessSearchItemConfig` 与框架内置注册表合并）：

| 控件 | 用法 | 说明 |
| --- | --- | --- |
| 表单 `textarea` | `componentType: "textarea"` | 多行文本，maxLength 校验 |
| 表单 `switch` | `componentType: "switch"` | `"1"/"0"` 字符串枚举与布尔互转 |
| 表单 `radioGroup` | `componentType: "radioGroup"` + `enumList` | 横排单选，按枚举做 ajv 校验 |
| 表单 `rate` | `componentType: "rate"` | 评分，minimum/maximum 校验 |
| 表单 `dynamicSelect` | `componentType: "dynamicSelect"` + `api` | 表单侧动态下拉（外键字段必备，框架只有搜索侧） |
| 搜索 `numberRange` | `componentType: "numberRange"` + `placeholder: [min, max]` | 下发 `<field>_min` / `<field>_max`，后端按区间过滤 |

## 目录结构

```text
lumfall-business/
├── server.js                  # serviceStart：插件 / configSchema / lifecycle / monitoring
├── plugin/store/              # 数据仓库插件（内存 collections + seed 种子数据）
├── model/                     # Dashboard DSL：business（电商）/ course（课程）各含 model.js + project/
├── app/
│   ├── lib/                   # 通用 CRUD 工厂：service / controller / router-schema / 路由注册
│   ├── service/commerce|course/  # 领域 service（每集合一个，含删除引用校验示例）
│   ├── controller/commerce|course/
│   ├── router/  router-schema/
│   ├── middleware/api/jwt-verify.js
│   ├── extend/health-check.js # store 健康探针
│   └── pages/
│       ├── admin/             # 管理台 SPA（DSL 全形态消费端）
│       │   ├── admin-config.js    # 系统映射 / 图标 / 路由映射（改站点先看这里）
│       │   ├── stores/admin.js    # 系统切换 / 菜单 / RBAC / 主题
│       │   ├── components/business-table.vue  # 表格：visibleWhen + 行选择
│       │   └── views/             # dashboard / schema-page / sider-view / iframe-view / analysis-view
│       ├── widgets/           # 业务侧 schema 控件注册表 + 扩展控件
│       ├── login/  project-list/
│       └── common/auth.js     # token 工具 + request 封装
└── config/                    # 四环境配置（configSchema 强校验 security.jwt）
```

## 服务端接口

schema 模块固定契约（`<api>` 为 DSL `schemaConfig.api`）：

| 调用 | 方法 | 说明 |
| --- | --- | --- |
| `<api>/list` | GET | 分页 + 过滤（空串不过滤；`_min`/`_max` 区间；`_start`/`_end` 时间区间） |
| `<api>` | GET / POST / PUT / PATCH / DELETE | 单条回显 / 新增 / 更新 / **状态流转** / 删除 |
| `<api>Enum/list` | GET | dynamicSelect 选项源 `[{label, value}]` |

聚合接口：`/api/dashboard/stats|trends?domain=commerce|course`、`/api/analysis/sales`、`/api/analysis/learning`。

## 接入真实数据

`plugin/store` 是接口约定的唯一实现点：保持 `collection(name)` 返回的
`list / get / insert / update / remove` 签名（见 `plugin/store/index.js` 顶部注释），
换成数据库驱动即可，service / controller / DSL 全部不动。seed 数据与 DSL 的
`enumList` 同源（`plugin/store/seed.js` 导出枚举常量供 `model/*.js` 引用），改枚举一处生效。

## 生产注意

- `JWT_SECRET` 环境变量注入（`config/config.prod.js`），见 config.default.js 注释。
- 接口签名 `security.apiSignature.enabled` 按需开启（前端 `$lumfallCurl` 自动携带 s_t / s_sign）。
- 构建产物按 `_ENV` 分目录（`app/public/dist/dev|prod/`），切换模式后重新构建并重启服务（模板在启动期载入内存）。
