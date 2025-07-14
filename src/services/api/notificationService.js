import { toast } from 'react-toastify';

// Helper function to add delay for better UX
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAll = async (params = {}) => {
  try {
    await delay(300);
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const queryParams = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "user_id" } },
        { field: { Name: "message" } },
        { field: { Name: "type" } },
        { field: { Name: "isRead" } },
        { field: { Name: "project_id" } },
        { field: { Name: "task_id" } },
        { field: { Name: "client_id" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "ModifiedBy" } }
      ],
      orderBy: [
        {
          fieldName: "CreatedOn",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: params.limit || 20,
        offset: params.offset || 0
      }
    };

    // Add filtering if provided
    if (params.isRead !== undefined) {
      queryParams.where = [
        {
          FieldName: "isRead",
          Operator: "EqualTo",
          Values: [params.isRead]
        }
      ];
    }

    if (params.type) {
      if (!queryParams.where) queryParams.where = [];
      queryParams.where.push({
        FieldName: "type",
        Operator: "EqualTo",
        Values: [params.type]
      });
    }

    const response = await apperClient.fetchRecords('app_Notification', queryParams);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return [];
    }

    return response.data || [];
  } catch (error) {
    console.error("Error fetching notifications:", error);
    toast.error("Failed to fetch notifications");
    throw error;
  }
};

export const getById = async (id) => {
  try {
    await delay(200);
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "user_id" } },
        { field: { Name: "message" } },
        { field: { Name: "type" } },
        { field: { Name: "isRead" } },
        { field: { Name: "project_id" } },
        { field: { Name: "task_id" } },
        { field: { Name: "client_id" } },
        { field: { Name: "CreatedOn" } },
        { field: { Name: "CreatedBy" } },
        { field: { Name: "ModifiedOn" } },
        { field: { Name: "ModifiedBy" } }
      ]
    };

    const response = await apperClient.getRecordById('app_Notification', id, params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    return response.data;
  } catch (error) {
    console.error(`Error fetching notification with ID ${id}:`, error);
    toast.error("Failed to fetch notification");
    throw error;
  }
};

export const create = async (notificationData) => {
  try {
    await delay(300);
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Only include updateable fields
    const params = {
      records: [
        {
          Name: notificationData.Name || 'New Notification',
          user_id: notificationData.user_id,
          message: notificationData.message,
          type: notificationData.type,
          isRead: notificationData.isRead || false,
          project_id: notificationData.project_id || null,
          task_id: notificationData.task_id || null,
          client_id: notificationData.client_id || null
        }
      ]
    };

    const response = await apperClient.createRecord('app_Notification', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successfulRecords = response.results.filter(result => result.success);
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} notifications:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulRecords.length > 0) {
        toast.success("Notification created successfully");
        return successfulRecords[0].data;
      }
    }

    return null;
  } catch (error) {
    console.error("Error creating notification:", error);
    toast.error("Failed to create notification");
    throw error;
  }
};

export const update = async (id, notificationData) => {
  try {
    await delay(300);
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Only include updateable fields
    const params = {
      records: [
        {
          Id: id,
          Name: notificationData.Name,
          user_id: notificationData.user_id,
          message: notificationData.message,
          type: notificationData.type,
          isRead: notificationData.isRead,
          project_id: notificationData.project_id,
          task_id: notificationData.task_id,
          client_id: notificationData.client_id
        }
      ]
    };

    const response = await apperClient.updateRecord('app_Notification', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return null;
    }

    if (response.results) {
      const successfulUpdates = response.results.filter(result => result.success);
      const failedUpdates = response.results.filter(result => !result.success);
      
      if (failedUpdates.length > 0) {
        console.error(`Failed to update ${failedUpdates.length} notifications:${JSON.stringify(failedUpdates)}`);
        
        failedUpdates.forEach(record => {
          record.errors?.forEach(error => {
            toast.error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulUpdates.length > 0) {
        toast.success("Notification updated successfully");
        return successfulUpdates[0].data;
      }
    }

    return null;
  } catch (error) {
    console.error("Error updating notification:", error);
    toast.error("Failed to update notification");
    throw error;
  }
};

export const deleteRecord = async (id) => {
  try {
    await delay(300);
    
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    const params = {
      RecordIds: [id]
    };

    const response = await apperClient.deleteRecord('app_Notification', params);
    
    if (!response.success) {
      console.error(response.message);
      toast.error(response.message);
      return false;
    }

    if (response.results) {
      const successfulDeletions = response.results.filter(result => result.success);
      const failedDeletions = response.results.filter(result => !result.success);
      
      if (failedDeletions.length > 0) {
        console.error(`Failed to delete ${failedDeletions.length} notifications:${JSON.stringify(failedDeletions)}`);
        
        failedDeletions.forEach(record => {
          if (record.message) toast.error(record.message);
        });
      }
      
      if (successfulDeletions.length > 0) {
        toast.success("Notification deleted successfully");
        return true;
      }
    }

    return false;
  } catch (error) {
    console.error("Error deleting notification:", error);
    toast.error("Failed to delete notification");
    throw error;
  }
};

// Mark notification as read
export const markAsRead = async (id) => {
  try {
    const notification = await getById(id);
    if (!notification) return false;

    return await update(id, {
      ...notification,
      isRead: true
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

// Mark notification as unread
export const markAsUnread = async (id) => {
  try {
    const notification = await getById(id);
    if (!notification) return false;

    return await update(id, {
      ...notification,
      isRead: false
    });
  } catch (error) {
    console.error("Error marking notification as unread:", error);
    throw error;
  }
};

// Get unread notifications count
export const getUnreadCount = async () => {
  try {
    const unreadNotifications = await getAll({ isRead: false });
    return unreadNotifications.length;
  } catch (error) {
    console.error("Error getting unread count:", error);
    return 0;
  }
};

// Mark all notifications as read
export const markAllAsRead = async () => {
  try {
    const unreadNotifications = await getAll({ isRead: false });
    
    if (unreadNotifications.length === 0) {
      return true;
    }

    const updatePromises = unreadNotifications.map(notification => 
      update(notification.Id, {
        ...notification,
        isRead: true
      })
    );

    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};