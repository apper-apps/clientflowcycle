import { getAllTasks, getTaskTimeLogs, startTaskTimer, stopTaskTimer } from "@/services/api/taskService";

export const startTimer = async (taskId) => {
  try {
    const timerData = await startTaskTimer(taskId);
    return timerData;
  } catch (error) {
    throw new Error(`Failed to start timer: ${error.message}`);
  }
};

export const stopTimer = async (taskId) => {
  try {
    const timeLog = await stopTaskTimer(taskId);
    return timeLog;
  } catch (error) {
    throw new Error(`Failed to stop timer: ${error.message}`);
  }
};

export const getActiveTimer = async (taskId) => {
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
        { field: { Name: "date" } },
        { field: { Name: "task_id" } }
      ],
      where: [
        {
          FieldName: "task_id",
          Operator: "EqualTo",
          Values: [parseInt(taskId)]
        },
        {
          FieldName: "end_time",
          Operator: "DoesNotHaveValue",
          Values: []
        }
      ],
      orderBy: [
        {
          fieldName: "start_time",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: 1,
        offset: 0
      }
    };

    const response = await apperClient.fetchRecords("time_log", params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }

    if (!response.data || response.data.length === 0) {
      return null;
    }

    return response.data[0];
  } catch (error) {
if (error?.response?.data?.message) {
      console.error("Error getting active timer:", error?.response?.data?.message);
      throw new Error(error?.response?.data?.message);
    } else {
      console.error("Error getting active timer:", error);
      throw new Error(`Failed to get active timer: ${error.message}`);
    }
  }
};

export const getTimeLogs = async (taskId) => {
  try {
    const timeLogs = await getTaskTimeLogs(taskId);
    return timeLogs;
  } catch (error) {
    throw new Error(`Failed to get time logs: ${error.message}`);
  }
};

export const getProjectTimeTracking = async (projectId) => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // First get all tasks for the project
    const taskParams = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "title" } }
      ],
      where: [
        {
          FieldName: "project_id",
          Operator: "EqualTo",
          Values: [parseInt(projectId)]
        }
      ]
    };

    const taskResponse = await apperClient.fetchRecords("task", taskParams);
    
    if (!taskResponse.success) {
      console.error(taskResponse.message);
      throw new Error(taskResponse.message);
    }

    const projectTasks = taskResponse.data || [];
    const taskIds = projectTasks.map(task => task.Id);

    if (taskIds.length === 0) {
      return {
        totalTime: 0,
        activeTimers: 0,
        totalEntries: 0,
        timeLogs: []
      };
    }

    // Get all time logs for project tasks
    const timeLogParams = {
      fields: [
        { field: { Name: "start_time" } },
        { field: { Name: "end_time" } },
        { field: { Name: "duration" } },
        { field: { Name: "date" } },
        { field: { Name: "task_id" } }
      ],
      where: [
        {
          FieldName: "task_id",
          Operator: "ExactMatch",
          Values: taskIds
        }
      ],
      orderBy: [
        {
          fieldName: "start_time",
          sorttype: "DESC"
        }
      ]
    };

    const timeResponse = await apperClient.fetchRecords("time_log", timeLogParams);
    
    if (!timeResponse.success) {
      console.error(timeResponse.message);
      throw new Error(timeResponse.message);
    }

    const timeLogs = timeResponse.data || [];
    let totalTime = 0;
    let activeTimers = 0;
    const processedLogs = [];

    timeLogs.forEach(log => {
      if (log.duration) {
        totalTime += log.duration;
      }
      
      if (!log.end_time) {
        activeTimers++;
      }

      const task = projectTasks.find(t => t.Id === log.task_id);
      processedLogs.push({
        ...log,
        taskTitle: task?.title || `Task ${log.task_id}`
      });
    });

    return {
      totalTime,
      activeTimers,
      totalEntries: timeLogs.length,
      timeLogs: processedLogs.slice(0, 10)
    };
  } catch (error) {
if (error?.response?.data?.message) {
      console.error("Error getting project time tracking:", error?.response?.data?.message);
      throw new Error(error?.response?.data?.message);
    } else {
      console.error("Error getting project time tracking:", error);
      throw new Error(`Failed to get project time tracking: ${error.message}`);
    }
}
};

export const getAllTimeTracking = async () => {
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });

    // Get all time logs
    const timeLogParams = {
      fields: [
        { field: { Name: "start_time" } },
        { field: { Name: "end_time" } },
        { field: { Name: "duration" } },
        { field: { Name: "date" } },
        { field: { Name: "task_id" } }
      ],
      orderBy: [
        {
          fieldName: "start_time",
          sorttype: "DESC"
        }
      ]
    };

    const timeResponse = await apperClient.fetchRecords("time_log", timeLogParams);
    
    if (!timeResponse.success) {
      console.error(timeResponse.message);
      throw new Error(timeResponse.message);
    }

    // Get all tasks for task titles
    const taskParams = {
      fields: [
        { field: { Name: "Id" } },
        { field: { Name: "title" } },
        { field: { Name: "project_id" } }
      ]
    };

    const taskResponse = await apperClient.fetchRecords("task", taskParams);
    
    if (!taskResponse.success) {
      console.error(taskResponse.message);
      throw new Error(taskResponse.message);
    }

    const tasks = taskResponse.data || [];
    const timeLogs = timeResponse.data || [];
    
    const summary = {
      totalTime: 0,
      activeTimers: 0,
      totalEntries: timeLogs.length,
      taskBreakdown: []
    };

    // Create task breakdown map
    const taskBreakdownMap = new Map();

    timeLogs.forEach(log => {
      if (log.duration) {
        summary.totalTime += log.duration;
      }
      
      if (!log.end_time) {
        summary.activeTimers++;
      }

      // Build task breakdown
      const taskId = log.task_id;
      if (!taskBreakdownMap.has(taskId)) {
        const task = tasks.find(t => t.Id === taskId);
        taskBreakdownMap.set(taskId, {
          taskId,
          taskTitle: task?.title || `Task ${taskId}`,
          projectId: task?.project_id || 'Unknown',
          totalTime: 0,
          hasActiveTimer: false,
          entryCount: 0
        });
      }

      const taskBreakdown = taskBreakdownMap.get(taskId);
      if (log.duration) {
        taskBreakdown.totalTime += log.duration;
      }
      if (!log.end_time) {
        taskBreakdown.hasActiveTimer = true;
      }
      taskBreakdown.entryCount++;
    });

    // Convert map to array and sort by total time
    summary.taskBreakdown = Array.from(taskBreakdownMap.values())
      .sort((a, b) => b.totalTime - a.totalTime);

    return summary;
  } catch (error) {
if (error?.response?.data?.message) {
      console.error("Error getting all time tracking data:", error?.response?.data?.message);
      throw new Error(error?.response?.data?.message);
    } else {
      console.error("Error getting all time tracking data:", error);
      throw new Error(`Failed to get all time tracking data: ${error.message}`);
    }
}
};