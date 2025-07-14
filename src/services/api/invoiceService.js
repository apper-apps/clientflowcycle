const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const getAllInvoices = async () => {
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
        { field: { Name: "amount" } },
        { field: { Name: "status" } },
        { field: { Name: "dueDate" } },
        { field: { Name: "paymentDate" } },
        { field: { Name: "client_id" } },
        { field: { Name: "project_id" } }
      ]
    };
    
    const response = await apperClient.fetchRecords('app_invoice', params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    // Map database field names to expected field names
    return (response.data || []).map(invoice => ({
      ...invoice,
      clientId: invoice.client_id,
      projectId: invoice.project_id
    }));
  } catch (error) {
    console.error("Error fetching invoices:", error);
    throw error;
  }
};

export const getInvoiceById = async (id) => {
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
        { field: { Name: "amount" } },
        { field: { Name: "status" } },
        { field: { Name: "dueDate" } },
        { field: { Name: "paymentDate" } },
        { field: { Name: "client_id" } },
        { field: { Name: "project_id" } }
      ]
    };
    
    const response = await apperClient.getRecordById('app_invoice', parseInt(id), params);
    
    if (!response.success) {
      console.error(response.message);
      throw new Error(response.message);
    }
    
    const invoice = response.data;
    return {
      ...invoice,
      clientId: invoice.client_id,
      projectId: invoice.project_id
    };
  } catch (error) {
    console.error("Error fetching invoice:", error);
    throw error;
  }
};

export const createInvoice = async (invoiceData) => {
  await delay(300);
  
  // Validate required fields
  if (!invoiceData.projectId) {
    throw new Error("Project ID is required");
  }
  if (!invoiceData.amount || invoiceData.amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }
  if (!invoiceData.dueDate) {
    throw new Error("Due date is required");
  }
  
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Only include updateable fields
    const params = {
      records: [{
        Name: `Invoice for Project ${invoiceData.projectId}`,
        amount: parseFloat(invoiceData.amount),
        status: invoiceData.status || 'draft',
        dueDate: invoiceData.dueDate,
        client_id: parseInt(invoiceData.clientId),
        project_id: parseInt(invoiceData.projectId)
      }]
    };
    
    if (invoiceData.paymentDate) {
      params.records[0].paymentDate = invoiceData.paymentDate;
    }
    
    const response = await apperClient.createRecord('app_invoice', params);
    
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
      const invoice = successfulRecords[0]?.data;
      return {
        ...invoice,
        clientId: invoice.client_id,
        projectId: invoice.project_id,
        lineItems: invoiceData.lineItems || []
      };
    }
  } catch (error) {
    console.error("Error creating invoice:", error);
    throw error;
  }
};

export const updateInvoice = async (id, invoiceData) => {
  await delay(250);
  
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    throw new Error("Invalid invoice ID");
  }
  
  // Validate data if provided
  if (invoiceData.amount !== undefined && invoiceData.amount <= 0) {
    throw new Error("Amount must be greater than 0");
  }
  
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    // Only include updateable fields
    const updateData = {
      Id: parsedId
    };
    
    if (invoiceData.amount !== undefined) updateData.amount = parseFloat(invoiceData.amount);
    if (invoiceData.status) updateData.status = invoiceData.status;
    if (invoiceData.dueDate) updateData.dueDate = invoiceData.dueDate;
    if (invoiceData.paymentDate) updateData.paymentDate = invoiceData.paymentDate;
    if (invoiceData.projectId) updateData.project_id = parseInt(invoiceData.projectId);
    if (invoiceData.clientId) updateData.client_id = parseInt(invoiceData.clientId);
    
    const params = {
      records: [updateData]
    };
    
    const response = await apperClient.updateRecord('app_invoice', params);
    
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
      const invoice = successfulRecords[0]?.data;
      return {
        ...invoice,
        clientId: invoice.client_id,
        projectId: invoice.project_id
      };
    }
  } catch (error) {
    console.error("Error updating invoice:", error);
    throw error;
  }
};

export const markInvoiceAsSent = async (id) => {
  return updateInvoice(id, { status: 'sent' });
};

export const markInvoiceAsPaid = async (id, paymentDate) => {
  if (!paymentDate) {
    throw new Error("Payment date is required");
  }
  
  return updateInvoice(id, { 
    status: 'paid',
    paymentDate: new Date(paymentDate).toISOString()
  });
};

export const deleteInvoice = async (id) => {
  await delay(200);
  
  const parsedId = parseInt(id);
  if (isNaN(parsedId)) {
    throw new Error("Invalid invoice ID");
  }
  
  try {
    const { ApperClient } = window.ApperSDK;
    const apperClient = new ApperClient({
      apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
      apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
    });
    
    const params = {
      RecordIds: [parsedId]
    };
    
    const response = await apperClient.deleteRecord('app_invoice', params);
    
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
    console.error("Error deleting invoice:", error);
    throw error;
  }
};