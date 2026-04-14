import { PrismaClient } from '@prisma/client';
import { subDays, addHours } from 'date-fns';

const prisma = new PrismaClient();

const cities = ['北京', '上海', '深圳'];

const routes: Record<string, string[]> = {
  北京: ['中关村-国贸', '北京南站-天安门', '望京-三里屯', '回龙观-上地', '亦庄-大兴机场'],
  上海: ['陆家嘴-人民广场', '虹桥机场-静安寺', '张江-徐汇滨江', '浦东机场-世博园', '五角场-外滩'],
  深圳: ['南山科技园-福田中心区', '宝安机场-龙华', '坪山-深圳北站', '蛇口-罗湖', '光明-龙岗'],
};

const categories = ['行驶体验', '车内环境', '接驾体验', '路线规划', '安全感受', '其他'];

const feedbackTemplates = [
  // 行驶体验 - positive
  { text: '驾驶非常平稳，比很多人类司机开得还要稳，路上几乎感觉不到颠簸，体验非常棒！', category: '行驶体验', sentiment: 'positive', rating: 5 },
  { text: '加减速非常线性，没有任何顿挫感，坐着非常舒适，已经是我每天上班的首选交通工具。', category: '行驶体验', sentiment: 'positive', rating: 5 },
  { text: '转弯非常流畅，提前减速，整个过程丝滑，比我自己开车还舒服。', category: '行驶体验', sentiment: 'positive', rating: 5 },
  { text: '整体驾驶体验不错，行驶比较平稳，就是偶尔遇到减速带时处理稍微有些颠。', category: '行驶体验', sentiment: 'positive', rating: 4 },
  { text: '加速时有轻微顿挫，不过总体还算平稳，继续优化会更好。', category: '行驶体验', sentiment: 'neutral', rating: 3 },
  { text: '行驶途中突然急刹车，我手上的咖啡直接洒了，座位上都是，体验非常差。', category: '行驶体验', sentiment: 'negative', rating: 1 },
  { text: '在高架桥上变道太突然，完全没有提前预警，把我吓了一跳，心跳都加速了。', category: '行驶体验', sentiment: 'negative', rating: 2 },
  { text: '起步时抖动明显，感觉系统还在适应，不是很舒适。', category: '行驶体验', sentiment: 'negative', rating: 2 },
  { text: '驾驶风格偏保守，但整体平稳，适合老年人乘坐。', category: '行驶体验', sentiment: 'neutral', rating: 3 },
  { text: '全程非常稳，我在车上处理工作文件都没问题，期待继续改进。', category: '行驶体验', sentiment: 'positive', rating: 4 },

  // 车内环境 - mixed
  { text: '车内非常整洁，座椅干净，空调温度刚好，整体环境很舒适。', category: '车内环境', sentiment: 'positive', rating: 5 },
  { text: '车内有淡淡的清香，座椅很干净，乘坐体验和高档专车一样。', category: '车内环境', sentiment: 'positive', rating: 5 },
  { text: '车内温度适宜，清洁度很高，没有异味，很舒适。', category: '车内环境', sentiment: 'positive', rating: 4 },
  { text: '车内有轻微异味，不知道是什么味道，有点影响乘坐体验。', category: '车内环境', sentiment: 'negative', rating: 2 },
  { text: '座椅有些脏，感觉上一位乘客留下了污渍，建议加强清洁管理。', category: '车内环境', sentiment: 'negative', rating: 2 },
  { text: '空调太冷了，我一直在车里瑟瑟发抖，希望能调节温度。', category: '车内环境', sentiment: 'negative', rating: 2 },
  { text: '后排空间宽裕，腿部空间够大，作为一个180cm的人坐着很舒服。', category: '车内环境', sentiment: 'positive', rating: 5 },
  { text: '车内整洁，但空调有点噪音，不影响使用但有些干扰。', category: '车内环境', sentiment: 'neutral', rating: 3 },
  { text: '车窗有雨水痕迹，影响视线，建议定期擦拭。', category: '车内环境', sentiment: 'neutral', rating: 3 },
  { text: '车内空气质量很好，有空气净化器，适合过敏体质的乘客。', category: '车内环境', sentiment: 'positive', rating: 5 },

  // 接驾体验 - mixed
  { text: '定位非常准确，在导航指示地点直接等到了车，完全没有找车的烦恼。', category: '接驾体验', sentiment: 'positive', rating: 5 },
  { text: '上车点设置合理，就在路边明显位置，找车很方便。', category: '接驾体验', sentiment: 'positive', rating: 5 },
  { text: '等车时间只有3分钟，效率很高，明显比传统网约车快。', category: '接驾体验', sentiment: 'positive', rating: 4 },
  { text: '接驾位置设在了非常偏僻的小路，走了五分钟才找到，非常不方便。', category: '接驾体验', sentiment: 'negative', rating: 1 },
  { text: '等待时间超过15分钟，APP显示到了但实际车还没到，体验很差。', category: '接驾体验', sentiment: 'negative', rating: 1 },
  { text: '上车点在地下停车场入口，非常混乱，好不容易才找到车。', category: '接驾体验', sentiment: 'negative', rating: 2 },
  { text: '等待时间稍长，大约等了10分钟，但车到后接驾很顺利。', category: '接驾体验', sentiment: 'neutral', rating: 3 },
  { text: '上车点指引很清晰，APP内地图标注详细，一下就找到了。', category: '接驾体验', sentiment: 'positive', rating: 4 },
  { text: '雨天接驾位置距离有雨棚的地方较远，希望恶劣天气下能优化接驾点。', category: '接驾体验', sentiment: 'neutral', rating: 3 },
  { text: '下单后3分钟就到了，效率超高，服务体验很满意。', category: '接驾体验', sentiment: 'positive', rating: 5 },

  // 路线规划 - mixed
  { text: '路线规划非常智能，全程躲开了拥堵路段，比导航预估时间还快5分钟到达。', category: '路线规划', sentiment: 'positive', rating: 5 },
  { text: '选择的路线红绿灯少，行驶顺畅，比我自己规划的路线还要好。', category: '路线规划', sentiment: 'positive', rating: 5 },
  { text: '高峰期自动选择了限行区外的路线，很智能，司机都不一定想得到。', category: '路线规划', sentiment: 'positive', rating: 5 },
  { text: '感觉绕路了，明明有更近的路，不知道为什么选了那么长的路线，多花了10分钟。', category: '路线规划', sentiment: 'negative', rating: 2 },
  { text: '路线居然走了早晚高峰严重拥堵的主干道，白白堵了20分钟，不够智能。', category: '路线规划', sentiment: 'negative', rating: 1 },
  { text: '偶尔有几次感觉路线不是最优，但总体还算合理。', category: '路线规划', sentiment: 'neutral', rating: 3 },
  { text: '路线规划考虑了施工封路的情况，主动避开，体验很好。', category: '路线规划', sentiment: 'positive', rating: 4 },
  { text: '路线整体不错，就是有一段走了老小区，路比较窄，有些颠。', category: '路线规划', sentiment: 'neutral', rating: 3 },
  { text: '实时根据路况调整路线，全程都很顺畅，到达时间和预估完全一致。', category: '路线规划', sentiment: 'positive', rating: 5 },
  { text: '路线避开了学校区域，绕了一点但避开了早高峰送孩子的拥堵，挺智能的。', category: '路线规划', sentiment: 'positive', rating: 4 },

  // 安全感受 - mixed
  { text: '全程安全感很强，始终保持安全车距，变道时也很谨慎，让人放心。', category: '安全感受', sentiment: 'positive', rating: 5 },
  { text: '遇到有人横穿马路，系统反应非常迅速，提前减速，安全处置，点赞！', category: '安全感受', sentiment: 'positive', rating: 5 },
  { text: '雨天行驶速度适当降低，保持更大车距，安全意识很强。', category: '安全感受', sentiment: 'positive', rating: 5 },
  { text: '跟前车距离太近，我全程手心出汗，感觉随时要追尾，非常不安全。', category: '安全感受', sentiment: 'negative', rating: 1 },
  { text: '在快速路上强行变道，被后车鸣笛，差点发生事故，吓得我腿软。', category: '安全感受', sentiment: 'negative', rating: 1 },
  { text: '过路口时处理很保守，黄灯时完全停下，行程稍慢但更安全，可以接受。', category: '安全感受', sentiment: 'neutral', rating: 4 },
  { text: '在陌生区域行驶时，系统表现稳健，没有因为不熟悉路段就乱打方向。', category: '安全感受', sentiment: 'positive', rating: 4 },
  { text: '晚上视线不好时速度控制得当，车灯使用合理，安全感很强。', category: '安全感受', sentiment: 'positive', rating: 5 },
  { text: '碰到行人闯红灯时有些犹豫，但最终还是安全停车等待，可以的。', category: '安全感受', sentiment: 'neutral', rating: 3 },
  { text: '全程行驶规范，没有超速，没有随意变道，是一次安全的旅途。', category: '安全感受', sentiment: 'positive', rating: 5 },

  // 其他
  { text: '希望能增加车内娱乐功能，比如音乐播放或视频屏幕，长途旅行更舒适。', category: '其他', sentiment: 'neutral', rating: 3 },
  { text: 'APP界面非常直观，下单流程简单，适合各年龄段用户使用。', category: '其他', sentiment: 'positive', rating: 4 },
  { text: '计费说明不够清晰，到达后费用比预估高了不少，希望能更透明。', category: '其他', sentiment: 'negative', rating: 2 },
  { text: '发现有问题时想联系客服，但找不到入口，建议优化紧急联系功能。', category: '其他', sentiment: 'negative', rating: 2 },
  { text: '行程结束后的发票功能很好用，一键申请，很方便报销。', category: '其他', sentiment: 'positive', rating: 5 },
  { text: '车内紧急停车按钮位置明显，虽然没用到，但感觉很安心。', category: '其他', sentiment: 'positive', rating: 4 },
  { text: '希望能有多人拼车选项，可以降低费用，扩大用户群体。', category: '其他', sentiment: 'neutral', rating: 3 },
  { text: '深夜乘车感觉很安全，没有人类司机带来的不安全感，很棒！', category: '其他', sentiment: 'positive', rating: 5 },
  { text: '行李箱空间有点小，大件行李放不下，建议适配更多车型。', category: '其他', sentiment: 'neutral', rating: 3 },
  { text: '车辆外观整洁，科技感强，停在路边很吸引眼球，品牌形象很好。', category: '其他', sentiment: 'positive', rating: 4 },
];

// Additional feedback for more variety
const additionalFeedback = [
  { text: '平稳性超出预期，第一次坐自动驾驶出租车，非常惊艳，已经推荐给了所有朋友。', category: '行驶体验', sentiment: 'positive', rating: 5 },
  { text: '高速路上表现优秀，车道保持完美，超车时机判断准确。', category: '行驶体验', sentiment: 'positive', rating: 5 },
  { text: '遇到施工区域减速通过，处理得很专业，比很多老司机都强。', category: '行驶体验', sentiment: 'positive', rating: 5 },
  { text: '在拥堵路段有些走走停停，但这是路况问题，驾驶本身还算平稳。', category: '行驶体验', sentiment: 'neutral', rating: 3 },
  { text: '转弯时外摆幅度有点大，有时会感觉向外甩，需要优化。', category: '行驶体验', sentiment: 'negative', rating: 2 },
  { text: '车内有香薰功能，非常贴心，乘坐体验极佳。', category: '车内环境', sentiment: 'positive', rating: 5 },
  { text: '后座充电口是Type-C，很方便，全程可以给手机充电。', category: '车内环境', sentiment: 'positive', rating: 4 },
  { text: '车内wifi信号强，下载速度快，适合在途中处理工作。', category: '车内环境', sentiment: 'positive', rating: 5 },
  { text: '后排中间位置坐了三人有些拥挤，也许是车型问题。', category: '车内环境', sentiment: 'neutral', rating: 3 },
  { text: '上车点在地铁口，非常方便换乘，规划得很合理。', category: '接驾体验', sentiment: 'positive', rating: 5 },
  { text: '大雨天在等待区有工作人员引导，很人性化。', category: '接驾体验', sentiment: 'positive', rating: 5 },
  { text: '接驾点在大路边，但停车区标识不清晰，找了好几圈。', category: '接驾体验', sentiment: 'negative', rating: 2 },
  { text: 'APP内实时定位准确，能清晰看到车辆行进方向，很放心。', category: '接驾体验', sentiment: 'positive', rating: 4 },
  { text: '抄近路穿过老旧社区，路不好但节省了时间，挺聪明的决策。', category: '路线规划', sentiment: 'positive', rating: 4 },
  { text: '动态规避了前方事故路段，及时调整路线，没有因此耽误时间。', category: '路线规划', sentiment: 'positive', rating: 5 },
  { text: '路线有点绕，但回头看是因为避开了一个很堵的路口，可以理解。', category: '路线规划', sentiment: 'neutral', rating: 4 },
  { text: '高速路口排队时等了很久，系统应该能预判这种情况提前避开。', category: '路线规划', sentiment: 'negative', rating: 2 },
  { text: '遇到紧急情况的制动响应非常快，AEB系统可靠性很高。', category: '安全感受', sentiment: 'positive', rating: 5 },
  { text: '行人和非机动车较多的路段，系统处理得很谨慎，安全第一。', category: '安全感受', sentiment: 'positive', rating: 5 },
  { text: '隧道内光线昏暗，系统反应稍慢，有些担心，建议针对隧道优化。', category: '安全感受', sentiment: 'neutral', rating: 3 },
  { text: '恶劣天气下行驶表现不稳定，暴雨中有过一次意外急刹，希望改进。', category: '安全感受', sentiment: 'negative', rating: 2 },
  { text: '夜间行驶感觉和白天一样稳定，自动驾驶在夜间的表现让我刮目相看。', category: '安全感受', sentiment: 'positive', rating: 5 },
  { text: '积极尝试新科技，自动驾驶是未来，期待更快的商业化落地。', category: '其他', sentiment: 'positive', rating: 5 },
  { text: '价格比普通网约车稍贵，但体验好很多，物有所值。', category: '其他', sentiment: 'positive', rating: 4 },
  { text: '定价策略高峰期涨价太多，让普通用户难以承受，建议调整。', category: '其他', sentiment: 'negative', rating: 2 },
  { text: '希望开通更多城市和路线，目前覆盖范围还是太小了。', category: '其他', sentiment: 'neutral', rating: 3 },
  { text: '儿童座椅选项没有，带孩子出行不方便，建议增加相关配置。', category: '其他', sentiment: 'negative', rating: 2 },
  { text: '全程无需与司机沟通，对内向的我非常友好，这是最大的优点之一。', category: '其他', sentiment: 'positive', rating: 5 },
  { text: '系统异常时没有及时的提醒和处理，在路边等了很久不知道发生了什么。', category: '其他', sentiment: 'negative', rating: 1 },
  { text: '这次乘坐体验非常完整，从预约到到达全程流畅，继续加油！', category: '其他', sentiment: 'positive', rating: 5 },
];

const allTemplates = [...feedbackTemplates, ...additionalFeedback];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generatePassengerId(): string {
  return `P${getRandomInt(10000, 99999)}`;
}

function generateTripId(): string {
  return `T${getRandomInt(100000, 999999)}`;
}

function generateVehicleId(): string {
  return `V${getRandomInt(1000, 9999)}`;
}

async function main() {
  console.log('🚀 开始生成模拟数据...');

  // Clear existing data
  await prisma.feedback.deleteMany();
  await prisma.dailyStats.deleteMany();

  const feedbacks = [];

  // Generate 120 feedback entries
  for (let i = 0; i < 120; i++) {
    const city = getRandomElement(cities);
    const route = getRandomElement(routes[city]);
    const daysAgo = getRandomInt(0, 29);
    const tripDate = subDays(new Date(), daysAgo);
    const template = allTemplates[i % allTemplates.length];

    // Add some variation to ratings
    let rating = template.rating;
    if (Math.random() < 0.15) {
      rating = Math.max(1, Math.min(5, rating + (Math.random() > 0.5 ? 1 : -1)));
    }

    const sentiment =
      rating >= 4 ? 'positive' : rating <= 2 ? 'negative' : 'neutral';

    feedbacks.push({
      passengerId: generatePassengerId(),
      tripId: generateTripId(),
      vehicleId: generateVehicleId(),
      rating,
      feedbackText: template.text,
      category: template.category,
      route,
      city,
      tripDate: addHours(tripDate, getRandomInt(6, 22)),
      tripDuration: getRandomInt(10, 60),
      sentiment,
    });
  }

  // Insert all feedbacks
  for (const fb of feedbacks) {
    await prisma.feedback.create({ data: fb });
  }

  console.log(`✅ 已生成 ${feedbacks.length} 条反馈数据`);

  // Generate daily stats for last 30 days
  for (let d = 0; d < 30; d++) {
    const date = subDays(new Date(), d);
    date.setHours(0, 0, 0, 0);

    const dayFeedbacks = feedbacks.filter(fb => {
      const fbDate = new Date(fb.tripDate);
      return (
        fbDate.getDate() === date.getDate() &&
        fbDate.getMonth() === date.getMonth() &&
        fbDate.getFullYear() === date.getFullYear()
      );
    });

    if (dayFeedbacks.length === 0) continue;

    const totalCount = dayFeedbacks.length;
    const avgRating =
      dayFeedbacks.reduce((sum, fb) => sum + fb.rating, 0) / totalCount;
    const positiveCount = dayFeedbacks.filter(
      fb => fb.sentiment === 'positive'
    ).length;
    const negativeCount = dayFeedbacks.filter(
      fb => fb.sentiment === 'negative'
    ).length;
    const neutralCount = dayFeedbacks.filter(
      fb => fb.sentiment === 'neutral'
    ).length;

    await prisma.dailyStats.create({
      data: {
        date,
        totalCount,
        avgRating: Math.round(avgRating * 100) / 100,
        positiveCount,
        negativeCount,
        neutralCount,
      },
    });
  }

  console.log('✅ 已生成每日统计数据');
  console.log('🎉 数据初始化完成！');
}

main()
  .catch(e => {
    console.error('❌ 数据生成失败:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
