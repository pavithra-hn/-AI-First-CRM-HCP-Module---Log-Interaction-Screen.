import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  FiSave, FiCalendar, FiClock, FiUser, FiPackage, FiUsers, FiFileText,
  FiFolder, FiGift, FiZap, FiMic, FiPlus, FiChevronsRight,
} from 'react-icons/fi';
import { createInteraction, fetchInteractions } from '../../store/slices/interactionSlice';
import { interactionApi } from '../../api/interactionApi';
import toast from 'react-hot-toast';

/* ---------- Reusable chip / tag input ---------- */
const TagInput = ({ values, onChange, placeholder, chipClass = '' }) => {
  const [draft, setDraft] = useState('');

  const addTag = (raw) => {
    const val = raw.trim().replace(/,$/, '').trim();
    if (val && !values.includes(val)) {
      onChange([...values, val]);
    }
    setDraft('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(draft);
    } else if (e.key === 'Backspace' && !draft && values.length) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className="tag-input">
      {values.map((tag, i) => (
        <span key={`${tag}-${i}`} className={`chip ${chipClass}`}>
          {tag}
          <button
            type="button"
            className="chip-remove"
            onClick={() => onChange(values.filter((_, idx) => idx !== i))}
            aria-label={`Remove ${tag}`}
          >
            ×
          </button>
        </span>
      ))}
      <input
        type="text"
        className="tag-field"
        placeholder={values.length ? '' : placeholder}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => draft && addTag(draft)}
      />
    </div>
  );
};

const SENTIMENTS = [
  { key: 'Positive', emoji: '🙂', className: 'positive' },
  { key: 'Neutral', emoji: '😐', className: 'neutral' },
  { key: 'Negative', emoji: '🙁', className: 'negative' },
];

const now = new Date();
const emptyForm = {
  hcp_id: '',
  date: now.toISOString().slice(0, 10),
  time: now.toTimeString().slice(0, 5),
  interaction_type: 'In-Person',
  channel: '',
  attendees: [],
  notes: '',
  ai_summary: '',
  key_topics: [],
  products_discussed: [],
  materials_shared: [],
  samples_distributed: [],
  sentiment: 'Neutral',
  outcome: '',
  follow_up_actions: [],
  ai_suggested_follow_ups: [],
};

const FormMode = () => {
  const dispatch = useDispatch();
  const { items: hcps } = useSelector((state) => state.hcps);
  const { loading } = useSelector((state) => state.interactions);

  const [formData, setFormData] = useState(emptyForm);
  const [hcpSearch, setHcpSearch] = useState('');
  const [showHcpDropdown, setShowHcpDropdown] = useState(false);
  const [summarizing, setSummarizing] = useState(false);
  const [suggesting, setSuggesting] = useState(false);

  const selectedHcp = hcps.find((h) => h.id === parseInt(formData.hcp_id));

  const filteredHcps = hcps.filter((hcp) => {
    const fullName = `${hcp.first_name} ${hcp.last_name}`.toLowerCase();
    const q = hcpSearch.toLowerCase();
    return fullName.includes(q) || (hcp.specialty && hcp.specialty.toLowerCase().includes(q));
  });

  const setField = (name, value) => setFormData((prev) => ({ ...prev, [name]: value }));
  const handleChange = (e) => setField(e.target.name, e.target.value);

  const handleHcpSelect = (hcp) => {
    setField('hcp_id', hcp.id);
    setHcpSearch(`${hcp.first_name} ${hcp.last_name} — ${hcp.specialty}`);
    setShowHcpDropdown(false);
  };

  /* ----- AI: summarize the discussion notes (simulated voice-note summary) ----- */
  const handleSummarize = async () => {
    if (!formData.notes.trim()) {
      toast.error('Enter discussion points first, then summarize.');
      return;
    }
    setSummarizing(true);
    try {
      const res = await interactionApi.summarize({
        text: formData.notes,
        hcp_name: selectedHcp ? `${selectedHcp.first_name} ${selectedHcp.last_name}` : null,
      });
      setField('ai_summary', res.data.summary);
      toast.success('AI summary generated');
    } catch (err) {
      toast.error(`Summarize failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setSummarizing(false);
    }
  };

  /* ----- AI: suggest follow-ups for the current draft ----- */
  const handleSuggestFollowUps = async () => {
    if (!formData.hcp_id) {
      toast.error('Select an HCP first.');
      return;
    }
    setSuggesting(true);
    try {
      const res = await interactionApi.suggestFollowUps({
        hcp_name: selectedHcp ? `${selectedHcp.first_name} ${selectedHcp.last_name}` : null,
        products_discussed: formData.products_discussed,
        key_topics: formData.key_topics,
        notes: formData.notes,
        sentiment: formData.sentiment,
        outcome: formData.outcome,
      });
      setField('ai_suggested_follow_ups', res.data.suggestions || []);
      if (!res.data.suggestions?.length) toast('No suggestions returned.');
    } catch (err) {
      toast.error(`Suggest failed: ${err.response?.data?.detail || err.message}`);
    } finally {
      setSuggesting(false);
    }
  };

  const acceptSuggestion = (text) => {
    if (!formData.follow_up_actions.includes(text)) {
      setFormData((prev) => ({
        ...prev,
        follow_up_actions: [...prev.follow_up_actions, text],
        ai_suggested_follow_ups: prev.ai_suggested_follow_ups.filter((s) => s !== text),
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.hcp_id) {
      toast.error('Please select an HCP');
      return;
    }

    const submissionData = {
      hcp_id: parseInt(formData.hcp_id),
      interaction_date: new Date(`${formData.date}T${formData.time || '00:00'}`).toISOString(),
      interaction_type: formData.interaction_type,
      channel: formData.channel,
      attendees: formData.attendees,
      notes: formData.notes,
      ai_summary: formData.ai_summary || null,
      key_topics: formData.key_topics,
      products_discussed: formData.products_discussed,
      materials_shared: formData.materials_shared,
      samples_distributed: formData.samples_distributed,
      sentiment: formData.sentiment,
      outcome: formData.outcome,
      follow_up_actions: formData.follow_up_actions,
      ai_suggested_follow_ups: formData.ai_suggested_follow_ups,
    };

    try {
      await dispatch(createInteraction(submissionData)).unwrap();
      toast.success('Interaction logged successfully!');
      setFormData(emptyForm);
      setHcpSearch('');
      dispatch(fetchInteractions());
    } catch (error) {
      toast.error(`Failed to log interaction: ${error}`);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* ============ Interaction Details ============ */}
      <div className="form-section-label"><FiUser /> Interaction Details</div>

      <div className="form-row">
        {/* HCP Selection with Autocomplete */}
        <div className="form-group" style={{ position: 'relative', marginBottom: 0 }}>
          <label className="form-label">Healthcare Professional *</label>
          <input
            type="text"
            className="form-input"
            placeholder="Search or select HCP..."
            value={hcpSearch}
            onChange={(e) => {
              setHcpSearch(e.target.value);
              setShowHcpDropdown(true);
              if (!e.target.value) setField('hcp_id', '');
            }}
            onFocus={() => setShowHcpDropdown(true)}
            onBlur={() => setTimeout(() => setShowHcpDropdown(false), 200)}
          />
          {showHcpDropdown && hcpSearch && filteredHcps.length > 0 && (
            <div style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: 'var(--bg-elevated)', border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-lg)', maxHeight: '220px', overflowY: 'auto',
              zIndex: 20, marginTop: '4px', boxShadow: 'var(--shadow-lg)',
            }}>
              {filteredHcps.map((hcp) => (
                <div
                  key={hcp.id}
                  style={{ padding: '10px 16px', cursor: 'pointer', borderBottom: '1px solid var(--border-subtle)' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-glass-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onMouseDown={() => handleHcpSelect(hcp)}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                    {hcp.first_name} {hcp.last_name}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {hcp.specialty} • {hcp.hospital}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Interaction Type */}
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Interaction Type *</label>
          <select
            name="interaction_type"
            className="form-select"
            value={formData.interaction_type}
            onChange={handleChange}
            required
          >
            <option value="In-Person">In-Person / Meeting</option>
            <option value="Virtual">Virtual</option>
            <option value="Phone">Phone</option>
            <option value="Email">Email</option>
          </select>
        </div>
      </div>

      <div className="form-row" style={{ marginTop: 'var(--space-5)' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label"><FiCalendar style={{ marginRight: 6, verticalAlign: 'middle' }} />Date *</label>
          <input type="date" name="date" className="form-input" value={formData.date} onChange={handleChange} required />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label"><FiClock style={{ marginRight: 6, verticalAlign: 'middle' }} />Time</label>
          <input type="time" name="time" className="form-input" value={formData.time} onChange={handleChange} />
        </div>
      </div>

      <div className="form-row" style={{ marginTop: 'var(--space-5)' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Channel</label>
          <select name="channel" className="form-select" value={formData.channel} onChange={handleChange}>
            <option value="">Select channel...</option>
            <option value="Clinic Visit">Clinic Visit</option>
            <option value="Hospital Visit">Hospital Visit</option>
            <option value="Conference">Conference</option>
            <option value="Zoom">Zoom</option>
            <option value="Teams">Teams</option>
            <option value="Phone Call">Phone Call</option>
            <option value="Email">Email</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Outcome</label>
          <select name="outcome" className="form-select" value={formData.outcome} onChange={handleChange}>
            <option value="">Select outcome...</option>
            <option value="Sample Requested">Sample Requested</option>
            <option value="Info Shared">Info Shared</option>
            <option value="Follow-up Scheduled">Follow-up Scheduled</option>
            <option value="Prescription Commitment">Prescription Commitment</option>
            <option value="Referral">Referral</option>
            <option value="No Interest">No Interest</option>
          </select>
        </div>
      </div>

      <div className="form-group" style={{ marginTop: 'var(--space-5)' }}>
        <label className="form-label"><FiUsers style={{ marginRight: 6, verticalAlign: 'middle' }} />Attendees</label>
        <TagInput
          values={formData.attendees}
          onChange={(v) => setField('attendees', v)}
          placeholder="Enter names or search… (press Enter)"
        />
      </div>

      {/* ============ Discussion ============ */}
      <div className="form-section-label"><FiFileText /> Discussion</div>

      <div className="form-group">
        <label className="form-label">Topics Discussed</label>
        <textarea
          name="notes"
          className="form-textarea"
          placeholder="Enter key discussion points…"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
        />
        <div style={{ display: 'flex', gap: 'var(--space-2)', marginTop: 'var(--space-2)' }}>
          <button type="button" className="btn-ghost-ai" onClick={handleSummarize} disabled={summarizing}>
            <FiMic /> {summarizing ? 'Summarizing…' : 'Summarize from Voice Note (Requires Consent)'}
          </button>
        </div>
        {formData.ai_summary && (
          <div className="ai-suggestions" style={{ marginTop: 'var(--space-3)' }}>
            <div className="ai-suggestions-title"><FiZap /> AI Summary</div>
            <div className="ai-suggestion-item" style={{ display: 'block' }}>{formData.ai_summary}</div>
          </div>
        )}
      </div>

      <div className="form-row">
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label">Key Topics</label>
          <TagInput
            values={formData.key_topics}
            onChange={(v) => setField('key_topics', v)}
            placeholder="e.g. Efficacy data"
          />
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label className="form-label"><FiPackage style={{ marginRight: 6, verticalAlign: 'middle' }} />Products Discussed</label>
          <TagInput
            values={formData.products_discussed}
            onChange={(v) => setField('products_discussed', v)}
            placeholder="e.g. CardioGuard XR"
          />
        </div>
      </div>

      {/* ============ Materials & Samples ============ */}
      <div className="form-section-label"><FiFolder /> Materials Shared / Samples Distributed</div>

      <div className="form-group">
        <label className="form-label"><FiFolder style={{ marginRight: 6, verticalAlign: 'middle' }} />Materials Shared</label>
        <TagInput
          values={formData.materials_shared}
          onChange={(v) => setField('materials_shared', v)}
          placeholder="Search / add materials…"
          chipClass="chip-material"
        />
      </div>

      <div className="form-group">
        <label className="form-label"><FiGift style={{ marginRight: 6, verticalAlign: 'middle' }} />Samples Distributed</label>
        <TagInput
          values={formData.samples_distributed}
          onChange={(v) => setField('samples_distributed', v)}
          placeholder="Add sample…"
          chipClass="chip-sample"
        />
      </div>

      {/* ============ Sentiment ============ */}
      <div className="form-section-label"><FiZap /> Observed / Inferred HCP Sentiment</div>
      <div className="sentiment-options">
        {SENTIMENTS.map((s) => (
          <button
            key={s.key}
            type="button"
            className={`sentiment-option ${s.className} ${formData.sentiment === s.key ? 'active' : ''}`}
            onClick={() => setField('sentiment', s.key)}
          >
            <span className="sentiment-emoji">{s.emoji}</span>
            {s.key}
          </button>
        ))}
      </div>

      {/* ============ Follow-up ============ */}
      <div className="form-section-label"><FiChevronsRight /> Follow-up Actions</div>
      <div className="form-group">
        <TagInput
          values={formData.follow_up_actions}
          onChange={(v) => setField('follow_up_actions', v)}
          placeholder="Enter next steps or tasks… (press Enter)"
        />
      </div>

      <div className="form-group">
        <button type="button" className="btn-ghost-ai" onClick={handleSuggestFollowUps} disabled={suggesting}>
          <FiZap /> {suggesting ? 'Thinking…' : 'Generate AI Suggested Follow-ups'}
        </button>
        {formData.ai_suggested_follow_ups.length > 0 && (
          <div className="ai-suggestions" style={{ marginTop: 'var(--space-3)' }}>
            <div className="ai-suggestions-title"><FiZap /> AI Suggested Follow-ups</div>
            {formData.ai_suggested_follow_ups.map((s, i) => (
              <div key={i} className="ai-suggestion-item">
                <span>{s}</span>
                <button type="button" className="add-btn" onClick={() => acceptSuggestion(s)}>
                  <FiPlus style={{ verticalAlign: 'middle' }} /> Add
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', marginTop: 'var(--space-2)' }}>
        <FiSave />
        {loading ? 'Saving…' : 'Log Interaction'}
      </button>
    </form>
  );
};

export default FormMode;
