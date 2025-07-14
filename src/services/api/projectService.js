const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAllProjects = async () => {
  await delay(250);
  
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "status" } },
        { field: { Name: "budget" } },
        { field: { Name: "startDate" } },
        { field: { Name: "endDate" } },
        { field: { Name: "client_id" } }
      ]
    };
    
    const response = await apperClient.fetchRecords('project', params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    // Map database field names to expected field names
    return (response.data || []).map(project => ({
      ...project,
      name: project.Name,
      clientId: project.client_id
    }));
  } catch (error) {
    console.error("Error fetching projects:", error);
    throw error;
  }
};

export const getProjectById = async (id) => {
  await delay(150);
  
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      fields: [
        { field: { Name: "Name" } },
        { field: { Name: "status" } },
        { field: { Name: "budget" } },
        { field: { Name: "startDate" } },
        { field: { Name: "endDate" } },
        { field: { Name: "client_id" } }
      ]
    };
    
    const response = await apperClient.getRecordById('project', parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    // Map database field names to expected field names
    const project = response.data;
    return {
      ...project,
      name: project.Name,
      clientId: project.client_id
    };
  } catch (error) {
    console.error("Error fetching project:", error);
    throw error;
  }
};

export const createProject = async (projectData) => {
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
        Name: projectData.name,
        status: projectData.status || 'planning',
        budget: projectData.budget ? parseFloat(projectData.budget) : 0,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        client_id: parseInt(projectData.clientId)
      }]
    };
    
    const response = await apperClient.createRecord('project', params);
    
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
      const project = successfulRecords[0]?.data;
      return {
        ...project,
        name: project.Name,
        clientId: project.client_id
      };
    }
  } catch (error) {
    console.error("Error creating project:", error);
    throw error;
  }
};

export const updateProject = async (id, projectData) => {
  await delay(250);
  
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Only include updateable fields
    const params = {
      records: [{
        Id: parseInt(id),
        Name: projectData.name,
        status: projectData.status,
        budget: projectData.budget ? parseFloat(projectData.budget) : 0,
        startDate: projectData.startDate,
        endDate: projectData.endDate,
        client_id: parseInt(projectData.clientId)
      }]
    };
    
    const response = await apperClient.updateRecord('project', params);
    
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
      const project = successfulRecords[0]?.data;
      return {
        ...project,
        name: project.Name,
        clientId: project.client_id
      };
    }
  } catch (error) {
    console.error("Error updating project:", error);
    throw error;
  }
};

export const deleteProject = async (id) => {
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
    
    const response = await apperClient.deleteRecord('project', params);
    
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
    console.error("Error deleting project:", error);
    throw error;
  }
};