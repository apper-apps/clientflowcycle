import React from "react";
import StatCard from "@/components/molecules/StatCard";

const DashboardStats = ({ data }) => {
  // Transform real-time data into stats format
  const stats = data?.summary ? [
    {
      title: "Total Clients",
      value: data.summary.totalClients?.toString() || "0",
      change: "+12%",
      changeType: "positive",
      icon: "Users",
      delay: 0
    },
    {
      title: "Active Projects",
      value: data.summary.activeProjects?.toString() || "0",
      change: "+2 this week",
      changeType: "positive",
      icon: "FolderOpen",
      delay: 0.1
    },
    {
      title: "Pending Tasks",
      value: data.summary.pendingTasks?.toString() || "0",
      change: "-8 from yesterday",
      changeType: "negative",
      icon: "CheckSquare",
      delay: 0.2
    },
    {
      title: "Monthly Revenue",
      value: data.summary.monthlyRevenue ? `$${data.summary.monthlyRevenue.toLocaleString()}` : "$0",
      change: "+18%",
      changeType: "positive",
      icon: "DollarSign",
      delay: 0.3
    },
    {
      title: "Completed Tasks",
      value: data.summary.completedTasks?.toString() || "0",
      change: "+24 this week",
      changeType: "positive",
      icon: "CheckCircle2",
      delay: 0.4
    },
    {
      title: "Overdue Items",
      value: data.summary.overdueItems?.toString() || "0",
      change: "2 urgent",
      changeType: "neutral",
      icon: "AlertTriangle",
      delay: 0.5
    }
  ] : [];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {stats.map((stat, index) => (
        <StatCard
          key={index}
          title={stat.title}
          value={stat.value}
          change={stat.change}
          changeType={stat.changeType}
          icon={stat.icon}
          gradient={index % 2 === 0}
          delay={stat.delay}
        />
      ))}
    </div>
  );
};

export default DashboardStats;