// 电商域 router-schema：由 crud-schema 按 CRUD 契约生成。
// searchFields 要与各 schema 模块 searchOption 的下发参数对齐：
// dateRange 拆为 <field>_start / <field>_end，numberRange（业务扩展控件）拆为 <field>_min / <field>_max。
const crudSchema = require("../lib/crud-schema");

module.exports = {
  ...crudSchema({
    basePath: "/api/project/product",
    mainKey: "productId",
    searchFields: [
      "productName", "categoryId", "brand", "status",
      "price_min", "price_max", "createTime_start", "createTime_end",
    ],
    createBody: { productName: { type: "string", minLength: 1 } },
  }),
  ...crudSchema({
    basePath: "/api/project/category",
    mainKey: "categoryId",
    searchFields: ["categoryName", "status", "createTime_start", "createTime_end"],
    createBody: { categoryName: { type: "string", minLength: 1 } },
  }),
  ...crudSchema({
    basePath: "/api/project/order",
    mainKey: "orderId",
    searchFields: [
      "orderNo", "customerName", "payType", "status",
      "totalAmount_min", "totalAmount_max", "createTime_start", "createTime_end",
    ],
  }),
  ...crudSchema({
    basePath: "/api/project/refund",
    mainKey: "refundId",
    searchFields: [
      "refundNo", "orderId", "customerName", "status",
      "applyTime_start", "applyTime_end",
    ],
  }),
  ...crudSchema({
    basePath: "/api/project/customer",
    mainKey: "customerId",
    searchFields: [
      "nickname", "phone", "level", "status",
      "createTime_start", "createTime_end",
    ],
    createBody: { nickname: { type: "string", minLength: 1 } },
  }),
  ...crudSchema({
    basePath: "/api/project/user",
    mainKey: "userId",
    searchFields: ["userName", "status"],
    createBody: { userName: { type: "string", minLength: 1, maxLength: 32 } },
  }),
  ...crudSchema({
    basePath: "/api/project/coupon",
    mainKey: "couponId",
    searchFields: ["couponName", "couponType", "status", "createTime_start", "createTime_end"],
    createBody: { couponName: { type: "string", minLength: 1 } },
  }),
  ...crudSchema({
    basePath: "/api/project/banner",
    mainKey: "bannerId",
    searchFields: ["title", "status", "createTime_start", "createTime_end"],
    createBody: { title: { type: "string", minLength: 1 } },
  }),
};
