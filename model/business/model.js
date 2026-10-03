// 电商系统 Model：管理台的菜单公共骨架（Project 按 key 深度合并覆盖）。
// 覆盖 DSL 全部形态：custom / group+subMenu / schema（搜索栏 + 表格 + 动态表单 +
// 详情抽屉）/ sider（侧边栏复合视图）/ iframe，并演示 RBAC（roles）与
// 业务扩展控件（numberRange / textarea / switch / radioGroup）。
const {
  productCategoryEnumList,
  brandEnumList,
  payTypeEnumList,
} = require("../../plugin/store/seed");

// 业务扩展的按钮语义：patch（状态流转）+ visibleWhen（按行数据显示/隐藏按钮）。
// 由管理台 schema-page 实现，见 app/pages/admin/views/schema-page.vue。
const patchButton = (label, statusValue, whenField, whenValue) => ({
  label,
  eventKey: "patch",
  type: "warning",
  eventOption: {
    params: { status: statusValue },
    confirm: `确认将该记录状态变更为「${label}」吗？`,
  },
  visibleWhen: { field: whenField, value: whenValue },
});

module.exports = {
  model: "dashboard",
  name: "电商系统",
  menu: [
    {
      key: "dashboard",
      name: "数据看板",
      menuType: "module",
      moduleType: "custom",
      customConfig: { path: "/dashboard" },
    },
    {
      key: "product-group",
      name: "商品中心",
      menuType: "group",
      subMenu: [
        {
          key: "product",
          name: "商品管理",
          menuType: "module",
          moduleType: "schema",
          schemaConfig: {
            api: "/api/project/product",
            schema: {
              type: "object",
              properties: {
                productId: {
                  type: "string",
                  label: "商品ID",
                  tableOption: { width: 110 },
                  editFormOption: { componentType: "input", disabled: true },
                  detailPanelOption: {},
                },
                productName: {
                  type: "string",
                  label: "商品名称",
                  minLength: 3,
                  maxLength: 40,
                  tableOption: { width: 220 },
                  searchOption: {
                    componentType: "input",
                    default: "",
                    placeholder: "请输入商品名称",
                    allowClear: true,
                  },
                  createFormOption: { componentType: "input" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                categoryId: {
                  type: "string",
                  label: "商品分类",
                  tableOption: { width: 130, enumList: productCategoryEnumList },
                  searchOption: {
                    componentType: "dynamicSelect",
                    default: "",
                    api: "/api/project/categoryEnum/list",
                    placeholder: "全部分类",
                  },
                  createFormOption: {
                    componentType: "select",
                    default: "",
                    enumList: productCategoryEnumList,
                  },
                  editFormOption: {
                    componentType: "select",
                    enumList: productCategoryEnumList,
                  },
                  detailPanelOption: {},
                },
                brand: {
                  type: "string",
                  label: "品牌",
                  tableOption: { width: 110 },
                  searchOption: {
                    componentType: "select",
                    default: "",
                    enumList: brandEnumList,
                  },
                  createFormOption: {
                    componentType: "select",
                    default: "",
                    enumList: brandEnumList,
                  },
                  editFormOption: { componentType: "select", enumList: brandEnumList },
                  detailPanelOption: {},
                },
                price: {
                  type: "number",
                  label: "价格",
                  minimum: 0,
                  maximum: 100000,
                  tableOption: { width: 120, toFixed: 2 },
                  searchOption: {
                    componentType: "numberRange",
                    default: [],
                    placeholder: ["最低价", "最高价"],
                  },
                  createFormOption: { componentType: "inputNumber", default: 0 },
                  editFormOption: { componentType: "inputNumber" },
                  detailPanelOption: {},
                },
                sales: {
                  type: "number",
                  label: "销量",
                  tableOption: { width: 110 },
                  detailPanelOption: {},
                },
                inventory: {
                  type: "number",
                  label: "库存",
                  minimum: 0,
                  tableOption: { width: 110 },
                  createFormOption: { componentType: "inputNumber", default: 0 },
                  editFormOption: { componentType: "inputNumber" },
                  detailPanelOption: {},
                },
                status: {
                  type: "string",
                  label: "上架状态",
                  tableOption: {
                    width: 110,
                    enumList: [
                      { label: "上架", value: "1" },
                      { label: "下架", value: "0" },
                    ],
                  },
                  searchOption: {
                    componentType: "select",
                    default: "",
                    enumList: [
                      { label: "上架", value: "1" },
                      { label: "下架", value: "0" },
                    ],
                  },
                  createFormOption: {
                    componentType: "radioGroup",
                    default: "1",
                    enumList: [
                      { label: "上架", value: "1" },
                      { label: "下架", value: "0" },
                    ],
                  },
                  editFormOption: {
                    componentType: "radioGroup",
                    enumList: [
                      { label: "上架", value: "1" },
                      { label: "下架", value: "0" },
                    ],
                  },
                  detailPanelOption: {},
                },
                description: {
                  type: "string",
                  label: "商品描述",
                  maxLength: 200,
                  createFormOption: {
                    componentType: "textarea",
                    placeholder: "请输入商品描述（最长 200 字）",
                  },
                  editFormOption: { componentType: "textarea" },
                  detailPanelOption: {},
                },
                createTime: {
                  type: "string",
                  label: "创建时间",
                  tableOption: { width: 180 },
                  searchOption: {
                    componentType: "dateRange",
                    default: [],
                    showTime: true,
                    valueFormat: "YYYY-MM-DD HH:mm:ss",
                  },
                  detailPanelOption: {},
                },
              },
              required: ["productName"],
            },
            tableConfig: {
              rowSelection: true, // 业务扩展：启用行选择（配合 batchRemove 批量删除）
              headerButtons: [
                {
                  label: "新增商品",
                  eventKey: "showComponent",
                  type: "outline",
                  eventOption: { comName: "createForm" },
                },
              ],
              rowButtons: [
                {
                  label: "查看",
                  eventKey: "showComponent",
                  type: "primary",
                  eventOption: { comName: "detailPanel" },
                },
                {
                  label: "修改",
                  eventKey: "showComponent",
                  type: "warning",
                  eventOption: { comName: "editForm" },
                },
                patchButton("上架", "1", "status", "0"),
                patchButton("下架", "0", "status", "1"),
                {
                  label: "删除",
                  eventKey: "delete",
                  type: "danger",
                  eventOption: { params: { productId: "schema::productId" } },
                },
              ],
              componentConfig: {
                createForm: { title: "新增商品", saveBtnText: "新增商品" },
                editForm: { mainKey: "productId", title: "修改商品", saveBtnText: "保存修改" },
                detailPanel: { mainKey: "productId", title: "商品详情" },
              },
            },
          },
        },
        {
          key: "category",
          name: "商品分类",
          menuType: "module",
          moduleType: "schema",
          schemaConfig: {
            api: "/api/project/category",
            schema: {
              type: "object",
              properties: {
                categoryId: {
                  type: "string",
                  label: "分类ID",
                  tableOption: { width: 100 },
                  editFormOption: { componentType: "input", disabled: true },
                  detailPanelOption: {},
                },
                categoryName: {
                  type: "string",
                  label: "分类名称",
                  minLength: 2,
                  maxLength: 20,
                  tableOption: { width: 160 },
                  searchOption: { componentType: "input", default: "", placeholder: "请输入分类名称" },
                  createFormOption: { componentType: "input" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                categoryCode: {
                  type: "string",
                  label: "分类编码",
                  tableOption: { width: 130 },
                  createFormOption: { componentType: "input", placeholder: "如 CAT013" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                sort: {
                  type: "number",
                  label: "排序",
                  minimum: 0,
                  tableOption: { width: 90 },
                  createFormOption: { componentType: "inputNumber", default: 99 },
                  editFormOption: { componentType: "inputNumber" },
                  detailPanelOption: {},
                },
                status: {
                  type: "string",
                  label: "启用状态",
                  tableOption: {
                    width: 110,
                    enumList: [
                      { label: "启用", value: "1" },
                      { label: "停用", value: "0" },
                    ],
                  },
                  searchOption: {
                    componentType: "select",
                    default: "",
                    enumList: [
                      { label: "启用", value: "1" },
                      { label: "停用", value: "0" },
                    ],
                  },
                  createFormOption: { componentType: "switch", default: "1" },
                  editFormOption: { componentType: "switch" },
                  detailPanelOption: {},
                },
                description: {
                  type: "string",
                  label: "描述",
                  maxLength: 100,
                  createFormOption: { componentType: "textarea" },
                  editFormOption: { componentType: "textarea" },
                  detailPanelOption: {},
                },
                createTime: {
                  type: "string",
                  label: "创建时间",
                  tableOption: { width: 180 },
                  searchOption: {
                    componentType: "dateRange",
                    default: [],
                    showTime: true,
                    valueFormat: "YYYY-MM-DD HH:mm:ss",
                  },
                  detailPanelOption: {},
                },
              },
              required: ["categoryName"],
            },
            tableConfig: {
              headerButtons: [
                {
                  label: "新增分类",
                  eventKey: "showComponent",
                  type: "outline",
                  eventOption: { comName: "createForm" },
                },
              ],
              rowButtons: [
                {
                  label: "查看",
                  eventKey: "showComponent",
                  type: "primary",
                  eventOption: { comName: "detailPanel" },
                },
                {
                  label: "修改",
                  eventKey: "showComponent",
                  type: "warning",
                  eventOption: { comName: "editForm" },
                },
                {
                  label: "删除",
                  eventKey: "delete",
                  type: "danger",
                  eventOption: { params: { categoryId: "schema::categoryId" } },
                },
              ],
              componentConfig: {
                createForm: { title: "新增分类", saveBtnText: "新增分类" },
                editForm: { mainKey: "categoryId", title: "修改分类", saveBtnText: "保存修改" },
                detailPanel: { mainKey: "categoryId", title: "分类详情" },
              },
            },
          },
        },
      ],
    },
    {
      key: "order-group",
      name: "订单中心",
      menuType: "group",
      subMenu: [
        {
          key: "order",
          name: "订单管理",
          menuType: "module",
          moduleType: "schema",
          schemaConfig: {
            api: "/api/project/order",
            schema: {
              type: "object",
              properties: {
                orderId: {
                  type: "string",
                  label: "订单ID",
                  tableOption: { width: 110 },
                  editFormOption: { componentType: "input", disabled: true },
                  detailPanelOption: {},
                },
                orderNo: {
                  type: "string",
                  label: "订单号",
                  tableOption: { width: 170 },
                  searchOption: { componentType: "input", default: "", placeholder: "请输入订单号" },
                  detailPanelOption: {},
                },
                customerName: {
                  type: "string",
                  label: "客户",
                  tableOption: { width: 120 },
                  searchOption: { componentType: "input", default: "", placeholder: "请输入客户姓名" },
                  detailPanelOption: {},
                },
                productCount: {
                  type: "number",
                  label: "商品数",
                  tableOption: { width: 100 },
                  detailPanelOption: {},
                },
                totalAmount: {
                  type: "number",
                  label: "订单金额",
                  tableOption: { width: 130, toFixed: 2 },
                  searchOption: {
                    componentType: "numberRange",
                    default: [],
                    placeholder: ["最小金额", "最大金额"],
                  },
                  detailPanelOption: {},
                },
                payType: {
                  type: "string",
                  label: "支付方式",
                  tableOption: { width: 120, enumList: payTypeEnumList },
                  searchOption: { componentType: "select", default: "", enumList: payTypeEnumList },
                  detailPanelOption: {},
                },
                status: {
                  type: "string",
                  label: "订单状态",
                  tableOption: {
                    width: 110,
                    enumList: [
                      { label: "待付款", value: "pending" },
                      { label: "已付款", value: "paid" },
                      { label: "已发货", value: "shipped" },
                      { label: "已完成", value: "completed" },
                      { label: "已取消", value: "canceled" },
                    ],
                  },
                  searchOption: {
                    componentType: "select",
                    default: "",
                    enumList: [
                      { label: "待付款", value: "pending" },
                      { label: "已付款", value: "paid" },
                      { label: "已发货", value: "shipped" },
                      { label: "已完成", value: "completed" },
                      { label: "已取消", value: "canceled" },
                    ],
                  },
                  detailPanelOption: {},
                },
                remark: {
                  type: "string",
                  label: "备注",
                  maxLength: 100,
                  createFormOption: { componentType: "textarea" },
                  editFormOption: { componentType: "textarea" },
                  detailPanelOption: {},
                },
                createTime: {
                  type: "string",
                  label: "下单时间",
                  tableOption: { width: 180 },
                  searchOption: {
                    componentType: "dateRange",
                    default: [],
                    showTime: true,
                    valueFormat: "YYYY-MM-DD HH:mm:ss",
                  },
                  detailPanelOption: {},
                },
              },
            },
            tableConfig: {
              headerButtons: [
                {
                  label: "新增订单",
                  eventKey: "showComponent",
                  type: "outline",
                  eventOption: { comName: "createForm" },
                },
              ],
              rowButtons: [
                {
                  label: "查看",
                  eventKey: "showComponent",
                  type: "primary",
                  eventOption: { comName: "detailPanel" },
                },
                {
                  label: "修改",
                  eventKey: "showComponent",
                  type: "warning",
                  eventOption: { comName: "editForm" },
                },
                patchButton("发货", "shipped", "status", "paid"),
                patchButton("完成", "completed", "status", "shipped"),
                patchButton("取消", "canceled", "status", "pending"),
                {
                  label: "删除",
                  eventKey: "delete",
                  type: "danger",
                  eventOption: { params: { orderId: "schema::orderId" } },
                },
              ],
              componentConfig: {
                createForm: { title: "新增订单", saveBtnText: "新增订单" },
                editForm: { mainKey: "orderId", title: "修改订单", saveBtnText: "保存修改" },
                detailPanel: { mainKey: "orderId", title: "订单详情" },
              },
            },
          },
        },
        {
          key: "refund",
          name: "退款管理",
          roles: ["admin"], // RBAC：仅管理员可见
          menuType: "module",
          moduleType: "schema",
          schemaConfig: {
            api: "/api/project/refund",
            schema: {
              type: "object",
              properties: {
                refundId: {
                  type: "string",
                  label: "退款ID",
                  tableOption: { width: 100 },
                  editFormOption: { componentType: "input", disabled: true },
                  detailPanelOption: {},
                },
                refundNo: {
                  type: "string",
                  label: "退款单号",
                  tableOption: { width: 160 },
                  searchOption: { componentType: "input", default: "", placeholder: "请输入退款单号" },
                  detailPanelOption: {},
                },
                orderId: {
                  type: "string",
                  label: "关联订单",
                  tableOption: { width: 110 },
                  searchOption: { componentType: "input", default: "", placeholder: "请输入订单ID" },
                  detailPanelOption: {},
                },
                customerName: {
                  type: "string",
                  label: "客户",
                  tableOption: { width: 120 },
                  searchOption: { componentType: "input", default: "", placeholder: "请输入客户姓名" },
                  detailPanelOption: {},
                },
                amount: {
                  type: "number",
                  label: "退款金额",
                  minimum: 0,
                  tableOption: { width: 120, toFixed: 2 },
                  createFormOption: { componentType: "inputNumber", default: 0 },
                  editFormOption: { componentType: "inputNumber" },
                  detailPanelOption: {},
                },
                reason: {
                  type: "string",
                  label: "退款原因",
                  maxLength: 100,
                  searchOption: { componentType: "input", default: "", placeholder: "请输入退款原因" },
                  createFormOption: { componentType: "textarea" },
                  editFormOption: { componentType: "textarea" },
                  detailPanelOption: {},
                },
                status: {
                  type: "string",
                  label: "审核状态",
                  tableOption: {
                    width: 110,
                    enumList: [
                      { label: "待审核", value: "waiting" },
                      { label: "已通过", value: "approved" },
                      { label: "已拒绝", value: "rejected" },
                    ],
                  },
                  searchOption: {
                    componentType: "select",
                    default: "",
                    enumList: [
                      { label: "待审核", value: "waiting" },
                      { label: "已通过", value: "approved" },
                      { label: "已拒绝", value: "rejected" },
                    ],
                  },
                  detailPanelOption: {},
                },
                applyTime: {
                  type: "string",
                  label: "申请时间",
                  tableOption: { width: 180 },
                  searchOption: {
                    componentType: "dateRange",
                    default: [],
                    showTime: true,
                    valueFormat: "YYYY-MM-DD HH:mm:ss",
                  },
                  detailPanelOption: {},
                },
              },
            },
            tableConfig: {
              rowButtons: [
                {
                  label: "查看",
                  eventKey: "showComponent",
                  type: "primary",
                  eventOption: { comName: "detailPanel" },
                },
                patchButton("通过", "approved", "status", "waiting"),
                patchButton("拒绝", "rejected", "status", "waiting"),
                {
                  label: "删除",
                  eventKey: "delete",
                  type: "danger",
                  eventOption: { params: { refundId: "schema::refundId" } },
                },
              ],
              componentConfig: {
                detailPanel: { mainKey: "refundId", title: "退款详情" },
              },
            },
          },
        },
      ],
    },
    {
      key: "customer-group",
      name: "用户中心",
      menuType: "group",
      subMenu: [
        {
          key: "customer",
          name: "会员管理",
          menuType: "module",
          moduleType: "schema",
          schemaConfig: {
            api: "/api/project/customer",
            schema: {
              type: "object",
              properties: {
                customerId: {
                  type: "string",
                  label: "会员ID",
                  tableOption: { width: 100 },
                  editFormOption: { componentType: "input", disabled: true },
                  detailPanelOption: {},
                },
                nickname: {
                  type: "string",
                  label: "昵称",
                  minLength: 2,
                  maxLength: 20,
                  tableOption: { width: 140 },
                  searchOption: { componentType: "input", default: "", placeholder: "请输入昵称" },
                  createFormOption: { componentType: "input" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                phone: {
                  type: "string",
                  label: "手机号",
                  pattern: "^1[3-9][0-9]{9}$",
                  tableOption: { width: 140 },
                  searchOption: { componentType: "input", default: "", placeholder: "请输入手机号" },
                  createFormOption: { componentType: "input" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                level: {
                  type: "string",
                  label: "会员等级",
                  tableOption: {
                    width: 120,
                    enumList: [
                      { label: "普通", value: "normal" },
                      { label: "白银", value: "silver" },
                      { label: "黄金", value: "gold" },
                      { label: "铂金", value: "platinum" },
                      { label: "钻石", value: "diamond" },
                    ],
                  },
                  searchOption: {
                    componentType: "select",
                    default: "",
                    enumList: [
                      { label: "普通", value: "normal" },
                      { label: "白银", value: "silver" },
                      { label: "黄金", value: "gold" },
                      { label: "铂金", value: "platinum" },
                      { label: "钻石", value: "diamond" },
                    ],
                  },
                  createFormOption: {
                    componentType: "select",
                    default: "normal",
                    enumList: [
                      { label: "普通", value: "normal" },
                      { label: "白银", value: "silver" },
                      { label: "黄金", value: "gold" },
                      { label: "铂金", value: "platinum" },
                      { label: "钻石", value: "diamond" },
                    ],
                  },
                  editFormOption: {
                    componentType: "select",
                    enumList: [
                      { label: "普通", value: "normal" },
                      { label: "白银", value: "silver" },
                      { label: "黄金", value: "gold" },
                      { label: "铂金", value: "platinum" },
                      { label: "钻石", value: "diamond" },
                    ],
                  },
                  detailPanelOption: {},
                },
                points: {
                  type: "number",
                  label: "积分",
                  minimum: 0,
                  tableOption: { width: 110 },
                  createFormOption: { componentType: "inputNumber", default: 0 },
                  editFormOption: { componentType: "inputNumber" },
                  detailPanelOption: {},
                },
                balance: {
                  type: "number",
                  label: "余额",
                  tableOption: { width: 110, toFixed: 2 },
                  detailPanelOption: {},
                },
                status: {
                  type: "string",
                  label: "启用状态",
                  tableOption: {
                    width: 110,
                    enumList: [
                      { label: "启用", value: "1" },
                      { label: "停用", value: "0" },
                    ],
                  },
                  searchOption: {
                    componentType: "select",
                    default: "",
                    enumList: [
                      { label: "启用", value: "1" },
                      { label: "停用", value: "0" },
                    ],
                  },
                  createFormOption: { componentType: "switch", default: "1" },
                  editFormOption: { componentType: "switch" },
                  detailPanelOption: {},
                },
                createTime: {
                  type: "string",
                  label: "注册时间",
                  tableOption: { width: 180 },
                  searchOption: {
                    componentType: "dateRange",
                    default: [],
                    showTime: true,
                    valueFormat: "YYYY-MM-DD HH:mm:ss",
                  },
                  detailPanelOption: {},
                },
              },
              required: ["nickname"],
            },
            tableConfig: {
              rowSelection: true, // 业务扩展：启用行选择（配合 batchRemove 批量删除）
              rowButtons: [
                {
                  label: "查看",
                  eventKey: "showComponent",
                  type: "primary",
                  eventOption: { comName: "detailPanel" },
                },
                {
                  label: "修改",
                  eventKey: "showComponent",
                  type: "warning",
                  eventOption: { comName: "editForm" },
                },
                {
                  label: "删除",
                  eventKey: "delete",
                  type: "danger",
                  eventOption: { params: { customerId: "schema::customerId" } },
                },
              ],
              componentConfig: {
                editForm: { mainKey: "customerId", title: "修改会员", saveBtnText: "保存修改" },
                detailPanel: { mainKey: "customerId", title: "会员详情" },
              },
            },
          },
        },
        {
          key: "user",
          name: "系统用户",
          roles: ["admin"], // RBAC：仅管理员可见
          menuType: "module",
          moduleType: "schema",
          schemaConfig: {
            api: "/api/project/user",
            schema: {
              type: "object",
              properties: {
                userId: {
                  type: "string",
                  label: "用户ID",
                  tableOption: { width: 110 },
                  editFormOption: { componentType: "input", disabled: true },
                  detailPanelOption: {},
                },
                userName: {
                  type: "string",
                  label: "用户名",
                  minLength: 2,
                  maxLength: 32,
                  tableOption: { width: 140 },
                  searchOption: { componentType: "input", default: "", placeholder: "请输入用户名" },
                  createFormOption: { componentType: "input" },
                  editFormOption: { componentType: "input", disabled: true },
                  detailPanelOption: {},
                },
                nickname: {
                  type: "string",
                  label: "昵称",
                  maxLength: 32,
                  tableOption: { width: 140 },
                  createFormOption: { componentType: "input" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                role: {
                  type: "string",
                  label: "角色",
                  tableOption: {
                    width: 120,
                    enumList: [
                      { label: "管理员", value: "admin" },
                      { label: "普通用户", value: "user" },
                    ],
                  },
                  searchOption: {
                    componentType: "select",
                    default: "",
                    enumList: [
                      { label: "管理员", value: "admin" },
                      { label: "普通用户", value: "user" },
                    ],
                  },
                  createFormOption: {
                    componentType: "radioGroup",
                    default: "user",
                    enumList: [
                      { label: "管理员", value: "admin" },
                      { label: "普通用户", value: "user" },
                    ],
                  },
                  editFormOption: {
                    componentType: "radioGroup",
                    enumList: [
                      { label: "管理员", value: "admin" },
                      { label: "普通用户", value: "user" },
                    ],
                  },
                  detailPanelOption: {},
                },
                status: {
                  type: "string",
                  label: "启用状态",
                  tableOption: {
                    width: 110,
                    enumList: [
                      { label: "启用", value: "1" },
                      { label: "停用", value: "0" },
                    ],
                  },
                  searchOption: {
                    componentType: "select",
                    default: "",
                    enumList: [
                      { label: "启用", value: "1" },
                      { label: "停用", value: "0" },
                    ],
                  },
                  createFormOption: { componentType: "switch", default: "1" },
                  editFormOption: { componentType: "switch" },
                  detailPanelOption: {},
                },
                createTime: {
                  type: "string",
                  label: "创建时间",
                  tableOption: { width: 180 },
                  detailPanelOption: {},
                },
              },
              required: ["userName"],
            },
            tableConfig: {
              headerButtons: [
                {
                  label: "新增用户",
                  eventKey: "showComponent",
                  type: "outline",
                  eventOption: { comName: "createForm" },
                },
              ],
              rowButtons: [
                {
                  label: "查看",
                  eventKey: "showComponent",
                  type: "primary",
                  eventOption: { comName: "detailPanel" },
                },
                {
                  label: "修改",
                  eventKey: "showComponent",
                  type: "warning",
                  eventOption: { comName: "editForm" },
                },
                {
                  label: "删除",
                  eventKey: "delete",
                  type: "danger",
                  eventOption: { params: { userId: "schema::userId" } },
                },
              ],
              componentConfig: {
                createForm: { title: "新增用户", saveBtnText: "新增用户" },
                editForm: { mainKey: "userId", title: "修改用户", saveBtnText: "保存修改" },
                detailPanel: { mainKey: "userId", title: "用户详情" },
              },
            },
          },
        },
      ],
    },
    {
      key: "marketing-group",
      name: "营销中心",
      menuType: "group",
      subMenu: [
        {
          key: "coupon",
          name: "优惠券管理",
          menuType: "module",
          moduleType: "schema",
          schemaConfig: {
            api: "/api/project/coupon",
            schema: {
              type: "object",
              properties: {
                couponId: {
                  type: "string",
                  label: "优惠券ID",
                  tableOption: { width: 110 },
                  editFormOption: { componentType: "input", disabled: true },
                  detailPanelOption: {},
                },
                couponName: {
                  type: "string",
                  label: "券名称",
                  minLength: 2,
                  maxLength: 30,
                  tableOption: { width: 200 },
                  searchOption: { componentType: "input", default: "", placeholder: "请输入券名称" },
                  createFormOption: { componentType: "input" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                couponType: {
                  type: "string",
                  label: "券类型",
                  tableOption: {
                    width: 110,
                    enumList: [
                      { label: "满减券", value: "reduce" },
                      { label: "折扣券", value: "discount" },
                    ],
                  },
                  searchOption: {
                    componentType: "select",
                    default: "",
                    enumList: [
                      { label: "满减券", value: "reduce" },
                      { label: "折扣券", value: "discount" },
                    ],
                  },
                  createFormOption: {
                    componentType: "radioGroup",
                    default: "reduce",
                    enumList: [
                      { label: "满减券", value: "reduce" },
                      { label: "折扣券", value: "discount" },
                    ],
                  },
                  editFormOption: {
                    componentType: "radioGroup",
                    enumList: [
                      { label: "满减券", value: "reduce" },
                      { label: "折扣券", value: "discount" },
                    ],
                  },
                  detailPanelOption: {},
                },
                threshold: {
                  type: "number",
                  label: "使用门槛",
                  minimum: 0,
                  tableOption: { width: 110, toFixed: 0 },
                  createFormOption: { componentType: "inputNumber", default: 0 },
                  editFormOption: { componentType: "inputNumber" },
                  detailPanelOption: {},
                },
                amount: {
                  type: "number",
                  label: "优惠金额",
                  minimum: 0,
                  tableOption: { width: 110, toFixed: 0 },
                  createFormOption: { componentType: "inputNumber", default: 0 },
                  editFormOption: { componentType: "inputNumber" },
                  detailPanelOption: {},
                },
                status: {
                  type: "string",
                  label: "启用状态",
                  tableOption: {
                    width: 110,
                    enumList: [
                      { label: "启用", value: "1" },
                      { label: "停用", value: "0" },
                    ],
                  },
                  searchOption: {
                    componentType: "select",
                    default: "",
                    enumList: [
                      { label: "启用", value: "1" },
                      { label: "停用", value: "0" },
                    ],
                  },
                  createFormOption: { componentType: "switch", default: "1" },
                  editFormOption: { componentType: "switch" },
                  detailPanelOption: {},
                },
                description: {
                  type: "string",
                  label: "使用说明",
                  maxLength: 100,
                  createFormOption: { componentType: "textarea" },
                  editFormOption: { componentType: "textarea" },
                  detailPanelOption: {},
                },
                createTime: {
                  type: "string",
                  label: "创建时间",
                  tableOption: { width: 180 },
                  searchOption: {
                    componentType: "dateRange",
                    default: [],
                    showTime: true,
                    valueFormat: "YYYY-MM-DD HH:mm:ss",
                  },
                  detailPanelOption: {},
                },
              },
              required: ["couponName"],
            },
            tableConfig: {
              headerButtons: [
                {
                  label: "新增优惠券",
                  eventKey: "showComponent",
                  type: "outline",
                  eventOption: { comName: "createForm" },
                },
              ],
              rowButtons: [
                {
                  label: "查看",
                  eventKey: "showComponent",
                  type: "primary",
                  eventOption: { comName: "detailPanel" },
                },
                {
                  label: "修改",
                  eventKey: "showComponent",
                  type: "warning",
                  eventOption: { comName: "editForm" },
                },
                {
                  label: "删除",
                  eventKey: "delete",
                  type: "danger",
                  eventOption: { params: { couponId: "schema::couponId" } },
                },
              ],
              componentConfig: {
                createForm: { title: "新增优惠券", saveBtnText: "新增优惠券" },
                editForm: { mainKey: "couponId", title: "修改优惠券", saveBtnText: "保存修改" },
                detailPanel: { mainKey: "couponId", title: "优惠券详情" },
              },
            },
          },
        },
        {
          key: "banner",
          name: "轮播图管理",
          menuType: "module",
          moduleType: "schema",
          schemaConfig: {
            api: "/api/project/banner",
            schema: {
              type: "object",
              properties: {
                bannerId: {
                  type: "string",
                  label: "轮播ID",
                  tableOption: { width: 100 },
                  editFormOption: { componentType: "input", disabled: true },
                  detailPanelOption: {},
                },
                title: {
                  type: "string",
                  label: "标题",
                  minLength: 2,
                  maxLength: 30,
                  tableOption: { width: 200 },
                  searchOption: { componentType: "input", default: "", placeholder: "请输入标题" },
                  createFormOption: { componentType: "input" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                imageUrl: {
                  type: "string",
                  label: "图片地址",
                  tableOption: { width: 240, ellipsis: true, tooltip: true },
                  createFormOption: {
                    componentType: "input",
                    placeholder: "https:// 开头的图片地址",
                  },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                linkUrl: {
                  type: "string",
                  label: "跳转链接",
                  tableOption: { width: 240, ellipsis: true, tooltip: true },
                  createFormOption: { componentType: "input" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                sort: {
                  type: "number",
                  label: "排序",
                  minimum: 0,
                  tableOption: { width: 90 },
                  createFormOption: { componentType: "inputNumber", default: 99 },
                  editFormOption: { componentType: "inputNumber" },
                  detailPanelOption: {},
                },
                status: {
                  type: "string",
                  label: "启用状态",
                  tableOption: {
                    width: 110,
                    enumList: [
                      { label: "启用", value: "1" },
                      { label: "停用", value: "0" },
                    ],
                  },
                  searchOption: {
                    componentType: "select",
                    default: "",
                    enumList: [
                      { label: "启用", value: "1" },
                      { label: "停用", value: "0" },
                    ],
                  },
                  createFormOption: { componentType: "switch", default: "1" },
                  editFormOption: { componentType: "switch" },
                  detailPanelOption: {},
                },
                remark: {
                  type: "string",
                  label: "备注",
                  maxLength: 100,
                  createFormOption: { componentType: "textarea" },
                  editFormOption: { componentType: "textarea" },
                  detailPanelOption: {},
                },
                createTime: {
                  type: "string",
                  label: "创建时间",
                  tableOption: { width: 180 },
                  detailPanelOption: {},
                },
              },
              required: ["title"],
            },
            tableConfig: {
              headerButtons: [
                {
                  label: "新增轮播图",
                  eventKey: "showComponent",
                  type: "outline",
                  eventOption: { comName: "createForm" },
                },
              ],
              rowButtons: [
                {
                  label: "查看",
                  eventKey: "showComponent",
                  type: "primary",
                  eventOption: { comName: "detailPanel" },
                },
                {
                  label: "修改",
                  eventKey: "showComponent",
                  type: "warning",
                  eventOption: { comName: "editForm" },
                },
                {
                  label: "删除",
                  eventKey: "delete",
                  type: "danger",
                  eventOption: { params: { bannerId: "schema::bannerId" } },
                },
              ],
              componentConfig: {
                createForm: { title: "新增轮播图", saveBtnText: "新增轮播图" },
                editForm: { mainKey: "bannerId", title: "修改轮播图", saveBtnText: "保存修改" },
                detailPanel: { mainKey: "bannerId", title: "轮播图详情" },
              },
            },
          },
        },
      ],
    },
    {
      key: "stats",
      name: "数据统计",
      menuType: "module",
      moduleType: "sider",
      siderConfig: {
        menu: [
          {
            key: "analysis",
            name: "销售分析",
            menuType: "module",
            moduleType: "custom",
            customConfig: { path: "/commerce/analysis" },
          },
          {
            key: "monitor",
            name: "服务监控",
            menuType: "module",
            moduleType: "iframe",
            iframeConfig: { path: "/view/health" },
          },
        ],
      },
    },
  ],
};
