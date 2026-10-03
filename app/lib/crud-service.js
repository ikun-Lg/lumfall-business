// 通用 CRUD service 工厂：基于 store 插件的领域集合提供标准增删改查。
// 领域差异（如「分类被商品引用时禁止删除」）通过 options.hooks 注入，
// 或在具体 service 里继承后覆盖方法。
//
// 用法（app/service/commerce/product.js）：
//   const createCrudService = require("../../lib/crud-service");
//   module.exports = (app) => createCrudService(app, { collection: "product", mainKey: "productId" });

/**
 * @param {object} options
 * @param {string} options.collection  store 集合名
 * @param {string} options.mainKey     主键字段（DSL componentConfig 的 mainKey 一致）
 * @param {string} [options.enumField] 枚举选项接口展示字段（dynamicSelect 数据源）
 * @param {Function} [options.validateRemove] 删除前校验：(store, id) => string | null，返回错误消息则拒绝删除
 */
module.exports = (app, options) => {
  const BaseService = require("lumfall").Service.Base(app);
  const { collection, mainKey, enumField, validateRemove, idPrefix = "", idLength = 4 } = options;

  return class CrudService extends BaseService {
    /** 请求阶段再取仓库，避免插件注册时序问题 */
    get repo() {
      return this.app.plugins.store.store.collection(collection);
    }

    /**
     * 分页查询：filters 的键值对直接映射 store 过滤语义
     * （空串表示不过滤、数组 in、`_min`/`_max` 区间、字符串包含匹配）
     */
    list({ page = 1, size = 20, sortBy, sortOrder, filters = {} } = {}) {
      return this.repo.list({ page, size, filters, sortBy, sortOrder });
    }

    get(id) {
      return this.repo.get(mainKey, id);
    }

    create(data) {
      const nextId = this.nextId();
      const row = {
        [mainKey]: nextId,
        createTime: this.now(),
        ...data,
      };
      return this.repo.insert(row);
    }

    /** PUT 全量更新（body 必带 mainKey） */
    update(data) {
      const id = data[mainKey];
      const patch = { ...data };
      delete patch[mainKey];
      return this.repo.update(mainKey, id, patch);
    }

    /** PATCH 局部更新（状态流转等轻量操作） */
    patch(id, patch) {
      return this.repo.update(mainKey, id, patch);
    }

    /** @returns {boolean} 是否删除成功 */
    remove(id) {
      if (validateRemove) {
        const message = validateRemove(this.app.plugins.store.store, id);
        if (message) {
          const error = new Error(message);
          error.code = 50000;
          throw error;
        }
      }
      return Boolean(this.repo.remove(mainKey, id));
    }

    /** dynamicSelect 枚举选项数据源：[{ label, value }] */
    getEnumList() {
      if (!enumField) return [];
      return this.repo.all().map((row) => ({
        label: String(row[enumField]),
        value: String(row[mainKey]),
      }));
    }

    nextId() {
      const maxNum = this.repo.all().reduce((max, row) => {
        const num = Number(String(row[mainKey]).replace(/^\D+/, ""));
        return Number.isNaN(num) ? max : Math.max(max, num);
      }, 0);
      return `${idPrefix}${String(maxNum + 1).padStart(idLength, "0")}`;
    }

    now() {
      const iso = new Date().toISOString();
      return `${iso.slice(0, 10)} ${iso.slice(11, 19)}`;
    }
  };
};
