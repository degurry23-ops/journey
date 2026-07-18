// Supabase Edge Function: AI Trip Planner
// Calls DeepSeek V4 via Anthropic-compatible API to generate travel itinerary

import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const DEEPSEEK_URL = "https://api.deepseek.com/anthropic/v1/messages";
const DEEPSEEK_KEY = Deno.env.get("DEEPSEEK_API_KEY")!;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response(JSON.stringify({ error: "POST only" }), { status: 405, headers: corsHeaders });

  try {
    const { destination, startDate, numDays, members, budget, preferences } = await req.json();

    if (!destination || !startDate || !numDays) {
      return new Response(JSON.stringify({ error: "缺少必填字段: destination, startDate, numDays" }), { status: 400, headers: corsHeaders });
    }

    const prompt = `你是一个专业旅行规划师。请为${destination}的${numDays}天旅行生成详细行程。

要求：
- 出发日期：${startDate}
- 人数：${members || 1}人
- 预算：每人¥${budget || 5000}
- 偏好：${preferences || '无特殊偏好'}
- 每天安排 3-4 个地点
- 考虑景点之间的距离和路线合理性

请用 JSON 格式返回，不要 markdown：
{
  "name": "目的地之旅",
  "days": [
    {
      "day": 1,
      "weather": "☀️ 晴 25°C",
      "tip": "当日旅行小贴士",
      "places": [
        { "name": "地点名", "category": "景点|美食|购物|咖啡|交通|住宿|其他", "time": "09:00", "duration": "1.5h", "fee": "免费或价格", "lat": 35.7, "lng": 139.8 }
      ]
    }
  ]
}`;

    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-v4-pro",
        max_tokens: 4096,
        messages: [{ role: "user", content: prompt }],
        response_format: { type: "json_object" },
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || data.choices?.[0]?.message?.content || "";

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      // If not valid JSON, try to extract JSON from markdown
      const match = content.match(/\{[\s\S]*\}/);
      result = match ? JSON.parse(match[0]) : { error: "AI 解析失败", raw: content };
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
