'use client';

import React, { useState, useCallback } from 'react';
import { Send, X } from 'lucide-react';

interface RequestFormData {
  title: string;
  location: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  requester: string;
}

interface RequestFormProps {
  onSubmit?: (formData: RequestFormData) => void;
  onClose?: () => void;
  isOpen?: boolean;
}

export const RequestForm: React.FC<RequestFormProps> = ({
  onSubmit = () => {},
  onClose = () => {},
  isOpen = true,
}) => {
  const [formData, setFormData] = useState<RequestFormData>({
    title: '',
    location: '',
    description: '',
    priority: 'high',
    requester: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.requester.trim()) newErrors.requester = 'Requester name is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(() => {
    if (validateForm()) {
      onSubmit(formData);
      setFormData({
        title: '',
        location: '',
        description: '',
        priority: 'high',
        requester: '',
      });
    }
  }, [formData, validateForm, onSubmit]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)', backdropFilter: 'blur(4px)' }}>
      <div className="neon-card w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4 pb-4 border-b" style={{ borderBottomColor: 'rgba(0, 255, 255, 0.2)' }}>
          <h2 className="text-lg font-bold text-cyan-400">New Request</h2>
          <button
            onClick={onClose}
            className="p-1 rounded transition-all" 
            style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)' }}
          >
            <X size={20} className="text-red-400" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title */}
          <div>
            <label className="text-sm text-cyan-300 block mb-2">Request Title *</label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g., Medical Supplies Needed"
              className={`neon-input ${errors.title ? 'border-red-500' : ''}`}
            />
            {errors.title && <p className="text-xs text-red-400 mt-1">{errors.title}</p>}
          </div>

          {/* Location */}
          <div>
            <label className="text-sm text-cyan-300 block mb-2">Location *</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              placeholder="e.g., Downtown Hospital"
              className={`neon-input ${errors.location ? 'border-red-500' : ''}`}
            />
            {errors.location && <p className="text-xs text-red-400 mt-1">{errors.location}</p>}
          </div>

          {/* Priority */}
          <div>
            <label className="text-sm text-cyan-300 block mb-2">Priority Level</label>
            <select
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              className="neon-input" 
              style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          {/* Requester */}
          <div>
            <label className="text-sm text-cyan-300 block mb-2">Requester Name *</label>
            <input
              type="text"
              name="requester"
              value={formData.requester}
              onChange={handleChange}
              placeholder="Your name"
              className={`neon-input ${errors.requester ? 'border-red-500' : ''}`}
            />
            {errors.requester && <p className="text-xs text-red-400 mt-1">{errors.requester}</p>}
          </div>

          {/* Description */}
          <div>
            <label className="text-sm text-cyan-300 block mb-2">Description *</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Provide detailed information about the request"
              className={`neon-input resize-none h-24 ${errors.description ? 'border-red-500' : ''}`}
            />
            {errors.description && <p className="text-xs text-red-400 mt-1">{errors.description}</p>}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4 border-t" style={{ borderTopColor: 'rgba(0, 255, 255, 0.2)' }}>
            <button
              onClick={onClose}
              className="neon-button flex-1 py-2"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              className="neon-button-primary flex-1 flex items-center justify-center gap-2 py-2"
            >
              <Send size={16} />
              Submit Request
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(RequestForm);
