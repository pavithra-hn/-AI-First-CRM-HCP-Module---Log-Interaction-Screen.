import React, { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiMapPin, FiMail, FiPhone, FiBriefcase, FiActivity } from 'react-icons/fi';
import { fetchHCPs } from '../../store/slices/hcpSlice';
import { fetchInteractions } from '../../store/slices/interactionSlice';

const initials = (first, last) =>
  `${(first || '').replace(/^Dr\.?\s*/i, '').charAt(0)}${(last || '').charAt(0)}`.toUpperCase();

const HCPDirectory = () => {
  const dispatch = useDispatch();
  const { items: hcps, loading } = useSelector((s) => s.hcps);
  const { items: interactions } = useSelector((s) => s.interactions);
  const [query, setQuery] = useState('');

  useEffect(() => {
    dispatch(fetchHCPs());
    dispatch(fetchInteractions());
  }, [dispatch]);

  const countByHcp = useMemo(() => {
    const map = {};
    interactions.forEach((i) => { map[i.hcp_id] = (map[i.hcp_id] || 0) + 1; });
    return map;
  }, [interactions]);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return hcps;
    return hcps.filter((h) =>
      `${h.first_name} ${h.last_name}`.toLowerCase().includes(q) ||
      (h.specialty || '').toLowerCase().includes(q) ||
      (h.hospital || '').toLowerCase().includes(q) ||
      (h.territory || '').toLowerCase().includes(q) ||
      (h.city || '').toLowerCase().includes(q)
    );
  }, [hcps, query]);

  return (
    <div>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '-0.02em', color: 'var(--heading-color)' }}>
          HCP Directory
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)', marginTop: 4 }}>
          {hcps.length} healthcare professionals in your territory.
        </p>
      </div>

      {/* Search */}
      <div className="glass-card" style={{ marginBottom: '1.5rem', padding: 'var(--space-4)' }}>
        <div style={{ position: 'relative' }}>
          <FiSearch style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-tertiary)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: 40 }}
            placeholder="Search by name, specialty, hospital, territory, or city..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      {loading && hcps.length === 0 ? (
        <div className="glass-card"><div className="empty-state"><div className="loading-spinner" /></div></div>
      ) : filtered.length === 0 ? (
        <div className="glass-card">
          <div className="empty-state">
            <h3 className="empty-state-title">No HCPs found</h3>
            <p className="empty-state-text">Try a different search term.</p>
          </div>
        </div>
      ) : (
        <div className="directory-grid">
          {filtered.map((hcp) => (
            <div key={hcp.id} className="glass-card hcp-card">
              <div className="hcp-card-top">
                <div className="hcp-avatar">{initials(hcp.first_name, hcp.last_name)}</div>
                <div style={{ minWidth: 0 }}>
                  <div className="hcp-name">{hcp.first_name} {hcp.last_name}</div>
                  <span className="hcp-specialty-badge">{hcp.specialty}</span>
                </div>
                <div className="hcp-interactions" title="Logged interactions">
                  <FiActivity size={13} /> {countByHcp[hcp.id] || 0}
                </div>
              </div>

              <div className="hcp-meta">
                {hcp.hospital && <div className="hcp-meta-row"><FiBriefcase size={14} /> {hcp.hospital}</div>}
                {(hcp.city || hcp.state) && <div className="hcp-meta-row"><FiMapPin size={14} /> {[hcp.city, hcp.state].filter(Boolean).join(', ')}{hcp.territory ? ` • ${hcp.territory}` : ''}</div>}
                {hcp.email && <div className="hcp-meta-row"><FiMail size={14} /> {hcp.email}</div>}
                {hcp.phone && <div className="hcp-meta-row"><FiPhone size={14} /> {hcp.phone}</div>}
              </div>

              {hcp.notes && <div className="hcp-notes">{hcp.notes}</div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HCPDirectory;
