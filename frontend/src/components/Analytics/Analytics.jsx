import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiPieChart, FiBarChart2, FiRadio, FiTrendingUp } from 'react-icons/fi';
import { fetchHCPs } from '../../store/slices/hcpSlice';
import { fetchInteractions } from '../../store/slices/interactionSlice';

/* Horizontal bar list */
const BarList = ({ data, color }) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  if (!data.length) return <p className="empty-state-text">No data yet.</p>;
  return (
    <div>
      {data.map((d) => (
        <div className="bar-row" key={d.label}>
          <div className="bar-label" title={d.label}>{d.label}</div>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(d.value / max) * 100}%`, ...(color ? { background: color } : {}) }} />
          </div>
          <div className="bar-value">{d.value}</div>
        </div>
      ))}
    </div>
  );
};

const Analytics = () => {
  const dispatch = useDispatch();
  const { items: interactions } = useSelector((s) => s.interactions);

  useEffect(() => {
    dispatch(fetchHCPs());
    dispatch(fetchInteractions());
  }, [dispatch]);

  const data = useMemo(() => {
    const sentiments = { Positive: 0, Neutral: 0, Negative: 0 };
    const byType = {}, byChannel = {}, bySpecialty = {};
    const last7 = {};
    for (let d = 6; d >= 0; d--) {
      const day = new Date(); day.setDate(day.getDate() - d);
      last7[day.toLocaleDateString('en-US', { weekday: 'short' })] = 0;
    }
    interactions.forEach((i) => {
      if (i.sentiment && sentiments[i.sentiment] !== undefined) sentiments[i.sentiment]++;
      if (i.interaction_type) byType[i.interaction_type] = (byType[i.interaction_type] || 0) + 1;
      if (i.channel) byChannel[i.channel] = (byChannel[i.channel] || 0) + 1;
      if (i.hcp_specialty) bySpecialty[i.hcp_specialty] = (bySpecialty[i.hcp_specialty] || 0) + 1;
      try {
        const wd = new Date(i.interaction_date).toLocaleDateString('en-US', { weekday: 'short' });
        if (wd in last7) last7[wd]++;
      } catch { /* ignore */ }
    });
    const toList = (obj) => Object.entries(obj).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value);
    return {
      total: interactions.length,
      sentiments,
      byType: toList(byType),
      byChannel: toList(byChannel),
      bySpecialty: toList(bySpecialty),
      last7: Object.entries(last7).map(([label, value]) => ({ label, value })),
    };
  }, [interactions]);

  // Donut via conic-gradient
  const { Positive, Neutral, Negative } = data.sentiments;
  const total = Positive + Neutral + Negative || 1;
  const p = (Positive / total) * 100;
  const n = (Neutral / total) * 100;
  const donut = `conic-gradient(
    var(--sentiment-positive) 0 ${p}%,
    var(--sentiment-neutral) ${p}% ${p + n}%,
    var(--sentiment-negative) ${p + n}% 100%)`;

  const maxDay = Math.max(1, ...data.last7.map((d) => d.value));

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--heading-color)' }}>
          Analytics
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
          Insights across {data.total} logged interaction{data.total === 1 ? '' : 's'}.
        </p>
      </div>

      <div className="analytics-grid">
        {/* Sentiment donut */}
        <div className="glass-card">
          <div className="glass-card-header"><h3 className="glass-card-title"><FiPieChart /> Sentiment Distribution</h3></div>
          {data.total === 0 ? <p className="empty-state-text">No interactions yet.</p> : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-6)', flexWrap: 'wrap' }}>
              <div className="donut" style={{ background: donut }}>
                <div className="donut-hole"><span>{data.total}</span><small>logs</small></div>
              </div>
              <div className="donut-legend">
                {[
                  { k: 'Positive', v: Positive, c: 'var(--sentiment-positive)' },
                  { k: 'Neutral', v: Neutral, c: 'var(--sentiment-neutral)' },
                  { k: 'Negative', v: Negative, c: 'var(--sentiment-negative)' },
                ].map(({ k, v, c }) => (
                  <div className="legend-row" key={k}>
                    <span className="legend-dot" style={{ background: c }} />
                    <span className="legend-label">{k}</span>
                    <span className="legend-val">{v} ({Math.round((v / total) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Activity last 7 days (columns) */}
        <div className="glass-card">
          <div className="glass-card-header"><h3 className="glass-card-title"><FiTrendingUp /> Activity (last 7 days)</h3></div>
          <div className="column-chart">
            {data.last7.map((d) => (
              <div className="col-item" key={d.label}>
                <div className="col-track">
                  <div className="col-fill" style={{ height: `${(d.value / maxDay) * 100}%` }} title={`${d.value}`} />
                </div>
                <div className="col-label">{d.label}</div>
                <div className="col-value">{d.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* By type */}
        <div className="glass-card">
          <div className="glass-card-header"><h3 className="glass-card-title"><FiBarChart2 /> By Interaction Type</h3></div>
          <BarList data={data.byType} />
        </div>

        {/* By channel */}
        <div className="glass-card">
          <div className="glass-card-header"><h3 className="glass-card-title"><FiRadio /> By Channel</h3></div>
          <BarList data={data.byChannel} color="var(--accent-cyan)" />
        </div>

        {/* By specialty */}
        <div className="glass-card" style={{ gridColumn: '1 / -1' }}>
          <div className="glass-card-header"><h3 className="glass-card-title"><FiBarChart2 /> Interactions by Specialty</h3></div>
          <BarList data={data.bySpecialty} color="var(--accent-violet)" />
        </div>
      </div>
    </div>
  );
};

export default Analytics;
