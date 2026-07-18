import { useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTrips } from '../contexts/TripContext'
import { formatMoney, cn } from '../utils/helpers'
import { useToast } from '../components/Toast'

const CATEGORIES = [
  { key:'餐饮', icon:'🍜', color:'#EF4444' },
  { key:'交通', icon:'🚇', color:'#F59E0B' },
  { key:'住宿', icon:'🏨', color:'#8B5CF6' },
  { key:'门票', icon:'🎫', color:'#3B82F6' },
  { key:'购物', icon:'🛍', color:'#EC4899' },
  { key:'咖啡', icon:'☕', color:'#10B981' },
  { key:'其他', icon:'💊', color:'#64748B' },
];

export default function Expenses() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { trips, dispatch } = useTrips();
  const trip = trips.find(t => t.id === id);
  const [showForm, setShowForm] = useState(false);
  const [amount, setAmount] = useState('');
  const [cat, setCat] = useState('餐饮');
  const [note, setNote] = useState('');
  const [activeTab, setActiveTab] = useState('明细');

  if (!trip) return (
    <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-[#94A3B8]">
      <div className="text-center"><p className="text-4xl mb-3">💰</p><p>数据不存在</p></div>
    </div>
  );

  const expenses = trip.expenses || [];
  const total = expenses.reduce((s, e) => s + e.amount, 0);
  const perPerson = total / ((trip.members?.length || 1));

  const byCat = useMemo(() => {
    return CATEGORIES.map(c => ({
      ...c,
      total: expenses.filter(e => e.cat === c.key).reduce((s,e) => s + e.amount, 0),
    })).filter(c => c.total > 0).sort((a,b) => b.total - a.total);
  }, [expenses]);

  const handleAdd = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    dispatch({ type:'ADD_EXPENSE', payload:{
      tripId:trip.id,
      expense:{ amount:parseFloat(amount), cat, note, payer:'我', date:new Date().toISOString().split('T')[0] }
    }});
    setAmount(''); setNote(''); setShowForm(false);
    toast(`已记录 ${cat} ¥${parseFloat(amount).toLocaleString()}`, 'success');
  };

  const handleRemove = (eid) => {
    dispatch({ type:'REMOVE_EXPENSE', payload:{ tripId:trip.id, expenseId:eid }});
    toast('已删除', 'info');
  };

  const maxCatTotal = Math.max(...byCat.map(c => c.total), 1);

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-24 animate-fade-in">
      {/* Top bar */}
      <div className="bg-white border-b border-[#E2E8F0] sticky top-0 z-20">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="text-[#94A3B8] text-sm hover:text-[#3B82F6]">← 返回</button>
          <h1 className="font-bold text-[#1E293B]">旅行记账</h1>
          <div className="w-12" />
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {/* Summary */}
        <div className="bg-gradient-to-br from-[#1E293B] to-[#334155] rounded-2xl p-5 text-white">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm opacity-70">总消费</span>
            <span className="text-xs opacity-50">{trip.members?.length || 1}人同行</span>
          </div>
          <p className="text-4xl font-bold tracking-tight">{formatMoney(total)}</p>
          <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
            <div>
              <p className="text-xs opacity-50">人均</p>
              <p className="font-bold text-lg">{formatMoney(perPerson)}</p>
            </div>
            <div>
              <p className="text-xs opacity-50">笔数</p>
              <p className="font-bold text-lg">{expenses.length}</p>
            </div>
          </div>
        </div>

        {/* Category breakdown */}
        {byCat.length > 0 && (
          <div className="card space-y-3">
            <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider">分类统计</h3>
            {byCat.map(c => (
              <div key={c.key} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <span>{c.icon}</span>
                    <span className="font-medium text-[#1E293B]">{c.key}</span>
                  </span>
                  <span className="font-semibold text-[#1E293B]">{formatMoney(c.total)}</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-500"
                    style={{width:`${(c.total/maxCatTotal)*100}%`, background:c.color}} />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-xl p-1">
          {['明细','结算'].map(t => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={cn('flex-1 py-2 rounded-lg text-sm font-medium transition',
                activeTab === t ? 'bg-white text-[#1E293B] shadow-sm' : 'text-[#94A3B8]')}>{t}</button>
          ))}
        </div>

        {/* Expense list */}
        {activeTab === '明细' && (
          <div className="space-y-2">
            {expenses.length === 0 && (
              <div className="card text-center py-12">
                <p className="text-4xl mb-3">💳</p>
                <p className="font-medium text-[#94A3B8]">还没有消费记录</p>
              </div>
            )}
            {[...expenses].reverse().map(e => (
              <div key={e.id} className="card card-press flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-lg flex-shrink-0">
                  {CATEGORIES.find(c => c.key === e.cat)?.icon || '💰'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-[#1E293B] text-sm">{e.cat}{e.note ? ` · ${e.note}` : ''}</p>
                  <p className="text-xs text-[#94A3B8]">{e.payer} · {e.date}</p>
                </div>
                <span className="font-bold text-[#1E293B]">{formatMoney(e.amount)}</span>
                <button onClick={() => handleRemove(e.id)}
                  className="w-7 h-7 rounded-lg hover:bg-red-50 text-[#94A3B8] hover:text-[#EF4444] text-sm">✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Settlement */}
        {activeTab === '结算' && (
          <div className="card space-y-4">
            <h3 className="text-sm font-bold text-[#64748B] uppercase tracking-wider">AA 分摊</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-sm text-[#64748B]">总消费</span>
                <span className="font-bold">{formatMoney(total)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b border-[#F1F5F9]">
                <span className="text-sm text-[#64748B]">人数</span>
                <span className="font-bold">{trip.members?.length || 1} 人</span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-[#64748B]">每人应付</span>
                <span className="font-bold text-lg text-[#3B82F6]">{formatMoney(perPerson)}</span>
              </div>
            </div>
            <button className="btn btn-primary btn-full !text-sm"
              onClick={() => {
                navigator.clipboard.writeText(`AA 分摊结果：每人 ¥${perPerson.toLocaleString()}`);
                toast('已复制到剪贴板', 'success');
              }}>
              📋 复制分摊结果
            </button>
          </div>
        )}
      </div>

      {/* Add FAB */}
      {!showForm && (
        <button onClick={() => setShowForm(true)}
          className="fixed bottom-6 right-6 w-14 h-14 bg-[#3B82F6] text-white rounded-2xl text-2xl shadow-lg shadow-blue-200 hover:bg-[#2563EB] active:scale-90 transition-all z-30 flex items-center justify-center">
          +
        </button>
      )}

      {/* Add form sheet */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex flex-col justify-end animate-fade">
          <div className="sheet-overlay absolute inset-0" onClick={() => setShowForm(false)} />
          <div className="sheet-content relative bg-white rounded-t-3xl p-6 max-w-lg mx-auto w-full shadow-2xl safe-bottom">
            <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-5" />
            <h3 className="text-lg font-bold text-[#1E293B] mb-4">记录消费</h3>
            <div className="space-y-3">
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map(c => (
                  <button key={c.key} onClick={() => setCat(c.key)}
                    className={cn('px-3 py-1.5 rounded-full text-sm transition',
                      cat === c.key ? 'text-white shadow-sm' : 'bg-gray-100 text-[#64748B]')}
                    style={cat === c.key ? {background:c.color} : {}}>
                    {c.icon} {c.key}
                  </button>
                ))}
              </div>
              <input type="number" className="input text-2xl font-bold" placeholder="¥ 0"
                value={amount} onChange={e => setAmount(e.target.value)} autoFocus />
              <input type="text" className="input" placeholder="备注（可选）"
                value={note} onChange={e => setNote(e.target.value)} />
              <div className="flex gap-3 pt-2">
                <button onClick={() => setShowForm(false)} className="btn btn-ghost flex-1">取消</button>
                <button onClick={handleAdd} disabled={!amount || parseFloat(amount) <= 0}
                  className="btn btn-primary flex-1">记录</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
