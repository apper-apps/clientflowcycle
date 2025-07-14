const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getDashboardData = async () => {
  await delay(300);
  
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Fetch dashboard summary
    const summaryParams = {
      fields: [
        { field: { Name: "total_clients" } },
        { field: { Name: "active_projects" } },
        { field: { Name: "pending_tasks" } },
        { field: { Name: "monthly_revenue" } },
        { field: { Name: "completed_tasks" } },
        { field: { Name: "overdue_items" } }
      ]
    };
    
    const summaryResponse = await apperClient.fetchRecords('dashboard_summary', summaryParams);
    
    // Fetch recent activity
    const activityParams = {
      fields: [
        { field: { Name: "type" } },
        { field: { Name: "title" } },
        { field: { Name: "client" } },
        { field: { Name: "time" } },
        { field: { Name: "icon" } }
      ],
      orderBy: [
        {
          fieldName: "CreatedOn",
          sorttype: "DESC"
        }
      ],
      pagingInfo: {
        limit: 5,
        offset: 0
      }
    };
    
    const activityResponse = await apperClient.fetchRecords('recent_activity', activityParams);
    
    // Fetch quick stats
    const statsParams = {
      fields: [
        { field: { Name: "projects_this_week" } },
        { field: { Name: "tasks_completed" } },
        { field: { Name: "hours_tracked" } },
        { field: { Name: "invoices_sent" } }
      ]
    };
    
    const statsResponse = await apperClient.fetchRecords('quick_stats', statsParams);
    
    // Process responses
    let summary = {
      totalClients: 0,
      activeProjects: 0,
      pendingTasks: 0,
      monthlyRevenue: 0,
      completedTasks: 0,
      overdueItems: 0
    };
    
    if (summaryResponse.success && summaryResponse.data && summaryResponse.data.length > 0) {
      const summaryData = summaryResponse.data[0];
      summary = {
        totalClients: summaryData.total_clients || 0,
        activeProjects: summaryData.active_projects || 0,
        pendingTasks: summaryData.pending_tasks || 0,
        monthlyRevenue: summaryData.monthly_revenue || 0,
        completedTasks: summaryData.completed_tasks || 0,
        overdueItems: summaryData.overdue_items || 0
      };
    }
    
    let recentActivity = [];
    if (activityResponse.success && activityResponse.data) {
      recentActivity = activityResponse.data.map(activity => ({
        id: activity.Id,
        type: activity.type,
        title: activity.title,
        client: activity.client,
        time: activity.time,
        icon: activity.icon
      }));
    }
    
    let quickStats = {
      projectsThisWeek: 0,
      tasksCompleted: 0,
      hoursTracked: 0,
      invoicesSent: 0
    };
    
    if (statsResponse.success && statsResponse.data && statsResponse.data.length > 0) {
      const statsData = statsResponse.data[0];
      quickStats = {
        projectsThisWeek: statsData.projects_this_week || 0,
        tasksCompleted: statsData.tasks_completed || 0,
        hoursTracked: statsData.hours_tracked || 0,
        invoicesSent: statsData.invoices_sent || 0
      };
    }
    
    return {
      summary,
      recentActivity,
      quickStats
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    
    // Return fallback data if database queries fail
    return {
      summary: {
        totalClients: 0,
        activeProjects: 0,
        pendingTasks: 0,
        monthlyRevenue: 0,
        completedTasks: 0,
        overdueItems: 0
      },
      recentActivity: [],
      quickStats: {
        projectsThisWeek: 0,
        tasksCompleted: 0,
        hoursTracked: 0,
        invoicesSent: 0
      }
    };
  }
};