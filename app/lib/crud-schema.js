// router-schema 生成器：按 CRUD 契约为一个 api 基址生成 5 个方法的参数校验。
// 注意：登记的 key 必须与路由 path 完全一致，否则校验静默不生效（dsl-guide 9.4）。

/**
 * @param {object} options
 * @param {string} options.basePath   api 基址（如 "/api/project/product"）
 * @param {string} options.mainKey    主键字段
 * @param {string[]} [options.searchFields] 列表接口的搜索字段（值都是 query 字符串）
 * @param {object} [options.createBody] POST body 的 JSON Schema 属性（可选兜底校验）
 */
module.exports = function crudSchema({ basePath, mainKey, searchFields = [], createBody = {} }) {
  const query = {
    type: "object",
    properties: Object.fromEntries([
      ["page", { type: "string" }],
      ["pageSize", { type: "string" }],
      ...searchFields.map((field) => [field, { type: "string" }]),
    ]),
  };

  return {
    [`${basePath}/list`]: {
      get: { query },
    },
    [basePath]: {
      get: {
        query: {
          type: "object",
          properties: { [mainKey]: { type: "string" } },
          required: [mainKey],
        },
      },
      post: {
        body: {
          type: "object",
          properties: createBody,
        },
      },
      put: {
        body: {
          type: "object",
          properties: { [mainKey]: { type: "string" }, ...createBody },
          required: [mainKey],
        },
      },
      patch: {
        body: {
          type: "object",
          properties: { [mainKey]: { type: "string" } },
          required: [mainKey],
        },
      },
      delete: {
        body: {
          type: "object",
          properties: { [mainKey]: { type: "string" } },
          required: [mainKey],
        },
      },
    },
  };
};
