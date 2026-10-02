module.exports = {
  "/api/project/product/list": {
    get: {
      query: {
        type: "object",
        properties: {
          page: {
            type: "string",
          },
          pageSize: {
            type: "string",
          },
        },
      },
    },
  },
  "/api/project/productEnum/list": {
    get: {},
  },
  "/api/project/product": {
    get: {
      query: {
        type: "object",
        properties: {
          productId: {
            type: "string",
          },
        },
        required: ["productId"],
      },
    },
    post: {
      body: {
        type: "object",
        properties: {
          productName: {
            type: "string",
          },
          price: {
            type: "number",
          },
          inventory: {
            type: "number",
          },
        },
        required: ["productName"],
      },
    },
    put: {
      body: {
        type: "object",
        properties: {
          productId: {
            type: "string",
          },
          productName: {
            type: "string",
          },
          price: {
            type: "number",
          },
          inventory: {
            type: "number",
          },
        },
        required: ["productId"],
      },
    },
    delete: {
      body: {
        type: "object",
        properties: {
          productId: {
            type: "string",
          },
        },
        required: ["productId"],
      },
    },
  },
  "/api/business/user/list": {
    get: {
      query: {
        type: "object",
        properties: {
          page: { type: "string" },
          pageSize: { type: "string" },
          userName: { type: "string" },
          status: { type: "string" },
        },
      },
    },
  },
  "/api/business/user": {
    get: {
      query: {
        type: "object",
        properties: {
          userId: { type: "string" },
        },
        required: ["userId"],
      },
    },
    post: {
      body: {
        type: "object",
        properties: {
          userName: { type: "string", minLength: 1, maxLength: 32 },
          nickname: { type: "string", maxLength: 32 },
          role: { type: "string" },
          status: { type: "string" },
        },
        required: ["userName"],
      },
    },
    put: {
      body: {
        type: "object",
        properties: {
          userId: { type: "string" },
          nickname: { type: "string", maxLength: 32 },
          role: { type: "string" },
          status: { type: "string" },
        },
        required: ["userId"],
      },
    },
    delete: {
      body: {
        type: "object",
        properties: {
          userId: { type: "string" },
        },
        required: ["userId"],
      },
    },
  },
};