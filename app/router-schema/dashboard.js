// 概览与统计接口参数校验。
module.exports = {
  "/api/dashboard/stats": {
    get: {
      query: {
        type: "object",
        properties: {
          domain: { type: "string", enum: ["commerce", "course"] },
        },
      },
    },
  },
  "/api/dashboard/trends": {
    get: {
      query: {
        type: "object",
        properties: {
          domain: { type: "string", enum: ["commerce", "course"] },
        },
      },
    },
  },
  "/api/analysis/sales": {
    get: {},
  },
  "/api/analysis/learning": {
    get: {},
  },
};
