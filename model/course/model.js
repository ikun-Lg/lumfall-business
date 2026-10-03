// 课程系统 Model：与电商系统同住一个管理台（顶部系统切换），
// 菜单形态与电商侧对称：group 分组 / schema 全四视图 / sider / iframe / custom。
// 演示 dynamicSelect 跨集合引用（章节搜索按课程过滤、课时搜索按章节过滤）。
const {
  courseCategoryEnumList,
  teacherEnumList,
  payTypeEnumList,
} = require("../../plugin/store/seed");

// 与电商侧一致的按钮扩展语义（patch 状态流转 + visibleWhen 按行显隐）
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

const COURSE_STATUS_ENUM = [
  { label: "草稿", value: "draft" },
  { label: "已上架", value: "published" },
  { label: "已下架", value: "offline" },
];

const DIFFICULTY_ENUM = [
  { label: "入门", value: "beginner" },
  { label: "进阶", value: "intermediate" },
  { label: "高级", value: "advanced" },
];

module.exports = {
  model: "dashboard",
  name: "课程系统",
  menu: [
    {
      key: "dashboard",
      name: "数据看板",
      menuType: "module",
      moduleType: "custom",
      customConfig: { path: "/dashboard" },
    },
    {
      key: "course-group",
      name: "课程中心",
      menuType: "group",
      subMenu: [
        {
          key: "course",
          name: "课程管理",
          menuType: "module",
          moduleType: "schema",
          schemaConfig: {
            api: "/api/course/course",
            schema: {
              type: "object",
              properties: {
                courseId: {
                  type: "string",
                  label: "课程ID",
                  tableOption: { width: 100 },
                  editFormOption: { componentType: "input", disabled: true },
                  detailPanelOption: {},
                },
                courseName: {
                  type: "string",
                  label: "课程名称",
                  minLength: 2,
                  maxLength: 50,
                  tableOption: { width: 240 },
                  searchOption: {
                    componentType: "input",
                    default: "",
                    placeholder: "请输入课程名称",
                    allowClear: true,
                  },
                  createFormOption: { componentType: "input" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                categoryId: {
                  type: "string",
                  label: "课程分类",
                  tableOption: { width: 120, enumList: courseCategoryEnumList },
                  searchOption: {
                    componentType: "dynamicSelect",
                    default: "",
                    api: "/api/course/courseCategoryEnum/list",
                    placeholder: "全部分类",
                  },
                  createFormOption: {
                    componentType: "select",
                    default: "",
                    enumList: courseCategoryEnumList,
                  },
                  editFormOption: {
                    componentType: "select",
                    enumList: courseCategoryEnumList,
                  },
                  detailPanelOption: {},
                },
                teacherId: {
                  type: "string",
                  label: "讲师",
                  tableOption: { width: 110, enumList: teacherEnumList },
                  searchOption: {
                    componentType: "dynamicSelect",
                    default: "",
                    api: "/api/course/teacherEnum/list",
                    placeholder: "全部讲师",
                  },
                  createFormOption: {
                    componentType: "select",
                    default: "",
                    enumList: teacherEnumList,
                  },
                  editFormOption: { componentType: "select", enumList: teacherEnumList },
                  detailPanelOption: {},
                },
                price: {
                  type: "number",
                  label: "价格",
                  minimum: 0,
                  maximum: 10000,
                  tableOption: { width: 110, toFixed: 2 },
                  searchOption: {
                    componentType: "numberRange",
                    default: [],
                    placeholder: ["最低价", "最高价"],
                  },
                  createFormOption: { componentType: "inputNumber", default: 0 },
                  editFormOption: { componentType: "inputNumber" },
                  detailPanelOption: {},
                },
                lessonCount: {
                  type: "number",
                  label: "课时数",
                  minimum: 0,
                  tableOption: { width: 100 },
                  createFormOption: { componentType: "inputNumber", default: 0 },
                  editFormOption: { componentType: "inputNumber" },
                  detailPanelOption: {},
                },
                difficulty: {
                  type: "string",
                  label: "难度",
                  tableOption: { width: 90, enumList: DIFFICULTY_ENUM },
                  searchOption: { componentType: "select", default: "", enumList: DIFFICULTY_ENUM },
                  createFormOption: {
                    componentType: "radioGroup",
                    default: "beginner",
                    enumList: DIFFICULTY_ENUM,
                  },
                  editFormOption: { componentType: "radioGroup", enumList: DIFFICULTY_ENUM },
                  detailPanelOption: {},
                },
                status: {
                  type: "string",
                  label: "上架状态",
                  tableOption: { width: 100, enumList: COURSE_STATUS_ENUM },
                  searchOption: { componentType: "select", default: "", enumList: COURSE_STATUS_ENUM },
                  createFormOption: {
                    componentType: "select",
                    default: "draft",
                    enumList: COURSE_STATUS_ENUM,
                  },
                  editFormOption: { componentType: "select", enumList: COURSE_STATUS_ENUM },
                  detailPanelOption: {},
                },
                description: {
                  type: "string",
                  label: "课程简介",
                  maxLength: 200,
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
              required: ["courseName"],
            },
            tableConfig: {
              headerButtons: [
                {
                  label: "新增课程",
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
                patchButton("上架", "published", "status", "draft"),
                patchButton("下架", "offline", "status", "published"),
                {
                  label: "删除",
                  eventKey: "delete",
                  type: "danger",
                  eventOption: { params: { courseId: "schema::courseId" } },
                },
              ],
              componentConfig: {
                createForm: { title: "新增课程", saveBtnText: "新增课程" },
                editForm: { mainKey: "courseId", title: "修改课程", saveBtnText: "保存修改" },
                detailPanel: { mainKey: "courseId", title: "课程详情" },
              },
            },
          },
        },
        {
          key: "chapter",
          name: "章节管理",
          menuType: "module",
          moduleType: "schema",
          schemaConfig: {
            api: "/api/course/chapter",
            schema: {
              type: "object",
              properties: {
                chapterId: {
                  type: "string",
                  label: "章节ID",
                  tableOption: { width: 110 },
                  editFormOption: { componentType: "input", disabled: true },
                  detailPanelOption: {},
                },
                chapterName: {
                  type: "string",
                  label: "章节名称",
                  minLength: 2,
                  maxLength: 50,
                  tableOption: { width: 240 },
                  searchOption: {
                    componentType: "input",
                    default: "",
                    placeholder: "请输入章节名称",
                  },
                  createFormOption: { componentType: "input" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                courseId: {
                  type: "string",
                  label: "所属课程",
                  tableOption: { width: 110 },
                  searchOption: {
                    componentType: "dynamicSelect",
                    default: "",
                    api: "/api/course/courseEnum/list",
                    placeholder: "全部课程",
                  },
                  createFormOption: {
                    componentType: "dynamicSelect",
                    default: "",
                    api: "/api/course/courseEnum/list",
                    placeholder: "请选择所属课程",
                  },
                  editFormOption: {
                    componentType: "dynamicSelect",
                    api: "/api/course/courseEnum/list",
                  },
                  detailPanelOption: {},
                },
                sort: {
                  type: "number",
                  label: "排序",
                  minimum: 0,
                  tableOption: { width: 90 },
                  createFormOption: { componentType: "inputNumber", default: 1 },
                  editFormOption: { componentType: "inputNumber" },
                  detailPanelOption: {},
                },
                duration: {
                  type: "number",
                  label: "时长(分钟)",
                  minimum: 0,
                  tableOption: { width: 120 },
                  createFormOption: { componentType: "inputNumber", default: 30 },
                  editFormOption: { componentType: "inputNumber" },
                  detailPanelOption: {},
                },
                freePreview: {
                  type: "string",
                  label: "免费试看",
                  tableOption: {
                    width: 110,
                    enumList: [
                      { label: "是", value: "1" },
                      { label: "否", value: "0" },
                    ],
                  },
                  searchOption: {
                    componentType: "select",
                    default: "",
                    enumList: [
                      { label: "是", value: "1" },
                      { label: "否", value: "0" },
                    ],
                  },
                  createFormOption: { componentType: "switch", default: "0" },
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
              required: ["chapterName"],
            },
            tableConfig: {
              headerButtons: [
                {
                  label: "新增章节",
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
                  eventOption: { params: { chapterId: "schema::chapterId" } },
                },
              ],
              componentConfig: {
                createForm: { title: "新增章节", saveBtnText: "新增章节" },
                editForm: { mainKey: "chapterId", title: "修改章节", saveBtnText: "保存修改" },
                detailPanel: { mainKey: "chapterId", title: "章节详情" },
              },
            },
          },
        },
        {
          key: "courseCategory",
          name: "课程分类",
          menuType: "module",
          moduleType: "schema",
          schemaConfig: {
            api: "/api/course/courseCategory",
            schema: {
              type: "object",
              properties: {
                categoryId: {
                  type: "string",
                  label: "分类ID",
                  tableOption: { width: 110 },
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
      key: "learn-group",
      name: "学习中心",
      menuType: "group",
      subMenu: [
        {
          key: "lesson",
          name: "课时管理",
          menuType: "module",
          moduleType: "schema",
          schemaConfig: {
            api: "/api/course/lesson",
            schema: {
              type: "object",
              properties: {
                lessonId: {
                  type: "string",
                  label: "课时ID",
                  tableOption: { width: 110 },
                  editFormOption: { componentType: "input", disabled: true },
                  detailPanelOption: {},
                },
                lessonName: {
                  type: "string",
                  label: "课时名称",
                  minLength: 2,
                  maxLength: 50,
                  tableOption: { width: 240 },
                  searchOption: { componentType: "input", default: "", placeholder: "请输入课时名称" },
                  createFormOption: { componentType: "input" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                chapterId: {
                  type: "string",
                  label: "所属章节",
                  tableOption: { width: 110 },
                  searchOption: {
                    componentType: "dynamicSelect",
                    default: "",
                    api: "/api/course/chapterEnum/list",
                    placeholder: "全部章节",
                  },
                  createFormOption: {
                    componentType: "dynamicSelect",
                    default: "",
                    api: "/api/course/chapterEnum/list",
                    placeholder: "请选择所属章节",
                  },
                  editFormOption: {
                    componentType: "dynamicSelect",
                    api: "/api/course/chapterEnum/list",
                  },
                  detailPanelOption: {},
                },
                videoUrl: {
                  type: "string",
                  label: "视频地址",
                  tableOption: { width: 240, ellipsis: true, tooltip: true },
                  createFormOption: { componentType: "input", placeholder: "mp4 / m3u8 地址" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                duration: {
                  type: "number",
                  label: "时长(分钟)",
                  minimum: 0,
                  tableOption: { width: 120 },
                  createFormOption: { componentType: "inputNumber", default: 10 },
                  editFormOption: { componentType: "inputNumber" },
                  detailPanelOption: {},
                },
                sort: {
                  type: "number",
                  label: "排序",
                  minimum: 0,
                  tableOption: { width: 90 },
                  createFormOption: { componentType: "inputNumber", default: 1 },
                  editFormOption: { componentType: "inputNumber" },
                  detailPanelOption: {},
                },
                createTime: {
                  type: "string",
                  label: "创建时间",
                  tableOption: { width: 180 },
                  detailPanelOption: {},
                },
              },
              required: ["lessonName"],
            },
            tableConfig: {
              headerButtons: [
                {
                  label: "新增课时",
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
                  eventOption: { params: { lessonId: "schema::lessonId" } },
                },
              ],
              componentConfig: {
                createForm: { title: "新增课时", saveBtnText: "新增课时" },
                editForm: { mainKey: "lessonId", title: "修改课时", saveBtnText: "保存修改" },
                detailPanel: { mainKey: "lessonId", title: "课时详情" },
              },
            },
          },
        },
        {
          key: "teacher",
          name: "讲师管理",
          menuType: "module",
          moduleType: "schema",
          schemaConfig: {
            api: "/api/course/teacher",
            schema: {
              type: "object",
              properties: {
                teacherId: {
                  type: "string",
                  label: "讲师ID",
                  tableOption: { width: 100 },
                  editFormOption: { componentType: "input", disabled: true },
                  detailPanelOption: {},
                },
                teacherName: {
                  type: "string",
                  label: "姓名",
                  minLength: 2,
                  maxLength: 20,
                  tableOption: { width: 130 },
                  searchOption: { componentType: "input", default: "", placeholder: "请输入讲师姓名" },
                  createFormOption: { componentType: "input" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                title: {
                  type: "string",
                  label: "头衔",
                  maxLength: 30,
                  tableOption: { width: 160 },
                  createFormOption: { componentType: "input" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                rating: {
                  type: "number",
                  label: "评分",
                  minimum: 0,
                  maximum: 5,
                  tableOption: { width: 100, toFixed: 1 },
                  createFormOption: { componentType: "rate", default: 5 },
                  editFormOption: { componentType: "rate" },
                  detailPanelOption: {},
                },
                avatarUrl: {
                  type: "string",
                  label: "头像地址",
                  tableOption: { width: 200, ellipsis: true, tooltip: true, visible: false },
                  createFormOption: { componentType: "input", placeholder: "https:// 开头的图片地址" },
                  editFormOption: { componentType: "input" },
                  detailPanelOption: {},
                },
                description: {
                  type: "string",
                  label: "讲师简介",
                  maxLength: 200,
                  createFormOption: { componentType: "textarea" },
                  editFormOption: { componentType: "textarea" },
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
              required: ["teacherName"],
            },
            tableConfig: {
              headerButtons: [
                {
                  label: "新增讲师",
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
                  eventOption: { params: { teacherId: "schema::teacherId" } },
                },
              ],
              componentConfig: {
                createForm: { title: "新增讲师", saveBtnText: "新增讲师" },
                editForm: { mainKey: "teacherId", title: "修改讲师", saveBtnText: "保存修改" },
                detailPanel: { mainKey: "teacherId", title: "讲师详情" },
              },
            },
          },
        },
        {
          key: "student",
          name: "学员管理",
          menuType: "module",
          moduleType: "schema",
          schemaConfig: {
            api: "/api/course/student",
            schema: {
              type: "object",
              properties: {
                studentId: {
                  type: "string",
                  label: "学员ID",
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
                source: {
                  type: "string",
                  label: "来源渠道",
                  tableOption: {
                    width: 110,
                    enumList: [
                      { label: "App", value: "app" },
                      { label: "微信", value: "wechat" },
                      { label: "网页", value: "web" },
                    ],
                  },
                  searchOption: {
                    componentType: "select",
                    default: "",
                    enumList: [
                      { label: "App", value: "app" },
                      { label: "微信", value: "wechat" },
                      { label: "网页", value: "web" },
                    ],
                  },
                  createFormOption: {
                    componentType: "select",
                    default: "app",
                    enumList: [
                      { label: "App", value: "app" },
                      { label: "微信", value: "wechat" },
                      { label: "网页", value: "web" },
                    ],
                  },
                  editFormOption: {
                    componentType: "select",
                    enumList: [
                      { label: "App", value: "app" },
                      { label: "微信", value: "wechat" },
                      { label: "网页", value: "web" },
                    ],
                  },
                  detailPanelOption: {},
                },
                courseCount: {
                  type: "number",
                  label: "已报课程",
                  minimum: 0,
                  tableOption: { width: 110 },
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
                  eventOption: { params: { studentId: "schema::studentId" } },
                },
              ],
              componentConfig: {
                editForm: { mainKey: "studentId", title: "修改学员", saveBtnText: "保存修改" },
                detailPanel: { mainKey: "studentId", title: "学员详情" },
              },
            },
          },
        },
      ],
    },
    {
      key: "courseOrder",
      name: "课程订单",
      menuType: "module",
      moduleType: "schema",
      schemaConfig: {
        api: "/api/course/courseOrder",
        schema: {
          type: "object",
          properties: {
            courseOrderId: {
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
            studentName: {
              type: "string",
              label: "学员",
              tableOption: { width: 120 },
              searchOption: { componentType: "input", default: "", placeholder: "请输入学员昵称" },
              detailPanelOption: {},
            },
            courseName: {
              type: "string",
              label: "课程",
              tableOption: { width: 240 },
              detailPanelOption: {},
            },
            amount: {
              type: "number",
              label: "实付金额",
              tableOption: { width: 120, toFixed: 2 },
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
                  { label: "已支付", value: "paid" },
                  { label: "退款中", value: "refunding" },
                  { label: "已退款", value: "refunded" },
                ],
              },
              searchOption: {
                componentType: "select",
                default: "",
                enumList: [
                  { label: "已支付", value: "paid" },
                  { label: "退款中", value: "refunding" },
                  { label: "已退款", value: "refunded" },
                ],
              },
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
          rowButtons: [
            {
              label: "查看",
              eventKey: "showComponent",
              type: "primary",
              eventOption: { comName: "detailPanel" },
            },
            patchButton("退款中", "refunding", "status", "paid"),
            patchButton("同意退款", "refunded", "status", "refunding"),
            {
              label: "删除",
              eventKey: "delete",
              type: "danger",
              eventOption: { params: { courseOrderId: "schema::courseOrderId" } },
            },
          ],
          componentConfig: {
            detailPanel: { mainKey: "courseOrderId", title: "订单详情" },
          },
        },
      },
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
            name: "学习分析",
            menuType: "module",
            moduleType: "custom",
            customConfig: { path: "/course/analysis" },
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
