// 内存数据仓库（通过 serviceStart plugins 挂到 app.plugins.store）。
// 所有 schema 模块的 CRUD service 都基于它工作；接入真实数据库时，
// 保持 collection() 的方法签名不变即可无痛替换实现。
//
// list 过滤语义（与 schema-search-bar 的下发行为对齐）：
// - "" / null / undefined          → 忽略（空串表示「不过滤」）
// - 数组                            → in 集合
// - `<field>_min` / `<field>_max`  → 数值区间（numberRange 搜索控件拆参）
// - string                          → like 包含匹配
// - number / boolean                → 精确相等

const isBlank = (value) => value === undefined || value === null || value === "";

function createCollection(name, rows) {
  const data = rows || [];

  const matchRow = (row, filters) => {
    for (const rawKey of Object.keys(filters)) {
      const value = filters[rawKey];
      if (isBlank(value)) continue;

      // `<field>_min` / `<field>_max` 区间后缀
      const rangeMatch = rawKey.match(/^(.+)_(min|max)$/);
      if (rangeMatch) {
        const [, field, bound] = rangeMatch;
        const num = Number(value);
        if (Number.isNaN(num)) continue;
        if (bound === "min" && !(Number(row[field]) >= num)) return false;
        if (bound === "max" && !(Number(row[field]) <= num)) return false;
        continue;
      }

      if (Array.isArray(value)) {
        if (!value.map(String).includes(String(row[rawKey]))) return false;
        continue;
      }

      if (typeof value === "number" || typeof value === "boolean") {
        if (row[rawKey] !== value) return false;
        continue;
      }

      // 字符串一律包含匹配（ID / 名称 / 手机号等场景均可接受）
      if (!String(row[rawKey] ?? "").includes(String(value))) return false;
    }
    return true;
  };

  return {
    name,
    all() {
      return data.map((row) => ({ ...row }));
    },
    count() {
      return data.length;
    },
    list({ page = 1, size = 20, filters = {}, sortBy, sortOrder = "desc" } = {}) {
      const matched = data.filter((row) => matchRow(row, filters));
      if (sortBy) {
        const direction = sortOrder === "asc" ? 1 : -1;
        matched.sort((a, b) => {
          const av = a[sortBy];
          const bv = b[sortBy];
          if (av === bv) return 0;
          return (av > bv ? 1 : -1) * direction;
        });
      }
      const start = (page - 1) * size;
      return {
        data: matched.slice(start, start + size).map((row) => ({ ...row })),
        total: matched.length,
      };
    },
    get(mainKey, value) {
      return data.find((row) => String(row[mainKey]) === String(value)) || null;
    },
    insert(row) {
      data.unshift({ ...row });
      return row;
    },
    update(mainKey, value, patch) {
      const row = data.find((item) => String(item[mainKey]) === String(value));
      if (!row) return null;
      for (const key of Object.keys(patch)) {
        row[key] = patch[key];
      }
      return row;
    },
    remove(mainKey, value) {
      const index = data.findIndex(
        (item) => String(item[mainKey]) === String(value)
      );
      if (index === -1) return null;
      return data.splice(index, 1)[0];
    },
  };
}

function createStore(seedMap = {}) {
  const collections = new Map();

  return {
    /** 取集合；尚未初始化的集合自动建空仓 */
    collection(name) {
      if (!collections.has(name)) {
        collections.set(name, createCollection(name, seedMap[name]));
      }
      return collections.get(name);
    },
    /** 健康探针：所有集合可访问即视为健康 */
    ping() {
      for (const name of Object.keys(seedMap)) {
        this.collection(name).count();
      }
      return true;
    },
  };
}

module.exports = { createStore };
