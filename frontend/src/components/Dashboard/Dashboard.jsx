import React, { useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiUsers, FiMessageSquare, FiSmile, FiChevronsRight, FiActivity, FiClock,
} from 'react-icons/fi';
import { fetchHCPs } from '../../store/slices/hcpSlice';
import { fetchInteractions } from '../../store/slices/interactionSlice';
import { format } from 'date-fns';

const StatCard = ({ icon, value, label, tint }) => (
  <div className="glass-card stat-card">
    <div className="stat-icon" style={{ background: tint }}>{icon}</div>
    <div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

const Dashboard = () => {
  const dispatch = useDispatch();
  const { items: hcps } = useSelector((s) => s.hcps);
  const { items: interactions } = useSelector((s) => s.interactions);

  useEffect(() => {
    dispatch(fetchHCPs());
    dispatch(fetchInteractions());
  }, [dispatch]);

  const stats = useMemo(() => {
    const total = interactions.length;
    const sentiments = { Positive: 0, Neutral: 0, Negative: 0 };
    let followUps = 0;
    const byType = {};
    interactions.forEach((i) => {
      if (i.sentiment && sentiments[i.sentiment] !== undefined) sentiments[i.sentiment]++;
      if ((i.follow_up_actions || []).length) followUps++;
      byType[i.interaction_type] = (byType[i.interaction_type] || 0) + 1;
    });
    const positivePct = total ? Math.round((sentiments.Positive / total) * 100) : 0;
    return { total, sentiments, followUps, positivePct, byType };
  }, [interactions]);

  const recent = useMemo(
    () => [...interactions]
      .sort((a, b) => new Date(b.interaction_date) - new Date(a.interaction_date))
      .slice(0, 5),
    [interactions]
  );

  const maxType = Math.max(1, ...Object.values(stats.byType));

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--heading-color)' }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
          Overview of your HCP engagement activity.
        </p>
      </div>

      {/* KPI cards */}
      <div className="stat-grid" style={{ marginBottom: '1.5rem' }}>
        <StatCard icon={<FiUsers />} value={hcps.length} label="Healthcare Professionals"
          tint="linear-gradient(135deg, var(--brand-navy), var(--primary-600))" />
        <StatCard icon={<FiMessageSquare />} value={stats.total} label="Total Interactions"
          tint="linear-gradient(135deg, var(--primary-600), var(--primary-400))" />
        <StatCard icon={<FiSmile />} value={`${stats.positivePct}%`} label="Positive Sentiment"
          tint="linear-gradient(135deg, var(--accent-emerald), #34d399)" />
        <StatCard icon={<FiChevronsRight />} value={stats.followUps} label="Interactions w/ Follow-ups"
          tint="linear-gradient(135deg, var(--accent-amber), #fbbf24)" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', alignItems: 'start' }} className="log-grid">
        {/* Sentiment + type breakdown */}
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title"><FiActivity /> Sentiment Breakdown</h3>
          </div>
          {stats.total === 0 ? (
            <p className="empty-state-text">No interactions yet.</p>
          ) : (
            <div>
              {[
                { key: 'Positive', color: 'var(--sentiment-positive)' },
                { key: 'Neutral', color: 'var(--sentiment-neutral)' },
                { key: 'Negative', color: 'var(--sentiment-negative)' },
              ].map(({ key, color }) => {
                const val = stats.sentiments[key];
                const pct = stats.total ? Math.round((val / stats.total) * 100) : 0;
                return (
                  <div className="bar-row" key={key}>
                    <div className="bar-label">{key}</div>
                    <div className="bar-track">
                      <div className="bar-fill" style={{ width: `${pct}%`, background: color }} />
                    </div>
                    <div className="bar-value">{val} · {pct}%</div>
                  </div>
                );
              })}

              <div className="form-section-label" style={{ marginTop: 'var(--space-6)' }}>By Interaction Type</div>
              {Object.entries(stats.byType).map(([type, val]) => (
                <div className="bar-row" key={type}>
                  <div className="bar-label">{type}</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: `${(val / maxType) * 100}%` }} />
                  </div>
                  <div className="bar-value">{val}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div className="glass-card">
          <div className="glass-card-header">
            <h3 className="glass-card-title"><FiClock /> Recent Activity</h3>
          </div>
          {recent.length === 0 ? (
            <p className="empty-state-text">No interactions yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              {recent.map((i) => (
                <div key={i.id} className="activity-row">
                  <div className={`activity-dot sentiment-${(i.sentiment || 'neutral').toLowerCase()}`} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div className="activity-title">{i.hcp_name || `HCP #${i.hcp_id}`}</div>
                    <div className="activity-sub">
                      {i.interaction_type}{i.channel ? ` · ${i.channel}` : ''}
                      {(i.products_discussed || []).length ? ` · ${i.products_discussed.join(', ')}` : ''}
                    </div>
                  </div>
                  <div className="activity-date">
                    {(() => { try { return format(new Date(i.interaction_date), 'MMM dd'); } catch { return ''; } })()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
