import { NextRequest, NextResponse } from 'next/server';
import openai from '@/lib/openai';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { feedbackId, feedbackText } = await request.json();

    if (!feedbackText) {
      return NextResponse.json({ error: 'feedbackText is required' }, { status: 400 });
    }

    const prompt = `分析以下Robotaxi乘客反馈，将其分类到以下类别之一：行驶体验、车内环境、接驾体验、路线规划、安全感受、其他。
同时判断情感倾向：positive（正面）、negative（负面）、neutral（中性）。
并生成一句话摘要（不超过50字）。

反馈内容：${feedbackText}

只以JSON格式返回，不要有其他文字：{"category": "...", "sentiment": "...", "confidence": 0.95, "summary": "..."}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.3,
    });

    const responseText = completion.choices[0]?.message?.content ?? '{}';
    const cleanText = responseText.replace(/```json|```/g, '').trim();
    const result = JSON.parse(cleanText);

    if (feedbackId) {
      await prisma.feedback.update({
        where: { id: feedbackId },
        data: {
          aiSummary: result.summary,
          category: result.category,
          sentiment: result.sentiment,
        },
      });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('POST /api/ai/analyze error:', error);
    return NextResponse.json({
      category: '行驶体验',
      sentiment: 'positive',
      confidence: 0.85,
      summary: 'AI分析暂不可用，请配置OpenAI API Key',
    });
  }
}