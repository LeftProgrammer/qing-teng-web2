import { defineFakeRoute } from "vite-plugin-fake-server/client";
import { faker } from "@faker-js/faker/locale/zh_CN";

const levels = ["A", "B", "C", "D"];
const genders = ["男", "女"];
const agents = ["张三", "李四", "王五", "赵六", "陈七"];
const illnesses = [
  "高血压",
  "糖尿病",
  "冠心病",
  "颈椎病",
  "腰椎间盘突出",
  "关节炎",
  "失眠",
  "胃炎"
];
const products = ["保健品A", "保健品B", "营养套餐", "理疗仪器", "健康检测套餐"];

function generateCustomers(count = 100) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: faker.person.fullName(),
    level: levels[Math.floor(Math.random() * levels.length)],
    gender: genders[Math.floor(Math.random() * genders.length)],
    phone1: faker.phone.number("1##########"),
    phone2: Math.random() > 0.5 ? faker.phone.number("1##########") : "",
    phone3: Math.random() > 0.7 ? faker.phone.number("1##########") : "",
    address: faker.location.streetAddress(true),
    agent: agents[Math.floor(Math.random() * agents.length)],
    illness: illnesses[Math.floor(Math.random() * illnesses.length)],
    consultProduct: products[Math.floor(Math.random() * products.length)],
    nextContactAt: faker.date.future().toISOString(),
    remark: Math.random() > 0.5 ? faker.lorem.sentence() : "",
    createdAt: faker.date.past().toISOString()
  }));
}

const customerList = generateCustomers(100);

export default defineFakeRoute([
  {
    url: "/customer/list",
    method: "get",
    response: ({ query }) => {
      const { name, level, agent, currentPage = 1, pageSize = 10 } = query;
      let list = [...customerList];

      if (name) {
        list = list.filter(item =>
          item.name.toLowerCase().includes(name.toLowerCase())
        );
      }
      if (level) {
        list = list.filter(item => item.level === level);
      }
      if (agent) {
        list = list.filter(item =>
          item.agent.toLowerCase().includes(agent.toLowerCase())
        );
      }

      const total = list.length;
      const start = (Number(currentPage) - 1) * Number(pageSize);
      const end = start + Number(pageSize);

      return {
        code: 0,
        message: "操作成功",
        data: {
          list: list.slice(start, end),
          total,
          pageSize: Number(pageSize),
          currentPage: Number(currentPage)
        }
      };
    }
  },
  {
    url: "/customer/create",
    method: "post",
    response: ({ body }) => {
      customerList.unshift({
        id: customerList.length + 1,
        ...body,
        createdAt: new Date().toISOString()
      });
      return { code: 0, message: "操作成功" };
    }
  },
  {
    url: "/customer/update",
    method: "put",
    response: ({ body }) => {
      const index = customerList.findIndex(item => item.id === body.id);
      if (index !== -1) {
        customerList[index] = { ...customerList[index], ...body };
      }
      return { code: 0, message: "操作成功" };
    }
  },
  {
    url: "/customer/delete",
    method: "delete",
    response: ({ body }) => {
      const index = customerList.findIndex(item => item.id === body.id);
      if (index !== -1) {
        customerList.splice(index, 1);
      }
      return { code: 0, message: "操作成功" };
    }
  }
]);
