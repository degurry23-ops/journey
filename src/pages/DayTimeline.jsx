import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTrips } from '../contexts/TripContext'
import { formatDate, getDayOfWeek, cn } from '../utils/helpers'
import { getCategoryIcon } from '../utils/helpers'
import { useToast } from '../components/Toast'

export default function DayTimeline() {
  const { id, dayId } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { trips, dispatch } = useTrips();
  const trip = trips.find(t => t.id === id);
  const day = trip?.days?.find(d => d.id === dayId);
  const dayIndex = trip?.days?.findIndex(d => d.id === dayId);
  const [dragIdx, setDragIdx] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [newPlace, setNewPlace] = useState({ name:'', cat:'景点', time:'10:00', duration:'1h', fee:'' });

  if (!trip || !day) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8]">
      <div className="text-center"><p className="text-4xl mb-3">🗺️</p><p>行程不存在</p></div>
    </div>
  );

  const handleDragStart = (idx) => setDragIdx(idx);
  const handleDragOver = (e) => e.preventDefault();
  const handleDrop = (idx) => {
    if (dragIdx === null || dragIdx === idx) return;
    const places = [...day.places];
    const [moved] = places.splice(dragIdx, 1);
    places.splice(idx, 0, moved);
    dispatch({ type:'REORDER_PLACES', payload:{ tripId:trip.id, dayId:day.id, places }});
    setDragIdx(null);
    toast('路线已更新', 'success');
  };

  const removePlace = (placeId) => {
    dispatch({ type:'REMOVE_PLACE', payload:{ tripId:trip.id, dayId:day.id, placeId }});
    toast('已移除地点', 'info');
  };

  const addPlace = () => {
    if (!newPlace.name.trim()) return;
    dispatch({ type:'ADD_PLACE', payload:{ tripId:trip.id, dayId:day.id, place:newPlace }});
    setNewPlace({ name:'', cat:'景点', time:'10:00', duration:'1h', fee:'' });
    setShowAdd(false);
    toast('地点已添加', 'success');
  };

  const totalSpent = trip.expenses?.filter(e => e.dayId === day.id).reduce((s, e) => s + e.amount, 0) || 0;
  const dateStr = new Date(new Date(trip.startDate).getTime() + dayIndex * 86400000).toISOString().split('T')[0];

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 animate-fade-in">
      {/* Top bar */}
      <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-[#94A3B8] text-sm hover:text-[#3B82F6] transition">← 返回</button>
          <div className="text-center">
            <p className="font-bold text-[#1E293B]">
              <span className="text-[#3B82F6]">Day {dayIndex + 1}</span>
            </p>
            <p className="text-xs text-[#94A3B8]">{formatDate(dateStr)} {getDayOfWeek(dateStr)}</p>
          </div>
          <button onClick={() => navigate(`/trip/${trip.id}/map`)}
            className="text-sm bg-[#EFF6FF] text-[#3B82F6] px-3 py-1.5 rounded-xl font-medium hover:bg-[#DBEAFE] transition">
            🗺️ 地图
          </button>
        </div>
        {/* Day switcher */}
        <div className="max-w-lg mx-auto px-4 pb-3 flex gap-2 overflow-x-auto">
          {trip.days?.map((d, i) => (
            <button key={d.id} onClick={() => navigate(`/trip/${trip.id}/day/${d.id}`)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition',
                d.id === dayId
                  ? 'bg-[#3B82F6] text-white shadow-sm'
                  : 'bg-gray-100 text-[#64748B] hover:bg-gray-200'
              )}>
              Day {i+1} {d.places?.length > 0 ? `· ${d.places.length}` : ''}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Weather + AI Tip */}
        <div className="bg-gradient-to-r from-[#3B82F6] to-[#60A5FA] rounded-2xl p-4 text-white shadow-sm">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{day.weather?.includes('雨') ? '🌧' : day.weather?.includes('多云') ? '⛅' : '☀️'}</span>
            <div>
              <p className="font-semibold text-lg">{day.weather || '☀️ 晴 25°C'}</p>
              <p className="text-sm text-white/85 mt-0.5 line-clamp-2">
                💡 {day.tip || '今天天气不错，适合出行~'}
              </p>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-[#64748B] uppercase tracking-wider">今日行程</h2>
            <button onClick={() => setShowAdd(true)}
              className="text-sm bg-[#EFF6FF] text-[#3B82F6] px-3 py-1.5 rounded-xl font-medium hover:bg-[#DBEAFE] transition">
              + 添加
            </button>
          </div>

          {(!day.places || day.places.length === 0) && (
            <div className="text-center py-16 card">
              <p className="text-5xl mb-4">📍</p>
              <p className="text-[#94A3B8] font-medium">还没有安排</p>
              <p className="text-xs text-[#94A3B8] mt-1 mb-4">点击上方「+ 添加」或拖拽地图上的地点过来</p>
              <button onClick={() => setShowAdd(true)}
                className="btn btn-primary btn-sm !text-sm !py-2 !px-5">
                ✨ 添加第一个地点
              </button>
            </div>
          )}

          <div className="space-y-2">
            {day.places?.map((place, i) => (
              <div key={place.id}
                draggable
                onDragStart={() => handleDragStart(i)}
                onDragOver={handleDragOver}
                onDrop={() => handleDrop(i)}
                className={cn(
                  'card card-press flex items-center gap-3 cursor-grab active:cursor-grabbing transition-all',
                  dragIdx === i && 'opacity-40 scale-95 ring-2 ring-[#3B82F6]'
                )}
              >
                {/* Timeline dot + line */}
                <div className="relative flex flex-col items-center">
                  <div className="w-3 h-3 rounded-full bg-[#3B82F6] border-2 border-white ring-2 ring-[#93C5FD] flex-shrink-0 z-10" />
                  {i < (day.places?.length || 0) - 1 && (
                    <div className="absolute top-4 bottom-[-12px] w-0.5 bg-[#DBEAFE]" />
                  )}
                </div>

                {/* Time */}
                <div className="text-center min-w-[3.5rem]">
                  <p className="text-sm font-bold text-[#1E293B] tabular-nums">{place.time || '--:--'}</p>
                  <p className="text-[10px] text-[#94A3B8]">{place.duration || ''}</p>
                </div>

                {/* Place info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{getCategoryIcon(place.cat)}</span>
                    <span className="font-semibold text-[#1E293B] text-sm truncate">{place.name}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="tag tag-blue">{place.cat || '景点'}</span>
                    {place.fee && <span className="text-xs text-[#94A3B8]">{place.fee}</span>}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  {place.lat && (
                    <a href={`https://uri.amap.com/marker?position=${place.lng},${place.lat}&name=${place.name}`}
                      target="_blank" rel="noreferrer"
                      className="w-8 h-8 rounded-xl bg-[#EFF6FF] text-[#3B82F6] flex items-center justify-center text-sm hover:bg-[#DBEAFE] transition">
                      🧭
                    </a>
                  )}
                  <button onClick={() => removePlace(place.id)}
                    className="w-8 h-8 rounded-xl hover:bg-red-50 text-[#94A3B8] hover:text-[#EF4444] flex items-center justify-center transition">
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Today's expenses */}
        {totalSpent > 0 && (
          <div className="card flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg">💰</span>
              <span className="text-sm text-[#64748B]">今日消费</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-bold text-[#1E293B]">¥{totalSpent.toLocaleString()}</span>
              <button onClick={() => navigate(`/trip/${trip.id}/expenses`)}
                className="text-xs bg-[#EFF6FF] text-[#3B82F6] px-3 py-1.5 rounded-xl font-medium">
                + 记账
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Add place sheet */}
      {showAdd && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fade">
          <div className="sheet-overlay absolute inset-0" onClick={() => setShowAdd(false)} />
          <div className="sheet-content relative bg-white rounded-t-3xl p-6 max-w-lg mx-auto w-full shadow-2xl safe-bottom">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-bold text-[#1E293B] mb-4">添加地点</h3>
            <div className="space-y-3">
              <input className="input" placeholder="地点名称" value={newPlace.name}
                onChange={e => setNewPlace(p => ({...p, name:e.target.value}))} autoFocus />
              <div className="flex gap-2 flex-wrap">
                {['景点','美食','咖啡','购物','住宿','交通','其他'].map(c => (
                  <button key={c} onClick={() => setNewPlace(p => ({...p, cat:c}))}
                    className={`px-3 py-1.5 rounded-full text-sm transition ${
                      newPlace.cat === c ? 'bg-[#3B82F6] text-white' : 'bg-gray-100 text-[#64748B]'
                    }`}>{getCategoryIcon(c)} {c}</button>
                ))}
              </div>
              <div className="flex gap-3">
                <input className="input flex-1" placeholder="时间" value={newPlace.time}
                  onChange={e => setNewPlace(p => ({...p, time:e.target.value}))} />
                <input className="input flex-1" placeholder="时长" value={newPlace.duration}
                  onChange={e => setNewPlace(p => ({...p, duration:e.target.value}))} />
              </div>
              <input className="input" placeholder="费用（可选）" value={newPlace.fee}
                onChange={e => setNewPlace(p => ({...p, fee:e.target.value}))} />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowAdd(false)} className="btn btn-ghost flex-1">取消</button>
                <button onClick={addPlace} disabled={!newPlace.name.trim()}
                  className="btn btn-primary flex-1">添加</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
