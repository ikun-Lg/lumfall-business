module.exports = {
  "/api/auth/login": {
    post: {
      body: {
        type: "object",
        properties: {
          username: { type: "string", minLength: 1 },
          password: { type: "string", minLength: 1 },
        },
        required: ["username", "password"],
      },
    },
  },
  "/api/auth/current_user": {
    get: {},
  },
};
