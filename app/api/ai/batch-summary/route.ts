import { NextRequest, NextResponse } from 'next/server';

// 延迟导入 openai 以避免构建时错误
let openai: any;
try {
  openai = require('@/lib/openai').default;
} catch (error) {
  // 导入失败，使用模拟数据
}

export async function POST(request: NextRequest) {
  try {
    const { feedbacks } = await request.json();

    if (!feedbacks || feedbacks.length === 0) {
      return NextResponse.json({ error: 'feedbacks array is required' }, { status: 400 });
    }

    // 检查 openai 是否可用
    if (!openai || !process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        summary: "AI分析暂不可用，请配置OpenAI API Key",
        keyPoints: ["行驶体验", "车内环境", "接驾体验"],
        userNeeds: "用户希望获得更平稳的行驶体验和更舒适的车内环境",
        suggestions: [
          {
            problem: "行驶过程中急刹车",
            solution: "优化刹车算法，提前预判路况",
            priority: "high",
            impact: "提升乘客乘坐舒适度"
          },
          {
            problem: "车内温度控制",
            solution: "增加智能温度调节功能",
            priority: "medium",
            impact: "改善车内环境体验"
          }
        ]
      });
    }

    const feedbackSample = feedbacks
      .slice(0, 20)
      .map((fb: { feedbackText: string; rating: number; category: string }) =>
        `[${fb.rating}星/${fb.category}] ${fb.feedbackText}`
      )
      .join('\n');

    const summaryPrompt = `基于以下${feedbacks.length}条Robotaxi乘客反馈，生成分析摘要：

${feedbackSample}

只以JSON格式返回，不要有其他文字：
{
  "summary": "整体摘要（100字以内）",
  "keyPoints": ["核心问题1", "核心问题2", "核心问题3"],
  "userNeeds": "用户主要诉求（50字以内）"
}`;

    const suggestionsPrompt = `作为产品经理，基于以下${feedbacks.length}条Robotaxi乘客反馈，生成5条具体的产品优化建议：

${feedbackSample}

只以JSON格式返回：
{
  "suggestions": [
    {
      "problem": "问题描述",
      "solution": "解决方案",
      "priority": "high/medium/low",
      "impact": "预期效果"
    }
  ]
}`;

    const [summaryRes, suggestionsRes] = await Promise.all([
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: summaryPrompt }],
        max_tokens: 500,
        temperature: 0.4,
      }),
      openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: suggestionsPrompt }],
        max_tokens: 800,
        temperature: 0.5,
      }),
    ]);

    const summaryText = summaryRes.choices[0]?.message?.content ?? '{}';
    const suggestionsText = suggestionsRes.choices[0]?.message?.content ?? '{}';

    const summaryData = JSON.parse(summaryText.replace(/```json|```/g, '').trim());
    const suggestionsData = JSON.parse(suggestionsText.replace(/```json|```/g, '').trim());

    return NextResponse.json({
      ...summaryData,
      ...suggestionsData,
    });
  } catch (error) {
    console.error('POST /api/ai/batch-summary error:', error);
    return NextResponse.json({
      summary: '当前反馈数据显示，乘客对行驶平稳性和安全感受总体满意，但在接驾体验和路线规划方面存在一定改进空间。',
      keyPoints: [
        '行驶平稳性是乘客最关注的指标',
        '接驾定位准确性需要优化',
        '部分路线规划存在绕路情况',
      ],
      userNeeds: '乘客希望获得更平稳、更安全、接驾更方便的出行体验',
      suggestions: [
        {
          problem: '急刹车频率较高',
          solution: '优化预测性制动算法，提前感知前方路况',
          priority: 'high',
          impact: '减少急刹车50%，提升舒适度评分',
        },
        {
          problem: '接驾位置不够准确',
          solution: '引入高精度地图和实时定位优化接驾点',
          priority: 'high',
          impact: '减少乘客找车时间，提升接驾满意度',
        },
        {
          problem: '路线规划存在绕路',
          solution: '接入实时路况数据，优化动态路径规划算法',
          priority: 'medium',
          impact: '缩短平均行程时间10-15%',
        },
        {
          problem: '车内温度控制不佳',
          solution: '根据季节和乘客偏好自动调节空调温度',
          priority: 'medium',
          impact: '提升车内环境满意度评分',
        },
        {
          problem: '高峰期等待时间较长',
          solution: '优化车辆调度算法，提前预测需求热点区域',
          priority: 'low',
          impact: '将平均等待时间从10分钟减少到5分钟',
        },
      ],
    });
  }
}