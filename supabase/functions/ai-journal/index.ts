// Supabase Edge Function: AI Travel Journal Generator

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
    const { destination, startDate, endDate, numDays, members, places, expenses, highlights } = await req.json();

    const prompt = `你是一个有温度的旅行记录者。请为以下旅行生成一篇旅行总结。

旅行信息：
- 目的地：${destination}
- 日期：${startDate} - ${endDate}（${numDays}天）
- 同行：${members || 1}人
- 打卡地点：${(places || []).slice(0, 10).join('、')}
- 总消费约：¥${(expenses || []).reduce((s: number, e: any) => s + (e.amount || 0), 0)}
- 亮点：${(highlights || []).join('、')}

请用 JSON 格式返回：
{
  "coverSummary": "一段温暖的中文旅行总结（80-150字），有画面感，像旅行日记",
  "highlights": ["亮点1", "亮点2", "亮点3", "亮点4", "亮点5"]
}`;

    const response = await fetch(DEEPSEEK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-v4-pro",
        max_tokens: 2048,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const data = await response.json();
    const content = data.content?.[0]?.text || data.choices?.[0]?.message?.content || "";

    let result;
    try {
      result = JSON.parse(content);
    } catch {
      const match = content.match(/\{[\s\S]*\}/);
      result = match ? JSON.parse(match[0]) : { coverSummary: content, highlights: [] };
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
