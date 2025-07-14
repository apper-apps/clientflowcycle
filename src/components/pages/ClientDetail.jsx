import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import ApperIcon from "@/components/ApperIcon";
import ClientModal from "@/components/molecules/ClientModal";
import ProjectModal from "@/components/molecules/ProjectModal";
import { getClientById } from "@/services/api/clientService";
import { getAllProjects, createProject } from "@/services/api/projectService";

const ClientDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [client, setClient] = useState(null);
const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const loadClientData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [clientData, allProjects] = await Promise.all([
        getClientById(id),
        getAllProjects()
      ]);
      
      setClient(clientData);
      
      // Filter projects for this client
      const clientProjects = allProjects.filter(project => 
        parseInt(project.clientId) === parseInt(id)
      );
      setProjects(clientProjects);
    } catch (err) {
      setError("Failed to load client details. Please try again.");
      toast.error("Failed to load client details");
    } finally {
      setLoading(false);
    }
  };

  const handleClientUpdated = (updatedClient) => {
    setClient(updatedClient);
    toast.success("Client updated successfully!");
  };

const handleBackToClients = () => {
    navigate("/clients");
  };

  const handleNewProject = () => {
    setShowProjectModal(true);
  };

  const handleProjectSubmit = async (projectData) => {
    try {
      await createProject(projectData);
      await loadClientData(); // Refresh the client data and projects
      setShowProjectModal(false);
      toast.success("Project created successfully!");
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error(error.message || 'Failed to create project');
      throw error; // Re-throw to let ProjectModal handle loading state
    }
  };
  useEffect(() => {
    if (id) {
      loadClientData();
    }
  }, [id]);

  // Calculate client statistics
  const calculateStats = () => {
    const totalProjects = projects.length;
    const activeProjects = projects.filter(p => p.status === "active").length;
    const totalRevenue = projects.reduce((sum, project) => sum + (project.budget || 0), 0);
    
    return { totalProjects, activeProjects, totalRevenue };
  };

  const getStatusVariant = (status) => {
    const variants = {
      planning: "secondary",
      active: "primary",
      completed: "success",
      "on-hold": "warning"
    };
    return variants[status] || "secondary";
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
    return <Error message={error} onRetry={loadClientData} />;
  }

  if (!client) {
    return (
      <Error 
        message="Client not found" 
        onRetry={handleBackToClients}
        retryLabel="Back to Clients"
      />
    );
  }

  const stats = calculateStats();

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
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToClients}
              className="p-2"
            >
              <ApperIcon name="ArrowLeft" size={18} />
            </Button>
            <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center shadow-lg">
              <ApperIcon name="User" size={18} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              {client.name}
            </h1>
            <Badge variant={client.status === "active" ? "success" : "secondary"}>
              {client.status}
            </Badge>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            {client.company}
          </p>
        </div>
        
        <Button variant="primary" onClick={() => setShowEditModal(true)}>
          <ApperIcon name="Edit" size={16} className="mr-2" />
          Edit Client
        </Button>
      </motion.div>

      {/* Client Info and Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client Information */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-1"
        >
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Contact Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3">
<div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                  {client?.name?.charAt(0)?.toUpperCase() || '?'}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {client.name}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {client.company}
                  </p>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <ApperIcon name="Mail" size={16} />
                  <span>{client.email}</span>
                </div>
                
                <div className="flex items-center gap-3 text-sm text-gray-600 dark:text-gray-400">
                  <ApperIcon name="Calendar" size={16} />
                  <span>Client since {new Date(client.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
              
              {client.notes && (
                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {client.notes}
                  </p>
                </div>
              )}
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <ApperIcon name="FolderOpen" size={20} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.totalProjects}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Projects
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <ApperIcon name="Play" size={20} className="text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.activeProjects}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Active Projects
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <ApperIcon name="DollarSign" size={20} className="text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${stats.totalRevenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Total Revenue
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </motion.div>
      </div>

      {/* Projects Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Projects ({projects.length})
            </h2>
<Button 
              variant="outline" 
              size="sm"
              onClick={handleNewProject}
            >
              <ApperIcon name="Plus" size={16} className="mr-2" />
              New Project
            </Button>
          </div>

          {projects.length === 0 ? (
            <Empty
              title="No Projects Yet"
description="This client doesn't have any projects yet. Create the first project to get started."
              icon="FolderOpen"
              actionLabel="Create Project"
              onAction={handleNewProject}
            />
          ) : (
            <div className="space-y-4">
              {projects.map((project, index) => (
                <motion.div
                  key={project.Id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                        <ApperIcon name={getStatusIcon(project.status)} size={14} className="text-white" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            ${project.budget?.toLocaleString() || 0}
                          </span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant={getStatusVariant(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Edit Client Modal */}
      <ClientModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
onClientUpdated={handleClientUpdated}
        client={client}
        mode="edit"
      />

      {/* New Project Modal */}
      <ProjectModal
        isOpen={showProjectModal}
        onClose={() => setShowProjectModal(false)}
        onSubmit={handleProjectSubmit}
        project={{ clientId: client?.Id }}
        title="Create New Project"
      />
    </div>
  );
};

export default ClientDetail;