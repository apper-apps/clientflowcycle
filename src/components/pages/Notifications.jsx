import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Input from '@/components/atoms/Input';
import Card from '@/components/atoms/Card';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Empty from '@/components/ui/Empty';
import ApperIcon from '@/components/ApperIcon';
import * as notificationService from '@/services/api/notificationService';

const Notifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, read, unread
  const [filterType, setFilterType] = useState('all'); // all, TaskAssigned, InvoiceOverdue
  const [selectedIds, setSelectedIds] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);

  useEffect(() => {
    fetchNotifications();
  }, [currentPage, filterStatus, filterType]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = {
        offset: (currentPage - 1) * itemsPerPage,
        limit: itemsPerPage
      };

      if (filterStatus !== 'all') {
        params.isRead = filterStatus === 'read';
      }

      if (filterType !== 'all') {
        params.type = filterType;
      }

      const data = await notificationService.getAll(params);
      setNotifications(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      fetchNotifications();
      toast.success('Notification marked as read');
    } catch (error) {
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAsUnread = async (id) => {
    try {
      await notificationService.markAsUnread(id);
      fetchNotifications();
      toast.success('Notification marked as unread');
    } catch (error) {
      toast.error('Failed to mark notification as unread');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await notificationService.deleteRecord(id);
      fetchNotifications();
      toast.success('Notification deleted successfully');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  const handleBulkMarkAsRead = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Please select notifications to mark as read');
      return;
    }

    try {
      const promises = selectedIds.map(id => notificationService.markAsRead(id));
      await Promise.all(promises);
      setSelectedIds([]);
      fetchNotifications();
      toast.success(`${selectedIds.length} notifications marked as read`);
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.warning('Please select notifications to delete');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedIds.length} notifications?`)) {
      return;
    }

    try {
      const promises = selectedIds.map(id => notificationService.deleteRecord(id));
      await Promise.all(promises);
      setSelectedIds([]);
      fetchNotifications();
      toast.success(`${selectedIds.length} notifications deleted successfully`);
    } catch (error) {
      toast.error('Failed to delete notifications');
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredNotifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredNotifications.map(n => n.Id));
    }
  };

  const handleSelectNotification = (id) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(selectedId => selectedId !== id)
        : [...prev, id]
    );
  };

  // Filter notifications based on search term
  const filteredNotifications = notifications.filter(notification =>
    notification.message?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    notification.type?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TaskAssigned':
        return 'CheckSquare';
      case 'InvoiceOverdue':
        return 'AlertTriangle';
      default:
        return 'Bell';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'TaskAssigned':
        return 'primary';
      case 'InvoiceOverdue':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (loading && notifications.length === 0) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={fetchNotifications} />;
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Notifications
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Manage your notifications and stay updated
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            variant="outline"
            onClick={async () => {
              try {
                await notificationService.markAllAsRead();
                fetchNotifications();
                toast.success('All notifications marked as read');
              } catch (error) {
                toast.error('Failed to mark all notifications as read');
              }
            }}
          >
            <ApperIcon name="CheckCheck" size={16} className="mr-2" />
            Mark All Read
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card className="p-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <ApperIcon 
                name="Search" 
                size={20} 
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" 
              />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="unread">Unread</option>
              <option value="read">Read</option>
            </select>

            <select
              value={filterType}
              onChange={(e) => {
                setFilterType(e.target.value);
                setCurrentPage(1);
              }}
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="all">All Types</option>
              <option value="TaskAssigned">Task Assigned</option>
              <option value="InvoiceOverdue">Invoice Overdue</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Bulk Actions */}
      {selectedIds.length > 0 && (
        <Card className="p-4 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
          <div className="flex items-center justify-between">
            <span className="text-blue-700 dark:text-blue-300">
              {selectedIds.length} notification{selectedIds.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleBulkMarkAsRead}>
                <ApperIcon name="Check" size={16} className="mr-2" />
                Mark as Read
              </Button>
              <Button variant="outline" size="sm" onClick={handleBulkDelete}>
                <ApperIcon name="Trash2" size={16} className="mr-2" />
                Delete
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setSelectedIds([])}>
                Cancel
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Notifications List */}
      <Card>
        {filteredNotifications.length === 0 ? (
          <Empty 
            icon="Bell"
            title="No notifications found"
            description="You're all caught up! No notifications match your current filters."
          />
        ) : (
          <>
            {/* Header with Select All */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.length === filteredNotifications.length && filteredNotifications.length > 0}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                />
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Select All ({filteredNotifications.length})
                </span>
              </label>
            </div>

            {/* Notification Items */}
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredNotifications.map((notification) => (
                <div
                  key={notification.Id}
                  className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 ${
                    !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(notification.Id)}
                      onChange={() => handleSelectNotification(notification.Id)}
                      className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500 mt-1"
                    />

                    {/* Notification Icon */}
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      !notification.isRead 
                        ? 'bg-primary-100 dark:bg-primary-900/20' 
                        : 'bg-gray-100 dark:bg-gray-800'
                    }`}>
                      <ApperIcon 
                        name={getNotificationIcon(notification.type)} 
                        size={20} 
                        className={!notification.isRead ? 'text-primary-600' : 'text-gray-500'} 
                      />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant={getNotificationColor(notification.type)}>
                              {notification.type === 'TaskAssigned' ? 'Task Assigned' : 
                               notification.type === 'InvoiceOverdue' ? 'Invoice Overdue' : 
                               notification.type}
                            </Badge>
                            {!notification.isRead && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full" />
                            )}
                          </div>
                          <p className={`text-sm ${
                            !notification.isRead 
                              ? 'font-medium text-gray-900 dark:text-white' 
                              : 'text-gray-700 dark:text-gray-300'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {new Date(notification.CreatedOn).toLocaleString()}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 ml-4">
                          {!notification.isRead ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.Id)}
                              title="Mark as read"
                            >
                              <ApperIcon name="Check" size={16} />
                            </Button>
                          ) : (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleMarkAsUnread(notification.Id)}
                              title="Mark as unread"
                            >
                              <ApperIcon name="RotateCcw" size={16} />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(notification.Id)}
                            title="Delete notification"
                            className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <ApperIcon name="Trash2" size={16} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </Card>

      {/* Loading overlay */}
      {loading && notifications.length > 0 && (
        <div className="fixed inset-0 bg-black bg-opacity-25 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-xl">
            <div className="flex items-center gap-3">
              <ApperIcon name="Loader2" size={20} className="animate-spin text-primary-600" />
              <span className="text-gray-900 dark:text-white">Updating notifications...</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notifications;