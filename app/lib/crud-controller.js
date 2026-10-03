// 通用 CRUD controller 工厂：实现 schema 模块的后端接口契约（dsl-guide 6.6）：
//   GET    <api>/list     分页列表（query: 搜索字段 + page + pageSize）
//   GET    <api>          单条（query: mainKey）——editForm / detailPanel 回显
//   POST   <api>          新增（body: createForm 表单值）
//   PUT    <api>          更新（body: { mainKey, ...editForm 表单值 }）
//   PATCH  <api>          局部更新（业务扩展：状态流转按钮）
//   DELETE <api>          删除（body: { mainKey }）
//   GET    <api>Enum/list 枚举选项（dynamicSelect 数据源）
//
// 用法（app/controller/commerce.js）：
//   module.exports = (app) => ({
//     product: createCrudController(app, { serviceName: "commerce.product", mainKey: "productId" }),
//   });

module.exports = (app, { serviceName, mainKey }) => {
  const BaseController = require("lumfall").Controller.Base(app);

  return class CrudController extends BaseController {
    get service() {
      const [group, name] = serviceName.split(".");
      return this.services[group][name];
    }

    async list(ctx) {
      // page/pageSize/sortBy/sortOrder 是分页排序控制参数，其余 query 全部作为过滤条件
      // （空串由 store 视为「不过滤」，与 schema-search-bar 的空值语义对齐）
      const { page, pageSize, sortBy, sortOrder, ...filters } = ctx.request.query;
      try {
        const { data, total } = this.service.list({
          page: Number(page) || 1,
          size: Number(pageSize) || 20,
          sortBy,
          sortOrder,
          filters,
        });
        await this.success(ctx, data, { total });
      } catch (error) {
        await this.fail(ctx, error.message || "查询失败", error.code || 50000);
      }
    }

    async getOne(ctx) {
      const row = this.service.get(ctx.request.query[mainKey]);
      if (!row) {
        await this.fail(ctx, "获取失败，未找到对应数据", 50000);
        return;
      }
      await this.success(ctx, row);
    }

    async create(ctx) {
      try {
        const row = this.service.create(ctx.request.body);
        await this.success(ctx, row);
      } catch (error) {
        await this.fail(ctx, error.message || "创建失败", error.code || 50000);
      }
    }

    async update(ctx) {
      try {
        const row = this.service.update(ctx.request.body);
        if (!row) {
          await this.fail(ctx, "更新失败，未找到对应数据", 50000);
          return;
        }
        await this.success(ctx, row);
      } catch (error) {
        await this.fail(ctx, error.message || "更新失败", error.code || 50000);
      }
    }

    /** 局部更新：body = { mainKey: 值, ...要改的字段 }。供「发货 / 审核」等状态流转按钮使用 */
    async patchOne(ctx) {
      const body = ctx.request.body || {};
      if (body[mainKey] === undefined) {
        await this.fail(ctx, "缺少主键参数", 50000);
        return;
      }
      const patch = { ...body };
      delete patch[mainKey];
      const row = this.service.patch(body[mainKey], patch);
      if (!row) {
        await this.fail(ctx, "更新失败，未找到对应数据", 50000);
        return;
      }
      await this.success(ctx, row);
    }

    async remove(ctx) {
      try {
        const ok = this.service.remove(ctx.request.body[mainKey]);
        if (!ok) {
          await this.fail(ctx, "删除失败，未找到对应数据", 50000);
          return;
        }
        await this.success(ctx, null);
      } catch (error) {
        await this.fail(ctx, error.message || "删除失败", error.code || 50000);
      }
    }

    async enumList(ctx) {
      await this.success(ctx, this.service.getEnumList());
    }
  };
};
