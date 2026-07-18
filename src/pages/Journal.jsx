import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTrips } from '../contexts/TripContext'
import { formatDate, formatFullDate, formatMoney, cn } from '../utils/helpers'
import { generateJournal } from '../data/mockAI'
import { useToast } from '../components/Toast'

const STAT_ICONS = { '旅行天数':'📅', '打卡地点':'📍', '总消费':'💰', '同行人数':'👥', '总步行':'👣', '最远打卡':'🏆' };

export default function Journal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { trips } = useTrips();
  const trip = trips.find(t => t.id === id);
  const journal = useMemo(() => trip ? generateJournal(trip) : null, [trip]);

  if (!trip) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8]">
      <div className="text-center"><p className="text-4xl mb-3">📖</p><p>日志不存在</p></div>
    </div>
  );

  const totalExp = trip.expenses?.reduce((s, e) => s + e.amount, 0) || 0;
  const totalPlaces = trip.days?.reduce((s, d) => s + (d.places?.length || 0), 0) || 0;
  const stats = [
    { label:'旅行天数', value:`${trip.days?.length || 0} 天` },
    { label:'打卡地点', value:`${totalPlaces} 个` },
    { label:'总消费', value:formatMoney(totalExp) },
    { label:'同行人数', value:`${trip.members?.length || 1} 人` },
    { label:'总步行', value:journal?.totalSteps || '-' },
    { label:'最远打卡', value:journal?.mostDistant || '-' },
  ];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-8 animate-fade-in">
      {/* Cover */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#1E3A5F] via-[#2563EB] to-[#60A5FA] text-white p-8 pt-16 pb-12">
        <div className="absolute top-4 right-6 text-8xl opacity-10">📖</div>
        <button onClick={() => navigate(-1)} className="text-white/60 text-sm mb-6 block relative z-10 hover:text-white/90 transition">← 返回</button>
        <div className="relative z-10 text-center">
          <p className="text-sm text-white/50 mb-2">{formatFullDate(trip.startDate)} - {formatFullDate(trip.endDate)}</p>
          <h1 className="text-3xl font-bold tracking-tight">{trip.destination}之旅</h1>
          <div className="w-16 h-0.5 bg-white/30 mx-auto mt-4 rounded-full" />
          <p className="text-sm text-white/50 mt-3">Journey Travel Journal</p>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 -mt-6 space-y-4">
        {/* Stats grid */}
        <div className="card !p-5">
          <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-4">📊 旅行数据</h3>
          <div className="grid grid-cols-3 gap-3">
            {stats.map(s => (
              <div key={s.label} className="bg-[#F8FAFC] rounded-2xl p-3 text-center">
                <p className="text-2xl mb-1">{STAT_ICONS[s.label] || '📌'}</p>
                <p className="text-[10px] text-[#94A3B8] mb-0.5">{s.label}</p>
                <p className="font-bold text-sm text-[#1E293B]">{s.value}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Daily timeline recap */}
        <div className="card !p-5">
          <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-4">📖 每日回顾</h3>
          <div className="space-y-4">
            {trip.days?.map((d, i) => (
              <div key={d.id} className="flex gap-3">
                <div className="flex flex-col items-center pt-1">
                  <div className="w-3 h-3 rounded-full bg-[#3B82F6] border-2 border-white ring-2 ring-[#93C5FD]" />
                  {i < (trip.days?.length || 0) - 1 && <div className="w-0.5 flex-1 bg-[#DBEAFE] my-1" />}
                </div>
                <div className="flex-1 pb-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="tag tag-blue">Day {i+1}</span>
                    <span className="text-xs text-[#94A3B8]">{d.weather}</span>
                  </div>
                  <p className="text-sm text-[#475569] leading-relaxed">
                    {d.places?.length > 0
                      ? d.places.map(p => p.name).join(' → ')
                      : '自由探索的一天'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Summary */}
        <div className="card !p-5 !border-[#DBEAFE] bg-gradient-to-br from-[#EFF6FF] to-white">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-xl bg-[#3B82F6] flex items-center justify-center text-white text-sm">AI</div>
            <h3 className="font-bold text-[#1E293B] text-sm">AI 旅行总结</h3>
          </div>
          <p className="text-sm text-[#475569] leading-relaxed">{journal?.summary}</p>
          {journal?.highlights?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {journal.highlights.map((h, i) => (
                <span key={i} className="tag tag-blue">{h}</span>
              ))}
            </div>
          )}
        </div>

        {/* Expense chart */}
        {totalExp > 0 && (
          <div className="card !p-5">
            <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-4">💸 消费分布</h3>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden flex">
              {['餐饮','交通','住宿','门票','购物','其他'].map((cat, i) => {
                const amt = trip.expenses?.filter(e => e.cat === cat).reduce((s,e) => s + e.amount, 0) || 0;
                const pct = totalExp > 0 ? (amt / totalExp) * 100 : 0;
                const colors = ['#EF4444','#F59E0B','#8B5CF6','#3B82F6','#EC4899','#64748B'];
                return pct > 0 ? <div key={cat} style={{width:`${pct}%`, background:colors[i]}} /> : null;
              })}
            </div>
            <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
              {['餐饮','交通','住宿','门票','购物','其他'].map((cat, i) => {
                const amt = trip.expenses?.filter(e => e.cat === cat).reduce((s,e) => s + e.amount, 0) || 0;
                const colors = ['#EF4444','#F59E0B','#8B5CF6','#3B82F6','#EC4899','#64748B'];
                return amt > 0 ? (
                  <span key={cat} className="text-xs flex items-center gap-1 text-[#64748B]">
                    <span className="w-2 h-2 rounded-full" style={{background:colors[i]}} />{cat} {formatMoney(amt)}
                  </span>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Photos */}
        <div className="card !p-5">
          <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider mb-4">📷 照片墙</h3>
          <div className="grid grid-cols-3 gap-2">
            {Array.from({length:6}).map((_, i) => (
              <div key={i} className="aspect-square bg-[#F1F5F9] rounded-2xl flex items-center justify-center text-3xl text-[#CBD5E1] hover:bg-[#E2E8F0] transition cursor-pointer">
                📷
              </div>
            ))}
          </div>
        </div>

        {/* Share */}
        <button onClick={() => toast('分享功能即将上线', 'info')}
          className="btn btn-primary btn-full btn-lg">
          📤 分享旅行日志
        </button>

        <p className="text-center text-[10px] text-[#94A3B8] pb-4">
          Made with 💙 Journey · Every Journey Deserves to Be Remembered
        </p>
      </div>
    </div>
  );
}
