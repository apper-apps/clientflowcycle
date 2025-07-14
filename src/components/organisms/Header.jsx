import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import ThemeToggle from "@/components/molecules/ThemeToggle";
import ApperIcon from "@/components/ApperIcon";
import { useSidebar } from "@/hooks/useSidebar";
import ProjectModal from "@/components/molecules/ProjectModal";
import * as notificationService from "@/services/api/notificationService";
import { toast } from "react-toastify";

const Header = () => {
  const navigate = useNavigate();
const { toggleSidebar } = useSidebar();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  // Fetch notifications and unread count
  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const response = await notificationService.getAll({ limit: 5 });
      setNotifications(response);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const count = await notificationService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error("Error fetching unread count:", error);
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      fetchNotifications();
      fetchUnreadCount();
      toast.success("Notification marked as read");
    } catch (error) {
      toast.error("Failed to mark notification as read");
    }
  };

  const handleProjectSubmit = async (projectData) => {
    // Modal handles the submission and toast notifications
    setIsProjectModalOpen(false);
  };
  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 lg:px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSidebar}
            className="lg:hidden p-2"
          >
            <ApperIcon name="Menu" size={20} />
          </Button>
          
          <div className="lg:hidden flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
              <ApperIcon name="Briefcase" size={16} className="text-white" />
            </div>
            <h1 className="text-lg font-bold bg-gradient-to-r from-primary-600 to-secondary-600 bg-clip-text text-transparent">
              ClientFlow Pro
            </h1>
          </div>
        </div>
<div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative hidden sm:block">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setIsNotificationOpen(!isNotificationOpen)}
              className="relative"
            >
              <ApperIcon name="Bell" size={18} className="text-gray-600 dark:text-gray-300" />
              {unreadCount > 0 && (
                <Badge 
                  variant="danger" 
                  className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center text-xs"
                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Badge>
              )}
            </Button>
            
            {/* Notification Dropdown */}
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Notifications
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => navigate('/notifications')}
                      className="text-primary-600 hover:text-primary-700"
                    >
                      View All
                    </Button>
                  </div>
                </div>
                
                <div className="max-h-96 overflow-y-auto">
                  {loading ? (
                    <div className="p-4 text-center">
                      <ApperIcon name="Loader2" size={20} className="animate-spin mx-auto text-gray-400" />
                      <p className="text-sm text-gray-500 mt-2">Loading notifications...</p>
                    </div>
                  ) : notifications.length === 0 ? (
                    <div className="p-4 text-center">
                      <ApperIcon name="Bell" size={24} className="mx-auto text-gray-400 mb-2" />
                      <p className="text-sm text-gray-500">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.map((notification) => (
                      <div
                        key={notification.Id}
                        className={`p-4 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer ${
                          !notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                        onClick={() => {
                          if (!notification.isRead) {
                            handleMarkAsRead(notification.Id);
                          }
                          setIsNotificationOpen(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 rounded-full mt-2 ${
                            !notification.isRead ? 'bg-blue-500' : 'bg-gray-300'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.type === 'TaskAssigned' ? 'Task Assigned' : 
                               notification.type === 'InvoiceOverdue' ? 'Invoice Overdue' : 
                               notification.type}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-400 mt-1">
                              {new Date(notification.CreatedOn).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {notifications.length > 0 && (
                  <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={async () => {
                        try {
                          await notificationService.markAllAsRead();
                          fetchNotifications();
                          fetchUnreadCount();
                          toast.success("All notifications marked as read");
                        } catch (error) {
                          toast.error("Failed to mark all notifications as read");
                        }
                      }}
                      className="w-full justify-center"
                    >
                      Mark All as Read
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
          <ThemeToggle />
          
          <Button 
            variant="primary" 
            size="sm" 
            className="hidden sm:flex"
            onClick={() => setIsProjectModalOpen(true)}
          >
            <ApperIcon name="Plus" size={16} className="mr-2" />
            New Project
          </Button>

          <Button 
            variant="outline" 
            size="sm" 
            className="hidden sm:flex"
            onClick={async () => {
              try {
                const { ApperUI } = window.ApperSDK;
                await ApperUI.logout();
                window.location.href = '/login';
              } catch (error) {
                console.error("Logout failed:", error);
              }
            }}
          >
            <ApperIcon name="LogOut" size={16} className="mr-2" />
            Logout
          </Button>
        </div>
      </div>
      
      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onSubmit={handleProjectSubmit}
      />
    </header>
  );
};

export default Header;