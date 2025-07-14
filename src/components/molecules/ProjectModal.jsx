import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Modal from '@/components/atoms/Modal';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import { getAllClients } from '@/services/api/clientService';

const ProjectModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  project = null,
  title = "Create New Project"
}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    clientId: '',
    status: 'planning',
    budget: '',
    startDate: '',
    endDate: ''
  });
  
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(false);
  const [errors, setErrors] = useState({});

  // Load clients when modal opens
  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  // Populate form when editing existing project
  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name || '',
        description: project.description || '',
        clientId: project.clientId || '',
        status: project.status || 'planning',
        budget: project.budget || '',
        startDate: project.startDate || '',
        endDate: project.endDate || ''
      });
    } else {
      setFormData({
        name: '',
        description: '',
        clientId: '',
        status: 'planning',
        budget: '',
        startDate: '',
        endDate: ''
      });
    }
    setErrors({});
  }, [project]);

  const loadClients = async () => {
    try {
      setLoadingClients(true);
      const clientsData = await getAllClients();
      setClients(clientsData || []);
    } catch (error) {
      console.error('Failed to load clients:', error);
      toast.error('Failed to load clients');
      setClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Project name is required';
    }

    if (!formData.clientId) {
      newErrors.clientId = 'Client selection is required';
    }

    if (formData.budget && isNaN(parseFloat(formData.budget))) {
      newErrors.budget = 'Budget must be a valid number';
    }

    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end <= start) {
        newErrors.endDate = 'End date must be after start date';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setLoading(true);
      
      const projectData = {
        ...formData,
        budget: formData.budget ? parseFloat(formData.budget) : null,
        id: project?.id
      };

      await onSubmit(projectData);
      onClose();
      toast.success(project ? 'Project updated successfully' : 'Project created successfully');
    } catch (error) {
      console.error('Failed to save project:', error);
      toast.error(error.message || 'Failed to save project');
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'planning', label: 'Planning', variant: 'secondary' },
    { value: 'active', label: 'Active', variant: 'primary' },
    { value: 'on-hold', label: 'On Hold', variant: 'warning' },
    { value: 'completed', label: 'Completed', variant: 'success' }
  ];

const getClientName = (clientId) => {
    const client = clients.find(c => c.Id === parseInt(clientId));
    return client ? client.name : 'Unknown Client';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Project Name *
          </label>
          <Input
            name="name"
            type="text"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Enter project name"
            error={errors.name}
            required
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Enter project description"
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                     focus:ring-2 focus:ring-primary-500 focus:border-transparent
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     placeholder-gray-500 dark:placeholder-gray-400 resize-none"
          />
        </div>

        {/* Client Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Client *
          </label>
          {loadingClients ? (
            <div className="animate-pulse bg-gray-200 dark:bg-gray-700 h-12 rounded-lg"></div>
          ) : (
            <select
              name="clientId"
              value={formData.clientId}
              onChange={handleInputChange}
              className={`w-full px-4 py-3 border rounded-lg 
                        focus:ring-2 focus:ring-primary-500 focus:border-transparent
                        bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                        ${errors.clientId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
              required
            >
<option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.Id} value={client.Id}>
                  {client.name}
                </option>
              ))}
            </select>
          )}
          {errors.clientId && (
            <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.clientId}</p>
          )}
        </div>

{/* Status and Budget Row */}
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Status */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                       focus:ring-2 focus:ring-primary-500 focus:border-transparent
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Budget
            </label>
            <Input
              name="budget"
              type="number"
              value={formData.budget}
              onChange={handleInputChange}
              placeholder="0.00"
              error={errors.budget}
              min="0"
              step="0.01"
            />
          </div>
        </div>

{/* Date Range */}
        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Start Date
            </label>
            <Input
              name="startDate"
              type="date"
              value={formData.startDate}
              onChange={handleInputChange}
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              End Date
            </label>
            <Input
              name="endDate"
              type="date"
              value={formData.endDate}
              onChange={handleInputChange}
              error={errors.endDate}
              min={formData.startDate}
            />
          </div>
        </div>

        {/* Preview Selected Client */}
        {formData.clientId && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Selected Client
            </h4>
            <p className="text-gray-900 dark:text-white">{getClientName(formData.clientId)}</p>
          </div>
        )}

{/* Form Actions */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={loading}
            disabled={loading}
            className="w-full sm:w-auto order-1 sm:order-2"
          >
            {project ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProjectModal;