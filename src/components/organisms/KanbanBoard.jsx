import React, { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import ApperIcon from "@/components/ApperIcon";
import { updateTaskStatus } from "@/services/api/taskService";
import { startTimer, stopTimer, getActiveTimer } from "@/services/api/timeTrackingService";

const KanbanBoard = ({ tasks, onTaskUpdate, projectId = null }) => {
  const [draggedTask, setDraggedTask] = useState(null);
  const [activeTimers, setActiveTimers] = useState(new Map());
  const [currentTime, setCurrentTime] = useState(Date.now());

  const columns = [
    { id: "todo", title: "To Do", color: "bg-gray-500" },
    { id: "in-progress", title: "In Progress", color: "bg-blue-500" },
    { id: "review", title: "Review", color: "bg-yellow-500" },
    { id: "done", title: "Done", color: "bg-green-500" }
  ];

  const filteredTasks = projectId 
    ? tasks.filter(task => task.projectId === String(projectId))
    : tasks;

  const getTasksByStatus = (status) => {
    return filteredTasks.filter(task => task.status === status);
  };

  const getPriorityVariant = (priority) => {
    const variants = {
      low: "secondary",
      medium: "warning",
      high: "error"
    };
    return variants[priority] || "default";
  };

  const getPriorityIcon = (priority) => {
    const icons = {
      low: "ArrowDown",
      medium: "ArrowRight",
      high: "ArrowUp"
    };
    return icons[priority] || "Circle";
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (dueDate) => {
    return new Date(dueDate) < new Date();
  };

const handleDragStart = (start) => {
    const task = filteredTasks.find(t => t.Id === parseInt(start.draggableId));
    setDraggedTask(task);
  };

  const handleDragEnd = async (result) => {
    const { destination, source, draggableId } = result;
    setDraggedTask(null);

    if (!destination) return;

    if (destination.droppableId === source.droppableId) return;

    const taskId = parseInt(draggableId);
    const newStatus = destination.droppableId;
    
    // Get the task to check ownership
    const task = filteredTasks.find(t => t.Id === taskId);
    
    // Get current user from Redux store
    const state = window.__REDUX_STORE__?.getState();
    const currentUser = state?.user?.user;
    
    // Check if current user owns the task
    if (task && task.createdByUserId !== currentUser?.userId) {
      toast.error("You can only update status for your own tasks");
      return;
    }

    try {
      await updateTaskStatus(taskId, newStatus);
      onTaskUpdate && onTaskUpdate();
      toast.success("Task status updated successfully");
    } catch (error) {
      toast.error(error.message || "Failed to update task status");
    }
};

  // Time tracking functionality
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const loadActiveTimers = async () => {
      const timers = new Map();
      for (const task of tasks) {
        if (task.timeTracking?.activeTimer) {
          timers.set(task.Id, task.timeTracking.activeTimer);
        }
      }
      setActiveTimers(timers);
    };

    loadActiveTimers();
  }, [tasks]);

  const handleStartTimer = async (taskId) => {
    try {
      const timerData = await startTimer(taskId);
      setActiveTimers(prev => new Map(prev).set(taskId, timerData));
      onTaskUpdate && onTaskUpdate();
      toast.success("Timer started");
    } catch (error) {
      toast.error("Failed to start timer");
    }
  };

  const handleStopTimer = async (taskId) => {
    try {
      await stopTimer(taskId);
      setActiveTimers(prev => {
        const newTimers = new Map(prev);
        newTimers.delete(taskId);
        return newTimers;
      });
      onTaskUpdate && onTaskUpdate();
      toast.success("Timer stopped");
    } catch (error) {
      toast.error("Failed to stop timer");
    }
  };

  const formatDuration = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const getElapsedTime = (taskId) => {
    const timer = activeTimers.get(taskId);
    if (!timer) return 0;
    return currentTime - new Date(timer.startTime).getTime();
  };
  return (
    <div className="p-6">
      <DragDropContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {columns.map((column) => (
            <motion.div
              key={column.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${column.color}`}></div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {column.title}
                  </h3>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {getTasksByStatus(column.id).length}
                </span>
              </div>

              <Droppable droppableId={column.id}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`space-y-3 min-h-32 ${
                      snapshot.isDraggingOver ? "bg-blue-50 dark:bg-blue-900/20" : ""
                    } rounded-lg p-2 transition-colors duration-200`}
                  >
                    {getTasksByStatus(column.id).map((task, index) => (
                      <Draggable key={task.Id} draggableId={task.Id.toString()} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`${
                              snapshot.isDragging ? "rotate-2 scale-105" : ""
                            } transition-transform duration-200`}
                          >
<Card className="p-4 cursor-move hover:shadow-md transition-shadow duration-200">
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm leading-tight">
                                    {task.title}
                                  </h4>
                                  <Badge 
                                    variant={getPriorityVariant(task.priority)}
                                    className="flex items-center gap-1 flex-shrink-0"
                                    size="sm"
                                  >
                                    <ApperIcon name={getPriorityIcon(task.priority)} size={10} />
                                    {task.priority}
                                  </Badge>
                                </div>

                                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-gray-400">
                                  <div className="flex items-center gap-1">
                                    <ApperIcon name="Calendar" size={12} />
                                    <span>{formatDate(task.dueDate)}</span>
                                  </div>
                                  {isOverdue(task.dueDate) && task.status !== "done" && (
                                    <Badge variant="error" size="sm">
                                      Overdue
                                    </Badge>
                                  )}
                                </div>

                                {/* Time Tracking Section */}
                                <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
                                  <div className="flex items-center gap-2">
                                    {activeTimers.has(task.Id) && (
                                      <div className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400">
                                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="font-mono">
                                          {formatDuration(getElapsedTime(task.Id))}
                                        </span>
                                      </div>
                                    )}
                                    {task.timeTracking?.totalTime > 0 && !activeTimers.has(task.Id) && (
                                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                        <ApperIcon name="Clock" size={10} />
                                        <span className="font-mono">
                                          {formatDuration(task.timeTracking.totalTime)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                  <Button
                                    variant={activeTimers.has(task.Id) ? "error" : "primary"}
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (activeTimers.has(task.Id)) {
                                        handleStopTimer(task.Id);
                                      } else {
                                        handleStartTimer(task.Id);
                                      }
                                    }}
                                    className="px-2 py-1 text-xs"
                                  >
                                    <ApperIcon 
                                      name={activeTimers.has(task.Id) ? "Square" : "Play"} 
                                      size={10} 
                                      className="mr-1"
                                    />
                                    {activeTimers.has(task.Id) ? "Stop" : "Start"}
                                  </Button>
                                </div>

<div className="text-xs text-gray-500 dark:text-gray-400">
                                  Project: {task.projectId}
                                </div>
                                {task.assignedTo && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Assigned: {task.assignedTo}
                                  </div>
                                )}
                                {task.createdBy && (
                                  <div className="text-xs text-gray-500 dark:text-gray-400">
                                    Created by: {task.createdBy}
                                  </div>
                                )}
                              </div>
                            </Card>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </motion.div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default KanbanBoard;