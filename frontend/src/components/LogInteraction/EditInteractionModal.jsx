import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiX, FiSave } from 'react-icons/fi';
import { closeEditModal, updateInteraction, fetchInteractions } from '../../store/slices/interactionSlice';
import toast from 'react-hot-toast';

const EditInteractionModal = () => {
  const dispatch = useDispatch();
  const { editingInteraction } = useSelector((state) => state.interactions);

  const [formData, setFormData] = useState({
    interaction_type: '',
    channel: '',
    attendees: '',
    products_discussed: '',
    key_topics: '',
    materials_shared: '',
    samples_distributed: '',
    notes: '',
    follow_up_actions: '',
    outcome: '',
    sentiment: '',
  });

  useEffect(() => {
    if (editingInteraction) {
      setFormData({
        interaction_type: editingInteraction.interaction_type || '',
        channel: editingInteraction.channel || '',
        attendees: (editingInteraction.attendees || []).join(', '),
        products_discussed: (editingInteraction.products_discussed || []).join(', '),
        key_topics: (editingInteraction.key_topics || []).join(', '),
        materials_shared: (editingInteraction.materials_shared || []).join(', '),
        samples_distributed: (editingInteraction.samples_distributed || []).join(', '),
        notes: editingInteraction.notes || '',
        follow_up_actions: (editingInteraction.follow_up_actions || []).join(', '),
        outcome: editingInteraction.outcome || '',
        sentiment: editingInteraction.sentiment || '',
      });
    }
  }, [editingInteraction]);

  const toList = (str) => (str ? str.split(',').map((s) => s.trim()).filter(Boolean) : []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const updateData = {
      interaction_type: formData.interaction_type,
      channel: formData.channel,
      attendees: toList(formData.attendees),
      products_discussed: toList(formData.products_discussed),
      key_topics: toList(formData.key_topics),
      materials_shared: toList(formData.materials_shared),
      samples_distributed: toList(formData.samples_distributed),
      notes: formData.notes,
      follow_up_actions: toList(formData.follow_up_actions),
      outcome: formData.outcome,
      sentiment: formData.sentiment,
    };

    try {
      await dispatch(updateInteraction({ id: editingInteraction.id, data: updateData })).unwrap();
      toast.success('Interaction updated!');
      dispatch(fetchInteractions());
      dispatch(closeEditModal());
    } catch (error) {
      toast.error(`Failed to update: ${error}`);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => dispatch(closeEditModal())}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">Edit Interaction #{editingInteraction?.id}</h3>
          <button className="modal-close" onClick={() => dispatch(closeEditModal())}>
            <FiX />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Interaction Type</label>
              <select
                name="interaction_type"
                className="form-select"
                value={formData.interaction_type}
                onChange={handleChange}
              >
                <option value="In-Person">In-Person</option>
                <option value="Virtual">Virtual</option>
                <option value="Phone">Phone</option>
                <option value="Email">Email</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Channel</label>
              <select
                name="channel"
                className="form-select"
                value={formData.channel}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="Clinic Visit">Clinic Visit</option>
                <option value="Hospital Visit">Hospital Visit</option>
                <option value="Conference">Conference</option>
                <option value="Zoom">Zoom</option>
                <option value="Teams">Teams</option>
                <option value="Phone Call">Phone Call</option>
                <option value="Email">Email</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Products Discussed</label>
            <input
              type="text"
              name="products_discussed"
              className="form-input"
              value={formData.products_discussed}
              onChange={handleChange}
              placeholder="Comma separated..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Key Topics</label>
            <input
              type="text"
              name="key_topics"
              className="form-input"
              value={formData.key_topics}
              onChange={handleChange}
              placeholder="Comma separated..."
            />
          </div>

          <div className="form-group">
            <label className="form-label">Attendees</label>
            <input
              type="text"
              name="attendees"
              className="form-input"
              value={formData.attendees}
              onChange={handleChange}
              placeholder="Comma separated..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Materials Shared</label>
              <input
                type="text"
                name="materials_shared"
                className="form-input"
                value={formData.materials_shared}
                onChange={handleChange}
                placeholder="Comma separated..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">Samples Distributed</label>
              <input
                type="text"
                name="samples_distributed"
                className="form-input"
                value={formData.samples_distributed}
                onChange={handleChange}
                placeholder="Comma separated..."
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea
              name="notes"
              className="form-textarea"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Sentiment</label>
              <select
                name="sentiment"
                className="form-select"
                value={formData.sentiment}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="Positive">Positive</option>
                <option value="Neutral">Neutral</option>
                <option value="Negative">Negative</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Outcome</label>
              <select
                name="outcome"
                className="form-select"
                value={formData.outcome}
                onChange={handleChange}
              >
                <option value="">Select...</option>
                <option value="Sample Requested">Sample Requested</option>
                <option value="Info Shared">Info Shared</option>
                <option value="Follow-up Scheduled">Follow-up Scheduled</option>
                <option value="Prescription Commitment">Prescription Commitment</option>
                <option value="No Interest">No Interest</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Follow-up Actions</label>
            <input
              type="text"
              name="follow_up_actions"
              className="form-input"
              value={formData.follow_up_actions}
              onChange={handleChange}
              placeholder="Comma separated..."
            />
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => dispatch(closeEditModal())}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <FiSave /> Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditInteractionModal;
