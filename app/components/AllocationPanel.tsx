'use client';

import React, { useState, useCallback } from 'react';
import { Send, X } from 'lucide-react';

interface Allocation {
  id: string;
  resourceId: string;
  requestId: string;
  quantity: number;
  status: 'pending' | 'dispatched' | 'delivered';
  timestamp: Date;
}

interface AllocationPanelProps {
  onAllocate?: (allocation: Allocation) => void;
}

export const AllocationPanel: React.FC<AllocationPanelProps> = ({ onAllocate }) => {
  const [allocations, setAllocations] = useState<Allocation[]>([
    {
      id: '1',
      resourceId: 'r1',
      requestId: '1',
      quantity: 50,
      status: 'dispatched',
      timestamp: new Date(Date.now() - 3600000),
    },
    {
      id: '2',
      resourceId: 'r2',
      requestId: '2',
      quantity: 100,
      status: 'delivered',
      timestamp: new Date(Date.now() - 7200000),
    },
  ]);

  const [formData, setFormData] = useState({
    resourceId: '',
    requestId: '',
    quantity: '',
  });

  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  }, []);

  const handleAllocate = useCallback(() => {
    if (formData.resourceId && formData.requestId && formData.quantity) {
      const newAllocation: Allocation = {
        id: Date.now().toString(),
        resourceId: formData.resourceId,
        requestId: formData.requestId,
        quantity: parseInt(formData.quantity),
        status: 'pending',
        timestamp: new Date(),
      };

      setAllocations((prev) => [newAllocation, ...prev]);
      onAllocate?.(newAllocation);
      setFormData({ resourceId: '', requestId: '', quantity: '' });
    }
  }, [formData, onAllocate]);

  const removeAllocation = useCallback((id: string) => {
    setAllocations((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'text-yellow-400';
      case 'dispatched':
        return 'text-blue-400';
      case 'delivered':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };

  return (
    <div className="neon-card space-y-4">
      <h2 className="text-lg font-bold text-cyan-400">Resource Allocation</h2>

      {/* Allocation Form */}
      <div className="space-y-3 pb-4 border-b" style={{ borderBottomColor: 'rgba(0, 255, 255, 0.2)' }}>
        <input
          type="text"
          name="resourceId"
          placeholder="Resource ID"
          value={formData.resourceId}
          onChange={handleInputChange}
          className="neon-input text-sm"
        />
        <input
          type="text"
          name="requestId"
          placeholder="Request ID"
          value={formData.requestId}
          onChange={handleInputChange}
          className="neon-input text-sm"
        />
        <input
          type="number"
          name="quantity"
          placeholder="Quantity"
          value={formData.quantity}
          onChange={handleInputChange}
          className="neon-input text-sm"
        />
        <button
          onClick={handleAllocate}
          className="neon-button-primary w-full flex items-center justify-center gap-2 py-2"
        >
          <Send size={16} />
          Allocate Resources
        </button>
      </div>

      {/* Allocation History */}
      <div>
        <h3 className="text-sm font-semibold text-cyan-300 mb-3">Recent Allocations</h3>
        <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
          {allocations.length === 0 ? (
            <p className="text-xs text-gray-500 text-center py-4">No allocations yet</p>
          ) : (
            allocations.map((allocation) => (
              <div
                key={allocation.id}
                className="flex items-center justify-between p-3 rounded-lg border transition-all" 
                style={{ backgroundColor: 'rgba(0, 255, 255, 0.1)', borderColor: 'rgba(0, 255, 255, 0.3)' }}
              >
                <div className="flex-1">
                  <div className="text-xs font-semibold text-cyan-300">
                    Res: {allocation.resourceId} → Req: {allocation.requestId}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Qty: {allocation.quantity}
                  </div>
                  <div className={`text-xs mt-1 font-semibold ${getStatusColor(allocation.status)}`}>
                    {allocation.status.toUpperCase()}
                  </div>
                </div>
                <button
                  onClick={() => removeAllocation(allocation.id)}
                  className="p-1 rounded transition-all" 
                  style={{ backgroundColor: 'rgba(255, 0, 0, 0.1)' }}
                >
                  <X size={14} className="text-red-400" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default React.memo(AllocationPanel);
