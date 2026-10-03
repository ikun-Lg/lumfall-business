// 种子数据：电商 + 课程两个业务域的全量 mock。
// 用固定种子生成，重启服务数据不变（日内/重启稳定，便于演示与测试）。

// 确定性伪随机（mulberry32），保证每次启动生成的数据完全一致
function createRandom(seed) {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pad = (num, len) => String(num).padStart(len, "0");

const formatTime = (date) => {
  const iso = new Date(date).toISOString();
  return `${iso.slice(0, 10)} ${iso.slice(11, 19)}`;
};

// 从当前时间往回推 count 天内随机取一个时刻
const randomPastTime = (random, days, index) => {
  const offset =
    Math.floor(random() * days * 24 * 3600 * 1000) + (index % 24) * 3600000;
  return formatTime(Date.now() - offset);
};

// ===== 公共名字池 =====
const CUSTOMER_NAMES = [
  "李思远", "王小雅", "张启航", "陈雨桐", "刘子墨", "杨若曦", "赵一鸣", "黄嘉树",
  "周芷若", "吴桐语", "徐清风", "孙明月", "马思聪", "朱砚秋", "胡杨林", "郭静云",
  "林晚晴", "何秋实", "高远航", "罗云熙", "郑星野", "梁书瑶", "谢东篱", "宋清欢",
  "唐子衿", "韩江雪", "冯若谷", "于归晚", "董晓棠", "萧北辰", "程知夏", "袁初晴",
];

const BRANDS = ["华为", "小米", "苹果", "美的", "海尔", "优衣库", "耐克", "索尼", "三只松鼠", "戴森"];

// 电商商品分类（12 类，与 DSL schema 的 enumList 保持一致）
const PRODUCT_CATEGORIES = [
  "手机数码", "电脑办公", "家用电器", "服饰内衣", "鞋靴箱包", "美妆个护",
  "食品生鲜", "酒水饮料", "家居家装", "母婴玩具", "运动户外", "图书文娱",
];

// 课程分类（8 类，与 DSL schema 的 enumList 保持一致）
const COURSE_CATEGORIES = [
  "前端开发", "后端开发", "移动开发", "人工智能", "产品设计", "运营增长",
  "职场技能", "兴趣生活",
];

const TEACHER_NAMES = [
  "陈立群", "苏晚晴", "周子航", "林清越", "陆展鹏", "许南嘉",
  "沈书白", "顾北辰", "孟星河", "秦朗月",
];

const TEACHER_TITLES = [
  "高级前端工程师", "架构师", "全栈技术专家", "AI 算法工程师", "资深产品总监",
  "增长负责人", "职业规划师", "数据分析专家", "设计总监", "独立开发者",
];

const PAY_TYPES = [
  { label: "微信支付", value: "wechat" },
  { label: "支付宝", value: "alipay" },
  { label: "云闪付", value: "unionpay" },
];

function buildCommerce() {
  const random = createRandom(20261003);
  const pick = (list) => list[Math.floor(random() * list.length)];
  const round2 = (num) => Math.round(num * 100) / 100;

  // ── 商品分类 ──
  const category = PRODUCT_CATEGORIES.map((name, i) => ({
    categoryId: `C${pad(i + 1, 3)}`,
    categoryName: name,
    categoryCode: `CAT${pad(i + 1, 3)}`,
    sort: i + 1,
    status: i === 11 ? "0" : "1", // 最后一类演示「停用」
    description: `${name}类目的官方维护分类`,
    createTime: randomPastTime(random, 90, i),
  }));

  // ── 商品 ──
  const product = Array.from({ length: 86 }, (_, i) => {
    const categoryId = `C${pad((i % 12) + 1, 3)}`;
    const price = round2(19.9 + random() * 4580);
    return {
      productId: `P${pad(i + 1, 6)}`,
      productName: `${pick(BRANDS)} ${PRODUCT_CATEGORIES[i % 12]}精选款 ${i + 1} 号`,
      categoryId,
      brand: pick(BRANDS),
      price,
      sales: Math.floor(random() * 3200),
      inventory: Math.floor(random() * 4200),
      status: i % 7 === 0 ? "0" : "1",
      description: `${PRODUCT_CATEGORIES[i % 12]}类目热销商品，支持七天无理由退换，全国联保。`,
      createTime: randomPastTime(random, 90, i),
    };
  });

  // ── 订单 ──
  const order = Array.from({ length: 216 }, (_, i) => {
    const dayOffset = Math.floor(random() * 30);
    const statusPool = dayOffset < 2 ? ["pending", "paid"] : ["paid", "shipped", "completed", "canceled"];
    return {
      orderId: `O${pad(i + 1, 6)}`,
      orderNo: `SO${dayOffset}${pad(10000 + i, 5)}`,
      customerName: pick(CUSTOMER_NAMES),
      productCount: 1 + Math.floor(random() * 5),
      totalAmount: round2(39 + random() * 2860),
      payType: pick(PAY_TYPES).value,
      status: pick(statusPool),
      remark: random() > 0.7 ? "请在工作时间送达" : "",
      createTime: formatTime(Date.now() - dayOffset * 86400000 - Math.floor(random() * 86400000)),
    };
  });

  // ── 退款 ──
  const refund = Array.from({ length: 34 }, (_, i) => {
    const orderRow = order[Math.floor(random() * order.length)];
    return {
      refundId: `R${pad(i + 1, 5)}`,
      refundNo: `RF${pad(20000 + i, 6)}`,
      orderId: orderRow.orderId,
      customerName: orderRow.customerName,
      amount: round2(orderRow.totalAmount * (0.3 + random() * 0.7)),
      reason: pick([
        "七天无理由退货", "商品与描述不符", "物流破损", "质量问题", "不想要了", "尺码不合适",
      ]),
      status: pick(["waiting", "approved", "rejected"]),
      applyTime: randomPastTime(random, 20, i),
    };
  });

  // ── 会员 ──
  const customer = Array.from({ length: 64 }, (_, i) => ({
    customerId: `M${pad(i + 1, 5)}`,
    nickname: pick(CUSTOMER_NAMES),
    phone: `13${pad(Math.floor(random() * 100000000), 8)}`,
    level: pick(["normal", "silver", "gold", "platinum", "diamond"]),
    points: Math.floor(random() * 12000),
    balance: round2(random() * 2600),
    status: i % 9 === 0 ? "0" : "1",
    createTime: randomPastTime(random, 180, i),
  }));

  // ── 系统用户（登录账号在 app/service/auth.js，此处为可管理的用户列表）──
  const user = Array.from({ length: 10 }, (_, i) => ({
    userId: `U${pad(i + 1, 4)}`,
    userName: i === 0 ? "admin" : `user${i}`,
    nickname: i === 0 ? "管理员" : `运营专员${i}`,
    role: i === 0 ? "admin" : "user",
    status: i === 3 ? "0" : "1",
    createTime: randomPastTime(random, 200, i),
  }));

  // ── 优惠券 ──
  const coupon = Array.from({ length: 18 }, (_, i) => {
    const isDiscount = i % 3 === 1;
    const start = Date.now() - Math.floor(random() * 10) * 86400000;
    return {
      couponId: `CP${pad(i + 1, 4)}`,
      couponName: isDiscount
        ? `${pick(["9", "8.5", "7.5", "8"])} 折品类券`
        : `满 ${100 + i * 50} 减 ${20 + i * 5} 券`,
      couponType: isDiscount ? "discount" : "reduce",
      threshold: isDiscount ? 0 : 100 + i * 50,
      amount: isDiscount ? 0 : 20 + i * 5,
      validStart: formatTime(start),
      validEnd: formatTime(start + 30 * 86400000),
      status: i % 5 === 0 ? "0" : "1",
      description: "仅限普通商品使用，不与其它优惠叠加，最终解释权归平台所有。",
      createTime: randomPastTime(random, 60, i),
    };
  });

  // ── 轮播图 ──
  const banner = Array.from({ length: 8 }, (_, i) => ({
    bannerId: `B${pad(i + 1, 3)}`,
    title: pick(["双 11 预热主会场", "新品首发专场", "会员日 5 折起", "家电以旧换新", "超级秒杀日", "年中大促", "夏日清凉节", "年终盛典"]),
    imageUrl: `https://dummyimage.com/750x300/165dff/ffffff&text=Banner+${i + 1}`,
    linkUrl: `/view/admin/schema/product?projectKey=admin`,
    sort: i + 1,
    status: i % 4 === 0 ? "0" : "1",
    remark: "首页第二屏轮播位，每日 09:00 更新",
    createTime: randomPastTime(random, 45, i),
  }));

  return { category, product, order, refund, customer, user, coupon, banner };
}

function buildCourse() {
  const random = createRandom(20261004);
  const pick = (list) => list[Math.floor(random() * list.length)];
  const round2 = (num) => Math.round(num * 100) / 100;

  // ── 课程分类 ──
  const courseCategory = COURSE_CATEGORIES.map((name, i) => ({
    categoryId: `CC${pad(i + 1, 3)}`,
    categoryName: name,
    sort: i + 1,
    status: "1",
    description: `${name}方向课程分类`,
    createTime: randomPastTime(random, 120, i),
  }));

  // ── 讲师 ──
  const teacher = TEACHER_NAMES.map((name, i) => ({
    teacherId: `T${pad(i + 1, 3)}`,
    teacherName: name,
    title: TEACHER_TITLES[i],
    description: `${name}，${TEACHER_TITLES[i]}，10 年+ 一线实战经验，累计带教超过 3 万名学员。`,
    avatarUrl: `https://dummyimage.com/120x120/14c9c9/ffffff&text=${encodeURIComponent(name.slice(0, 1))}`,
    rating: round2(4.2 + random() * 0.8),
    status: i === 9 ? "0" : "1",
    createTime: randomPastTime(random, 200, i),
  }));

  // ── 课程 ──
  const courseNamePools = {
    前端开发: ["Vue3 从入门到实战", "React 18 企业级项目实战", "TypeScript 核心进阶", "Webpack / Vite 构建优化"],
    后端开发: ["Node.js 全栈开发实战", "Go 语言高并发编程", "MySQL 索引与调优", "分布式系统设计"],
    移动开发: ["Flutter 跨端开发实战", "iOS Swift 进阶", "Android Compose 实战"],
    人工智能: ["大模型应用开发实战", "机器学习入门到进阶", "Stable Diffusion 实战"],
    产品设计: ["B 端产品设计方法论", "Figma 高效原型", "用户增长设计"],
    运营增长: ["私域流量运营实战", "内容营销方法论", "数据驱动增长"],
    职场技能: ["管理者沟通训练营", "结构化写作", "时间管理系统课"],
    兴趣生活: ["手机摄影进阶", "咖啡冲煮入门", "无人机航拍实战"],
  };
  const course = [];
  let courseIndex = 0;
  for (const [catName, names] of Object.entries(courseNamePools)) {
    for (const name of names) {
      courseIndex += 1;
      const lessonCount = 18 + Math.floor(random() * 60);
      course.push({
        courseId: `CS${pad(courseIndex, 3)}`,
        courseName: `${name}（${new Date().getFullYear()} 版）`,
        categoryId: `CC${pad(COURSE_CATEGORIES.indexOf(catName) + 1, 3)}`,
        teacherId: `T${pad(1 + (courseIndex % 9), 3)}`,
        price: round2(99 + random() * 900),
        lessonCount,
        difficulty: pick(["beginner", "intermediate", "advanced"]),
        status: pick(["draft", "published", "published", "offline"]),
        description: `${name}：体系化知识图谱 + 真实项目实战 + 一对一答疑，助你完成能力跃迁。`,
        createTime: randomPastTime(random, 120, courseIndex),
      });
    }
  }

  // ── 章节 ──
  const chapter = [];
  let chapterIndex = 0;
  for (const courseRow of course) {
    const chapterCount = 3 + Math.floor(random() * 4);
    for (let n = 1; n <= chapterCount; n += 1) {
      chapterIndex += 1;
      chapter.push({
        chapterId: `CH${pad(chapterIndex, 4)}`,
        chapterName: `第 ${n} 章 ${pick(["基础概念与上手", "核心原理剖析", "项目实战演练", "进阶技巧与优化", "面试高频考点"])}`,
        courseId: courseRow.courseId,
        sort: n,
        duration: 25 + Math.floor(random() * 60),
        freePreview: n === 1 ? "1" : "0",
        status: "1",
        createTime: courseRow.createTime,
      });
    }
  }

  // ── 课时 ──
  const lesson = [];
  let lessonIndex = 0;
  for (const chapterRow of chapter) {
    const lessonCount = 2 + Math.floor(random() * 3);
    for (let n = 1; n <= lessonCount; n += 1) {
      lessonIndex += 1;
      lesson.push({
        lessonId: `LS${pad(lessonIndex, 5)}`,
        lessonName: `${chapterRow.chapterName.slice(0, 4)} ${n}-${pick(["环境搭建", "核心概念", "动手实操", "常见问题排查", "综合案例"])}`,
        chapterId: chapterRow.chapterId,
        videoUrl: `https://cdn.lumfall.dev/course/${chapterRow.chapterId}/${pad(n, 2)}.mp4`,
        duration: 8 + Math.floor(random() * 40),
        sort: n,
        createTime: chapterRow.createTime,
      });
    }
  }

  // ── 学员 ──
  const student = Array.from({ length: 72 }, (_, i) => ({
    studentId: `S${pad(i + 1, 5)}`,
    nickname: pick(CUSTOMER_NAMES),
    phone: `15${pad(Math.floor(random() * 100000000), 8)}`,
    source: pick(["app", "wechat", "web"]),
    courseCount: Math.floor(random() * 8),
    status: i % 11 === 0 ? "0" : "1",
    createTime: randomPastTime(random, 180, i),
  }));

  // ── 课程订单 ──
  const courseOrder = Array.from({ length: 148 }, (_, i) => {
    const courseRow = course[Math.floor(random() * course.length)];
    const studentRow = student[Math.floor(random() * student.length)];
    const dayOffset = Math.floor(random() * 30);
    return {
      courseOrderId: `CO${pad(i + 1, 6)}`,
      orderNo: `EDU${dayOffset}${pad(20000 + i, 5)}`,
      studentName: studentRow.nickname,
      courseName: courseRow.courseName,
      amount: courseRow.price,
      payType: pick(PAY_TYPES).value,
      status: pick(["paid", "paid", "refunding", "refunded"]),
      createTime: formatTime(Date.now() - dayOffset * 86400000 - Math.floor(random() * 86400000)),
    };
  });

  return { courseCategory, teacher, course, chapter, lesson, student, courseOrder };
}

function buildSeedData() {
  return { ...buildCommerce(), ...buildCourse() };
}

// ===== DSL 共享枚举（单一事实来源：model/*.js 的 schema enumList 引用这里，
// 保证表格标签 / 搜索选项与 seed 数据永远一致）=====
const pad3 = (num) => pad(num, 3);

const productCategoryEnumList = PRODUCT_CATEGORIES.map((name, i) => ({
  label: name,
  value: `C${pad3(i + 1)}`,
}));

const brandEnumList = BRANDS.map((name) => ({ label: name, value: name }));

const payTypeEnumList = PAY_TYPES.map(({ label, value }) => ({ label, value }));

const courseCategoryEnumList = COURSE_CATEGORIES.map((name, i) => ({
  label: name,
  value: `CC${pad3(i + 1)}`,
}));

const teacherEnumList = TEACHER_NAMES.map((name, i) => ({
  label: name,
  value: `T${pad3(i + 1)}`,
}));

module.exports = {
  buildSeedData,
  productCategoryEnumList,
  brandEnumList,
  payTypeEnumList,
  courseCategoryEnumList,
  teacherEnumList,
};
