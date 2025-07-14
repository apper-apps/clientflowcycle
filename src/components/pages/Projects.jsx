import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Modal from "@/components/atoms/Modal";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import SearchBar from "@/components/molecules/SearchBar";
import ProjectModal from "@/components/molecules/ProjectModal";
import { createProject, getAllProjects } from "@/services/api/projectService";
import { getAllClients } from "@/services/api/clientService";
const Projects = () => {
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError("");
      const [projectData, clientData] = await Promise.all([
        getAllProjects(),
        getAllClients()
      ]);
      setProjects(projectData);
      setClients(clientData);
    } catch (err) {
      setError("Failed to load data. Please try again.");
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleEditProject = (project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleProjectSubmit = async (projectData) => {
    try {
      if (editingProject) {
        // Handle project update
        await loadProjects();
        toast.success("Project updated successfully");
      } else {
        // Handle project creation
        await loadProjects();
        toast.success("Project created successfully");
      }
      setIsModalOpen(false);
      setEditingProject(null);
    } catch (error) {
      throw error;
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProject(null);
  };

const getClientName = (clientId) => {
    const client = clients.find(c => c.Id === parseInt(clientId));
    return client ? (client.Name || client.name) : `Client ID: ${clientId}`;
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || project.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusVariant = (status) => {
    const variants = {
      planning: "secondary",
      active: "primary",
      completed: "success",
      "on-hold": "warning"
    };
    return variants[status] || "default";
  };

  const getStatusIcon = (status) => {
    const icons = {
      planning: "Calendar",
      active: "Play",
      completed: "CheckCircle2",
      "on-hold": "Pause"
    };
    return icons[status] || "Circle";
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadProjects} />;
  }

  if (projects.length === 0) {
    return (
      <Empty
        title="No Projects Yet"
        description="Create your first project to start tracking your work"
        icon="FolderOpen"
actionLabel="Create Project"
        onAction={() => setIsModalOpen(true)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
      >
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
              <ApperIcon name="FolderOpen" size={18} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Projects
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Track and manage all your client projects
          </p>
        </div>
        
<Button variant="primary" onClick={() => setIsModalOpen(true)}>
          <ApperIcon name="FolderPlus" size={16} className="mr-2" />
          New Project
        </Button>
      </motion.div>

      {/* Search and Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-4"
      >
        <SearchBar
          placeholder="Search projects..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
        
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <option value="all">All Status</option>
            <option value="planning">Planning</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="on-hold">On Hold</option>
          </select>
          
          <Button variant="outline" size="sm">
            <ApperIcon name="Download" size={16} className="mr-2" />
            Export
          </Button>
        </div>
      </motion.div>

      {/* Results Count */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-sm text-gray-600 dark:text-gray-400"
      >
        Showing {filteredProjects.length} of {projects.length} projects
      </motion.div>

      {/* Projects Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.Id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card hover className="p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate mb-1">
                    {project.name}
                  </h3>
<p className="text-sm text-gray-600 dark:text-gray-400">
                    {getClientName(project.clientId)}
                  </p>
                </div>
                
                <Badge variant={getStatusVariant(project.status)} className="flex items-center gap-1">
                  <ApperIcon name={getStatusIcon(project.status)} size={12} />
                  {project.status}
                </Badge>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Budget:</span>
                  <span className="font-medium text-gray-900 dark:text-white">
                    ${project.budget.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Start Date:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(project.startDate).toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">End Date:</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(project.endDate).toLocaleDateString()}
                  </span>
                </div>
                
                {/* Progress Bar */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Progress:</span>
                    <span className="text-gray-900 dark:text-white font-medium">
                      {project.status === "completed" ? "100%" : 
                       project.status === "active" ? "65%" : 
                       project.status === "planning" ? "15%" : "45%"}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-primary-500 to-secondary-500 h-2 rounded-full transition-all duration-300"
                      style={{ 
                        width: project.status === "completed" ? "100%" : 
                               project.status === "active" ? "65%" : 
                               project.status === "planning" ? "15%" : "45%"
                      }}
                    />
                  </div>
                </div>
              </div>
              
<div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/projects/${project.Id}`)}
                >
                  <ApperIcon name="Eye" size={14} className="mr-2" />
                  View
                </Button>
<div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditProject(project)}
                  >
                    <ApperIcon name="Edit2" size={14} />
                  </Button>
                  <Button variant="ghost" size="sm">
                    <ApperIcon name="MoreHorizontal" size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredProjects.length === 0 && searchTerm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Empty
            title="No Projects Found"
            description={`No projects match your search criteria. Try adjusting your filters.`}
            icon="Search"
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
          />
</motion.div>
      )}

{/* Project Modal */}
      <ProjectModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleProjectSubmit}
        project={editingProject}
        title={editingProject ? "Edit Project" : "Create New Project"}
        clients={clients}
      />
    </div>
  );
};

export default Projects;