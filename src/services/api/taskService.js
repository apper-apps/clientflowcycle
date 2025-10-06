const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * DATA ACCESS POLICY: Task Visibility
 * 
 * All authenticated users can view ALL tasks in the system, regardless of who created them.
 * This policy promotes transparency and collaboration across the team.
 * 
 * - No user-specific WHERE conditions are applied
 * - Both 'created_by_user_id' and 'assigned_to' fields are retrieved and displayed
 * - Authentication is automatically handled by ApperClient SDK
 * - Row-level security (if needed) should be configured at the database/platform level
 * 
 * This is an intentional design decision, not a security oversight.
 */
export const getAllTasks = async (page = 1, limit = 10) => {
  try {
    const { ApperClient } = window.ApperSDK;

    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description"}},
        {"field": {"Name": "status"}},
        {"field": {"Name": "priority"}},
        {"field": {"Name": "due_date"}},
        {"field": {"Name": "project_id"}},
        {"field": {"Name": "total_time"}},
        {"field": {"Name": "created_by_user_id"}},
        {"field": {"Name": "assigned_to"}}
      ],
      pagingInfo: {
        limit: limit,
        offset: (page - 1) * limit
      }
    };
const response = await apperClient.fetchRecords('task', params);
    
    if (!response.success) {
      console.error(response.message);
      return { data: [], total: 0 };
    }

    const transformedData = response.data?.map(task => ({
      id: task.Id,
      taskId: task.Id,
      title: task.title || task.Name,
      projectId: task.project_id?.toString(),
      createdBy: task.created_by_user_id?.Name || 'Unknown',
      assignedTo: task.assigned_to?.Name || 'Unassigned',
      timeTracking: {
        totalTime: task.total_time || 0,
        activeTimer: task.active_timer_start_time ? {
          Id: task.Id,
          startTime: task.active_timer_start_time
        } : null,
        timeLogs: []
      }
}));
    
    return {
      data: transformedData,
      total: response.total || 0,
      page: page,
      limit: limit,
      totalPages: Math.ceil((response.total || 0) / limit)
    };
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
};

export const getTaskById = async (id) => {
  try {
    const { ApperClient } = window.ApperSDK;

    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    
    const params = {
      fields: [
        {"field": {"Name": "Id"}},
        {"field": {"Name": "Name"}},
        {"field": {"Name": "description"}},
        {"field": {"Name": "status"}},
        {"field": {"Name": "priority"}},
        {"field": {"Name": "due_date"}},
        {"field": {"Name": "project_id"}},
        {"field": {"Name": "total_time"}},
        {"field": {"Name": "created_by_user_id"}},
        {"field": {"Name": "assigned_to"}}
      ]
    };
    
    const response = await apperClient.getRecordById('task', parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    const task = response.data;
    return {
      ...task,
title: task.title || task.Name,
      projectId: task.project_id?.toString(),
      createdBy: task.created_by_user_id?.Name || 'Unknown',
      assignedTo: task.assigned_to?.Name || 'Unassigned',
      timeTracking: {
        totalTime: task.total_time || 0,
        activeTimer: task.active_timer_start_time ? {
          Id: task.Id,
          startTime: task.active_timer_start_time
        } : null,
        timeLogs: []
      }
    };
  } catch (error) {
    console.error("Error fetching task:", error);
    throw error;
  }
};

export const createTask = async (taskData) => {
  await delay(300);
  
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Only include updateable fields
    const params = {
      records: [{
        Name: taskData.title,
        title: taskData.title,
        priority: taskData.priority || 'medium',
        status: taskData.status || 'todo',
        dueDate: taskData.dueDate,
        total_time: 0,
        project_id: parseInt(taskData.projectId)
      }]
    };
    
    const response = await apperClient.createRecord('task', params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to create ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            throw new Error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) throw new Error(record.message);
        });
      }
      
      const successfulRecords = response.results.filter(result => result.success);
      const task = successfulRecords[0]?.data;
      return {
        ...task,
        title: task.title || task.Name,
        projectId: task.project_id?.toString(),
        timeTracking: {
          totalTime: 0,
          activeTimer: null,
          timeLogs: []
        }
      };
    }
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

export const updateTask = async (id, taskData) => {
  await delay(250);
  
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Only include updateable fields
    const updateData = {
      Id: parseInt(id)
    };
    
    if (taskData.title) updateData.title = taskData.title;
    if (taskData.priority) updateData.priority = taskData.priority;
    if (taskData.status) updateData.status = taskData.status;
    if (taskData.dueDate) updateData.dueDate = taskData.dueDate;
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord('task', params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to update ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          record.errors?.forEach(error => {
            throw new Error(`${error.fieldLabel}: ${error.message}`);
          });
          if (record.message) throw new Error(record.message);
        });
      }
      
      const successfulRecords = response.results.filter(result => result.success);
      const task = successfulRecords[0]?.data;
      return {
        ...task,
        title: task.title || task.Name,
        projectId: task.project_id?.toString(),
        timeTracking: {
          totalTime: task.total_time || 0,
          activeTimer: task.active_timer_start_time ? {
            Id: task.Id,
            startTime: task.active_timer_start_time
          } : null,
          timeLogs: []
        }
      };
    }
  } catch (error) {
    console.error("Error updating task:", error);
    throw error;
  }
};

export const updateTaskStatus = async (id, status) => {
  return updateTask(id, { status });
};

export const deleteTask = async (id) => {
  await delay(200);
  
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      RecordIds: [parseInt(id)]
    };
    
    const response = await apperClient.deleteRecord('task', params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    if (response.results) {
      const failedRecords = response.results.filter(result => !result.success);
      
      if (failedRecords.length > 0) {
        console.error(`Failed to delete ${failedRecords.length} records:${JSON.stringify(failedRecords)}`);
        
        failedRecords.forEach(record => {
          if (record.message) throw new Error(record.message);
        });
      }
      
      return true;
    }
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
};

export const startTaskTimer = async (id) => {
  await delay(200);
  
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const now = new Date().toISOString();
    
    const params = {
      records: [{
        Id: parseInt(id),
        active_timer_start_time: now
      }]
    };
    
    const response = await apperClient.updateRecord('task', params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    return {
      Id: parseInt(id),
      startTime: now
    };
  } catch (error) {
    console.error("Error starting timer:", error);
    throw error;
  }
};

export const stopTaskTimer = async (id) => {
  await delay(200);
  
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // First get the current task to get the start time
    const task = await getTaskById(id);
    
    if (!task.timeTracking?.activeTimer) {
      throw new Error("No active timer for this task");
    }
    
    const now = new Date().toISOString();
    const startTime = new Date(task.timeTracking.activeTimer.startTime);
    const endTime = new Date(now);
    const duration = endTime.getTime() - startTime.getTime();
    const newTotalTime = (task.timeTracking.totalTime || 0) + duration;
    
    // Update the task to clear the timer and add the time
    const params = {
      records: [{
        Id: parseInt(id),
        active_timer_start_time: null,
        total_time: newTotalTime
      }]
    };
    
    const response = await apperClient.updateRecord('task', params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    // Create time log entry
    const timeLogParams = {
      records: [{
        Name: `Time Log for Task ${id}`,
        start_time: task.timeTracking.activeTimer.startTime,
        end_time: now,
        duration: duration,
        date: startTime.toISOString().split('T')[0],
        task_id: parseInt(id)
      }]
    };
    
    await apperClient.createRecord('time_log', timeLogParams);
    
    return {
      Id: Date.now(), // Mock ID for the time log
      startTime: task.timeTracking.activeTimer.startTime,
      endTime: now,
      duration: duration,
      date: startTime.toISOString().split('T')[0]
    };
  } catch (error) {
    console.error("Error stopping timer:", error);
    throw error;
  }
};

export const getTaskTimeLogs = async (id) => {
  await delay(150);
  
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "start_time" } },
        { field: { Name: "end_time" } },
        { field: { Name: "duration" } },
        { field: { Name: "date" } }
      ],
      where: [
        {
          FieldName: "task_id",
          Operator: "EqualTo",
          Values: [parseInt(id)]
        }
      ]
    };
    
    const response = await apperClient.fetchRecords('time_log', params);
    
    if (!response.success) {
      console.error(response.message);
      return [];
    }
    
    return (response.data || []).map(log => ({
      Id: log.Id,
      startTime: log.start_time,
      endTime: log.end_time,
      duration: log.duration,
      date: log.date
    }));
  } catch (error) {
    console.error("Error fetching time logs:", error);
    return [];
  }
};