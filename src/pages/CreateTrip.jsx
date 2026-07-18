import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTrips } from '../contexts/TripContext'
import { addTrip as saveTrip } from '../utils/storage'
import { generateTripPlan } from '../data/mockAI'
import { aiPlanTrip } from '../lib/supabase'

const STEPS = [
  { key:'destination', q:'Hi！准备去哪里旅行？', placeholder:'例如：日本东京', icon:'🌏', hint:'输入你想去的城市或国家' },
  { key:'startDate', q:'什么时候出发？', placeholder:'选择日期', icon:'📅', type:'date', hint:'告诉我出发日期就好' },
  { key:'days', q:'准备玩几天？', placeholder:'例如：5', icon:'📆', type:'number', hint:'3天、5天、一周都可以~' },
  { key:'members', q:'几个人一起呀？', placeholder:'例如：4', icon:'👥', type:'number', hint:'算上你自己哦' },
  { key:'budget', q:'预算大概多少？（每人）', placeholder:'例如：8000', icon:'💰', type:'number', hint:'大概数字就行，不用太精确' },
  { key:'preferences', q:'最后，有没有特别想体验的？', placeholder:'例如：动漫、美食、购物', icon:'🎯', hint:'选几个关键词，AI 帮你安排' },
];

export default function CreateTrip() {
  const navigate = useNavigate();
  const { dispatch } = useTrips();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [value, setValue] = useState('');
  const [generating, setGenerating] = useState(false);
  const [generated, setGenerated] = useState(null);
  const inputRef = useRef(null);
  const chatRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior:'smooth' });
  }, [step]);

  const current = STEPS[step];
  const progress = ((step) / STEPS.length) * 100;

  const handleNext = () => {
    const newAnswers = { ...answers, [current.key]: value };
    setAnswers(newAnswers);
    setValue('');
    if (step < STEPS.length - 1) {
      setStep(step + 1);
    } else {
      handleGenerate(newAnswers);
    }
  };

  const handleGenerate = async (data) => {
    setGenerating(true);
    const days = parseInt(data.days) || 5;
    // Try AI first, fallback to mock
    let tripDays;
    try {
      const aiResult = await aiPlanTrip({
        destination: data.destination,
        startDate: data.startDate,
        numDays: days,
        members: parseInt(data.members) || 1,
        budget: parseInt(data.budget) || 5000,
        preferences: data.preferences || '',
      });
      if (aiResult?.days?.length) {
        tripDays = aiResult.days.map((d, i) => ({
          id: crypto.randomUUID(),
          date: d.day || i,
          places: (d.places || []).map(p => ({
            ...p,
            id: crypto.randomUUID(),
            cat: p.category || p.cat || '景点',
            time: p.time_slot || p.time || '09:00',
            duration: p.duration || '1h',
            fee: p.fee || '免费',
            lat: p.lat || null,
            lng: p.lng || null,
          })),
          weather: d.weather || '☀️ 晴 25°C',
          tip: d.tip || '',
        }));
      }
    } catch (e) {
      console.log('AI unavailable, using mock:', e.message);
    }
    if (!tripDays?.length) {
      tripDays = generateTripPlan(data.destination, days, data.preferences);
    }
    const endDate = new Date(data.startDate);
      endDate.setDate(endDate.getDate() + days - 1);
      const trip = {
        name:`${data.destination}之旅`, destination:data.destination,
        startDate:data.startDate, endDate:endDate.toISOString().split('T')[0],
        members:[{ name:'我', role:'owner', accepted:true }],
        days:tripDays, budget:parseInt(data.budget),
      };
      setGenerated(trip);
      setGenerating(false);
  };

  const handleConfirm = () => {
    const newTrip = addTrip(generated);
    dispatch({ type:'ADD', payload:newTrip });
    navigate(`/trip/${newTrip.id}`);
  };

  // Generating state
  if (generating) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex flex-col items-center justify-center p-8 text-center">
        <div className="animate-float">
          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-5xl shadow-lg">
            🤖
          </div>
        </div>
        <h2 className="text-xl font-bold text-[#2C3E50] mt-8">AI 正在为你规划...</h2>
        <p className="text-sm text-[#95A5A6] mt-2 leading-relaxed">
          正在分析 {answers.destination} 的最佳路线<br />
          匹配你的兴趣偏好，估算合理预算
        </p>
        <div className="mt-8 space-y-2 w-56">
          {['分析目的地热门地点...', '计算最优路线排序...', '生成每日行程安排...', '匹配预算与偏好...'].map((msg, i) => (
            <div key={i} className="flex items-center gap-3 animate-fade-in" style={{animationDelay:`${i*0.5}s`}}>
              <span className="w-2 h-2 rounded-full bg-[#52B788] animate-pulse-dot" />
              <span className="text-xs text-gray-500">{msg}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Generated preview
  if (generated) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] animate-fade-in">
        <div className="bg-gradient-to-br from-[#2D6A4F] to-[#52B788] text-white p-6 pt-12">
          <h2 className="text-2xl font-bold">🎉 行程已生成！</h2>
          <p className="text-sm opacity-80 mt-1">{generated.destination}之旅 · {generated.days.length}天 · {generated.startDate} 出发</p>
        </div>
        <div className="max-w-lg mx-auto px-4 -mt-4 space-y-3 pb-24">
          {generated.days.map((d, i) => (
            <div key={d.id} className="card animate-fade-in" style={{animationDelay:`${i*0.08}s`}}>
              <div className="flex items-center gap-2 mb-3">
                <span className="tag tag-green">Day {i+1}</span>
                <span className="text-sm text-[#95A5A6]">{d.weather}</span>
                <span className="text-xs text-[#95A5A6] ml-auto">{d.places?.length || 0} 个地点</span>
              </div>
              <div className="space-y-2">
                {d.places?.map(p => (
                  <div key={p.id} className="flex items-center gap-3 text-sm">
                    <span className="text-xs text-[#95A5A6] w-10 tabular-nums">{p.time}</span>
                    <span className="text-base">
                      {p.cat === '美食' ? '🍜' : p.cat === '咖啡' ? '☕' : p.cat === '购物' ? '🛍' : p.cat === '住宿' ? '🏨' : '📍'}
                    </span>
                    <span className="font-medium text-[#2C3E50]">{p.name}</span>
                    <span className="text-xs text-[#95A5A6] ml-auto">{p.duration}</span>
                  </div>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-[#E8E2D9] flex items-center gap-4 text-xs text-[#95A5A6]">
                <span>🚶 步行约 {8 + Math.floor(Math.random()*10)}km</span>
                <span>💴 预计 ¥{200 + Math.floor(Math.random()*400)}</span>
              </div>
            </div>
          ))}
          <button onClick={handleConfirm} className="btn-primary w-full !text-lg !py-4 !rounded-2xl">
            ✈️ 确认行程，开始旅程
          </button>
          <button onClick={() => { setGenerated(null); setStep(0); setAnswers({}); }}
            className="w-full py-3 text-sm text-[#95A5A6] text-center">
            不满意，重新生成
          </button>
        </div>
      </div>
    );
  }

  // Chat interface
  return (
    <div className="min-h-screen bg-[#FFF8F0] flex flex-col">
      {/* Progress bar */}
      <div className="h-1 bg-[#E8E2D9]">
        <div className="h-full bg-gradient-to-r from-[#2D6A4F] to-[#52B788] transition-all duration-500 ease-out rounded-r-full"
          style={{width:`${Math.max(progress, (step/STEPS.length)*100)}%`}} />
      </div>

      {/* Chat area */}
      <div ref={chatRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4 max-w-lg mx-auto w-full">
        {/* AI greeting */}
        <div className="flex gap-3 animate-slide-left">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white text-sm flex-shrink-0">
            AI
          </div>
          <div className="chat-bubble-ai max-w-[80%]">
            <p className="text-sm text-[#2C3E50] leading-relaxed">
              你好！我是 Journey 的 AI 旅行规划师 🧳<br />
              回答几个简单问题，我帮你规划一段完美的旅程。
            </p>
          </div>
        </div>

        {/* Past Q&A */}
        {STEPS.slice(0, step).map((s, i) => (
          <div key={s.key} className="space-y-3 animate-fade-in">
            <div className="flex gap-3 justify-end">
              <div className="chat-bubble-user max-w-[75%]">
                <p className="text-sm">{i === 0 ? answers[s.key] :
                  s.key === 'startDate' ? answers[s.key] :
                  s.key === 'days' ? `${answers[s.key]}天` :
                  s.key === 'members' ? `${answers[s.key]}人` :
                  s.key === 'budget' ? `每人¥${answers[s.key]}` :
                  answers[s.key]}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#F4E4CD] flex items-center justify-center text-sm flex-shrink-0">
                👤
              </div>
            </div>
            {/* AI response to this answer */}
            {i < step - 1 && (
              <div className="flex gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white text-sm flex-shrink-0">
                  AI
                </div>
                <div className="chat-bubble-ai max-w-[80%]">
                  <p className="text-sm text-[#2C3E50]">{STEPS[i+1].q}</p>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* Current question */}
        <div className="flex gap-3 animate-slide-left">
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#2D6A4F] to-[#52B788] flex items-center justify-center text-white text-sm flex-shrink-0">
            AI
          </div>
          <div className="chat-bubble-ai max-w-[80%]">
            <p className="text-sm text-[#2C3E50] font-medium">{current.q}</p>
            {current.hint && <p className="text-xs text-[#95A5A6] mt-1">{current.hint}</p>}
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="bg-white/90 backdrop-blur border-t border-[#E8E2D9] px-4 py-4 safe-bottom">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <span className="text-2xl">{current.icon}</span>
          {current.type === 'date' ? (
            <input ref={inputRef} type="date" value={value}
              onChange={e => setValue(e.target.value)}
              className="input-base flex-1" />
          ) : (
            <input ref={inputRef} type={current.type || 'text'} value={value}
              onChange={e => setValue(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && value.trim() && handleNext()}
              placeholder={current.placeholder}
              className="input-base flex-1" autoFocus />
          )}
          <button onClick={handleNext} disabled={!value.trim()}
            className="w-12 h-12 rounded-full bg-[#2D6A4F] text-white flex items-center justify-center text-xl disabled:opacity-30 transition-all hover:bg-[#1b4332] active:scale-90 flex-shrink-0">
            →
          </button>
        </div>
        <p className="text-center text-[10px] text-[#c0bdb5] mt-2">
          第 {step+1}/{STEPS.length} 步 · 按 Enter 发送
        </p>
      </div>
    </div>
  );
}
