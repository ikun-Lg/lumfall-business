module.exports = (app) => {
  const BaseService = require("lumfall").Service.Base(app);

  // 商品类型枚举（与 model/business/model.js 商品管理 schema 的 productType 字段对应）
  const PRODUCT_TYPE_ENUM_LIST = [
    { label: "电子数码", value: "electronics" },
    { label: "服饰鞋包", value: "clothing" },
    { label: "家居生活", value: "home" },
  ];

  // mock 数据池（基于 model/business/model.js 中商品管理 schema 的字段定义）
  const mockPool = Array.from({ length: 126 }, (_, i) => ({
    productId: `P${String(i + 1).padStart(6, "0")}`,
    productName: `测试商品${i + 1}`,
    productType: PRODUCT_TYPE_ENUM_LIST[i % PRODUCT_TYPE_ENUM_LIST.length].value,
    status: i % 2 === 0 ? "1" : "0",
    price: Math.round(Math.random() * 10000) / 100,
    inventory: Math.floor(Math.random() * 5000),
    createTime: new Date(Date.now() - i * 86400000)
      .toISOString()
      .slice(0, 19)
      .replace("T", " "),
  }));

  // 用户管理 mock 数据池（登录账号见 app/service/auth.js，两者独立演示）


  const userPool = Array.from({ length: 9 }, (_, i) => ({


    userId: `U${String(i + 1).padStart(4, "0")}`,


    userName: i === 0 ? "admin" : `user${i}`,


    nickname: i === 0 ? "管理员" : `用户${i}`,


    role: i === 0 ? "admin" : "user",


    status: i % 3 === 0 ? "0" : "1",


    createTime: new Date(Date.now() - i * 86400000).toISOString().slice(0, 19).replace("T", " "),


  }));


  
return class BusinessService extends BaseService {
    /**
     * 获取业务列表（mock）
     * @param {{ page: number, size: number }} param0
     */
    getBusinessList({ page = 1, size = 50 }) {
      const start = (page - 1) * size;
      const end = start + size;
      const data = mockPool.slice(start, end);

      return {
        data,
        total: mockPool.length,
      };
    }

    /**
     * 获取单个商品（mock）
     * @param {{ productId: string }} param0
     * @returns {object|null} 商品不存在时返回 null
     */
    getBusiness({ productId }) {
      return mockPool.find((item) => item.productId === productId) || null;
    }

    /**
     * 创建商品（mock）
     * @param {{ productName: string, price?: number, inventory?: number }} productData
     */
    createBusiness(productData) {
      const nextId = mockPool.reduce((maxId, item) => {
        const id = Number(item.productId.slice(1)) || 0;
        return Math.max(maxId, id);
      }, 0) + 1;
      const product = {
        productId: `P${String(nextId).padStart(6, "0")}`,
        productName: productData.productName,
        productType: PRODUCT_TYPE_ENUM_LIST[0].value,
        status: "1",
        price: productData.price ?? 0,
        inventory: productData.inventory ?? 0,
        createTime: new Date().toISOString().slice(0, 19).replace("T", " "),
      };

      mockPool.push(product);
      return product;
    }

    /**
     * 更新商品（mock）
     * @param {{ productId: string, productName?: string, price?: number, inventory?: number }} productData
     * @returns {object|null} 更新后的商品；商品不存在时返回 null
     */
    updateBusiness(productData) {
      const product = mockPool.find(
        (item) => item.productId === productData.productId,
      );

      if (!product) {
        return null;
      }

      for (const key of ["productName", "price", "inventory"]) {
        if (productData[key] !== undefined) {
          product[key] = productData[key];
        }
      }

      return product;
    }

    /**
     * 删除业务数据（mock）
     * @param {{ productId: string }} param0
     * @returns {boolean} 是否删除成功
     */
    deleteBusinessList({ productId }) {
      const index = mockPool.findIndex((item) => item.productId === productId);

      if (index === -1) {
        return false;
      }

      mockPool.splice(index, 1);
      return true;
    }

    /**
     * 获取商品类型枚举列表（供搜索栏 dynamicSelect 拉取选项）
     * @returns {Array<{label: string, value: string}>}
     */
    getProductEnumList() {
      return PRODUCT_TYPE_ENUM_LIST.map(({ label, value }) => ({ label, value }));
    }

    // ===== 用户管理（mock，与 model/business/model.js 用户管理 schema 对应） =====

    /**
     * 分页查询用户（支持 userName 模糊 / status 过滤，空串表示不过滤）
     */
    getUserList({ page = 1, size = 50, userName = "", status = "" }) {
      const filtered = userPool.filter((item) => {
        if (userName && !item.userName.includes(userName)) return false;
        if (status && item.status !== status) return false;
        return true;
      });
      const start = (page - 1) * size;
      return {
        data: filtered.slice(start, start + size).map((item) => ({ ...item })),
        total: filtered.length,
      };
    }

    getUser({ userId }) {
      return userPool.find((item) => item.userId === userId) || null;
    }

    createUser({ userName, nickname = "", role = "user", status = "1" }) {
      if (userPool.some((item) => item.userName === userName)) {
        return null; // 用户名已存在
      }
      const nextId = userPool.reduce((max, item) => {
        return Math.max(max, Number(item.userId.slice(1)) || 0);
      }, 0) + 1;
      const user = {
        userId: `U${String(nextId).padStart(4, "0")}`,
        userName,
        nickname: nickname || userName,
        role,
        status,
        createTime: new Date().toISOString().slice(0, 19).replace("T", " "),
      };
      userPool.unshift(user);
      return user;
    }

    updateUser({ userId, nickname, role, status }) {
      const user = userPool.find((item) => item.userId === userId);
      if (!user) return null;
      for (const key of ["nickname", "role", "status"]) {
        const value = { nickname, role, status }[key];
        if (value !== undefined) user[key] = value;
      }
      return user;
    }

    deleteUser({ userId }) {
      const index = userPool.findIndex((item) => item.userId === userId);
      if (index === -1) return false;
      userPool.splice(index, 1);
      return true;
    }
  };
};
