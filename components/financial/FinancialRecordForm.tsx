// components/financial/FinancialRecordForm.tsx
'use client';

import { useState } from 'react';
import { FinancialRecord, CreateFinancialRecordInput } from '@/types/financialRecord';
import { ExtendedProject } from '@/types/project';

interface FinancialRecordFormProps {
  projects: ExtendedProject[];
  record?: FinancialRecord;
  onSubmit: (data: CreateFinancialRecordInput) => void;
  onCancel: () => void;
}

export function FinancialRecordForm({ projects, record, onSubmit, onCancel }: FinancialRecordFormProps) {
  const [formData, setFormData] = useState({
    project_id: record?.project_id || '',
    record_date: record?.record_date || new Date().toISOString().split('T')[0],
    record_type: record?.record_type || 'income',
    category: record?.category || '',
    description: record?.description || '',
    amount: record?.amount || 0,
    cash_on_bank: record?.cash_on_bank || 0,
    cash_on_hand: record?.cash_on_hand || 0,
    total_savings: record?.total_savings || 0,
    verification_method: record?.verification_method || 'receipt',
    is_profit_share: record?.is_profit_share || false,
    profit_share_period: record?.profit_share_period || '',
    recorded_by: record?.recorded_by || '',
    archived: record?.archived || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
               type === 'number' ? parseFloat(value) || 0 : value
    }));
  };

  const recordTypeCategories = {
    income: ['Sales', 'Donations', 'Grants', 'Interest', 'Other Income'],
    expense: ['Materials', 'Labor', 'Transportation', 'Utilities', 'Maintenance', 'Other Expenses'],
    savings: ['Regular Savings', 'Emergency Fund', 'Investment Fund'],
    investment: ['Equipment', 'Infrastructure', 'Technology'],
    loan: ['Loan Receipt', 'Loan Payment']
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Project *
          </label>
          <select
            name="project_id"
            value={formData.project_id}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select a project</option>
            {projects.map(project => (
              <option key={project._id || project.id} value={project._id || project.id}>
                {project.enterpriseSetup?.projectName || 'Unknown Project'}
              </option>
            ))}
          </select>
        </div>

        {/* Record Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Record Date *
          </label>
          <input
            type="date"
            name="record_date"
            value={formData.record_date}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Record Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Record Type *
          </label>
          <select
            name="record_type"
            value={formData.record_type}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="income">Income</option>
            <option value="expense">Expense</option>
            <option value="savings">Savings</option>
            <option value="investment">Investment</option>
            <option value="loan">Loan</option>
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="">Select category</option>
            {recordTypeCategories[formData.record_type as keyof typeof recordTypeCategories]?.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
        </div>

        {/* Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Amount (₱) *
          </label>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleChange}
            required
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Verification Method */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Verification Method *
          </label>
          <select
            name="verification_method"
            value={formData.verification_method}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          >
            <option value="receipt">Receipt</option>
            <option value="invoice">Invoice</option>
            <option value="bank_statement">Bank Statement</option>
            <option value="oral">Oral Confirmation</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Cash on Hand */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cash on Hand (₱)
          </label>
          <input
            type="number"
            name="cash_on_hand"
            value={formData.cash_on_hand}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Cash on Bank */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cash on Bank (₱)
          </label>
          <input
            type="number"
            name="cash_on_bank"
            value={formData.cash_on_bank}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Total Savings */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Total Savings (₱)
          </label>
          <input
            type="number"
            name="total_savings"
            value={formData.total_savings}
            onChange={handleChange}
            min="0"
            step="0.01"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
          />
        </div>

        {/* Recorded By */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recorded By *
          </label>
          <input
            type="text"
            name="recorded_by"
            value={formData.recorded_by}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            placeholder="Enter your name"
          />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Description *
        </label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
          placeholder="Enter transaction description..."
        />
      </div>

      {/* Profit Share Section */}
      <div className="border-t pt-6">
        <div className="flex items-center mb-4">
          <input
            type="checkbox"
            name="is_profit_share"
            checked={formData.is_profit_share}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
          />
          <label className="ml-2 block text-sm font-medium text-gray-700">
            This is a profit share distribution
          </label>
        </div>

        {formData.is_profit_share && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profit Share Period
            </label>
            <input
              type="text"
              name="profit_share_period"
              value={formData.profit_share_period}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="e.g., 2024-Q1, 2024-01"
            />
          </div>
        )}
      </div>

      {/* Form Actions */}
      <div className="flex justify-end space-x-3 pt-6 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-6 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
        >
          {record ? 'Update Record' : 'Create Record'}
        </button>
      </div>
    </form>
  );
}