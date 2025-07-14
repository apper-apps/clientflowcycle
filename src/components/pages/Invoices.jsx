import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Badge from "@/components/atoms/Badge";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Modal from "@/components/atoms/Modal";
import Empty from "@/components/ui/Empty";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import InvoiceModal from "@/components/molecules/InvoiceModal";
import SearchBar from "@/components/molecules/SearchBar";
import { createInvoice, getAllInvoices, markInvoiceAsSent, markInvoiceAsPaid } from "@/services/api/invoiceService";

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
const [statusFilter, setStatusFilter] = useState("all");
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState(null);
  const [paymentDate, setPaymentDate] = useState("");

  const loadInvoices = async () => {
    try {
      setLoading(true);
      setError("");
      const invoiceData = await getAllInvoices();
      setInvoices(invoiceData);
    } catch (err) {
      setError("Failed to load invoices. Please try again.");
      toast.error("Failed to load invoices");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.Id.toString().includes(searchTerm) ||
                         invoice.amount.toString().includes(searchTerm);
    const matchesStatus = statusFilter === "all" || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
});

  const calculateOutstandingAmount = () => {
    return invoices
      .filter(invoice => invoice.status !== "paid")
      .reduce((total, invoice) => total + invoice.amount, 0);
  };

  const getStatusVariant = (status) => {
    const variants = {
      draft: "secondary",
      sent: "primary",
      paid: "success",
      overdue: "danger"
    };
    return variants[status] || "default";
  };

const getStatusIcon = (status) => {
    const icons = {
      draft: "FileText",
      sent: "Send",
      paid: "CheckCircle2",
      overdue: "AlertTriangle"
    };
    return icons[status] || "Circle";
  };

  const handleCreateInvoice = async (invoiceData) => {
    try {
      await createInvoice(invoiceData);
      await loadInvoices();
    } catch (error) {
      throw error;
    }
};

  const handleSendInvoice = async (invoiceId) => {
    try {
      await markInvoiceAsSent(invoiceId);
      await loadInvoices();
      toast.success("Invoice marked as sent successfully!");
    } catch (error) {
      toast.error("Failed to mark invoice as sent");
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    if (!paymentDate) {
      toast.error("Please select a payment date");
      return;
    }
    
    try {
      await markInvoiceAsPaid(invoiceId, paymentDate);
      await loadInvoices();
      setPaymentModalOpen(false);
      setSelectedInvoiceId(null);
      setPaymentDate("");
      toast.success("Invoice marked as paid successfully!");
    } catch (error) {
      toast.error("Failed to mark invoice as paid");
    }
  };

  const openPaymentModal = (invoiceId) => {
    setSelectedInvoiceId(invoiceId);
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentModalOpen(true);
  };

  const closePaymentModal = () => {
    setPaymentModalOpen(false);
    setSelectedInvoiceId(null);
    setPaymentDate("");
  };
const handleNewInvoiceClick = () => {
    console.log('Create Invoice button clicked'); // Debug logging
    setEditingInvoice(null);
    setIsInvoiceModalOpen(true);
    setError(""); // Clear any previous errors
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleViewInvoice = (invoice) => {
    // For now, open in edit mode for viewing
    setEditingInvoice(invoice);
    setIsInvoiceModalOpen(true);
  };

  const handleCloseInvoiceModal = () => {
    setIsInvoiceModalOpen(false);
    setEditingInvoice(null);
  };

const handleInvoiceSubmit = async (invoiceData) => {
    try {
      console.log('Invoice submission started:', invoiceData); // Debug logging
      if (editingInvoice) {
        // Handle invoice update logic here
        await loadInvoices();
        toast.success("Invoice updated successfully");
      } else {
        console.log('Creating new invoice...'); // Debug logging
        await createInvoice(invoiceData);
        await loadInvoices();
        toast.success("Invoice created successfully");
      }
    } catch (error) {
      console.error('Invoice submission error:', error); // Enhanced error logging
      toast.error(`Failed to ${editingInvoice ? 'update' : 'create'} invoice: ${error.message}`);
      throw error;
    }
  };

  if (loading) {
    return <Loading />;
  }

  if (error) {
    return <Error message={error} onRetry={loadInvoices} />;
  }

  if (invoices.length === 0) {
    return (
      <Empty
        title="No Invoices Yet"
        description="Create your first invoice to start billing clients"
icon="FileText"
        actionLabel="Create Invoice"
        onAction={handleNewInvoiceClick}
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
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-lg">
              <ApperIcon name="FileText" size={18} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              Invoices
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Manage invoices and track payments
          </p>
          <div className="flex items-center gap-2 mt-2">
            <ApperIcon name="DollarSign" size={16} className="text-orange-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Outstanding: 
              <span className="ml-2 text-lg font-bold text-orange-600 dark:text-orange-400">
                ${calculateOutstandingAmount().toLocaleString()}
              </span>
            </span>
          </div>
        </div>
        
        <Button variant="primary" onClick={handleNewInvoiceClick}>
          <ApperIcon name="Plus" size={16} className="mr-2" />
          New Invoice
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
          placeholder="Search invoices by ID or amount..."
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
            <option value="draft">Draft</option>
            <option value="sent">Sent</option>
            <option value="paid">Paid</option>
            <option value="overdue">Overdue</option>
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
        Showing {filteredInvoices.length} of {invoices.length} invoices
      </motion.div>

      {/* Invoices Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6"
      >
        {filteredInvoices.map((invoice, index) => (
          <motion.div
            key={invoice.Id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card hover className="p-6 h-full">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Invoice #{invoice.Id}
                    </h3>
                    <Badge 
                      variant={getStatusVariant(invoice.status)}
                      className="flex items-center gap-1"
                    >
                      <ApperIcon name={getStatusIcon(invoice.status)} size={12} />
                      {invoice.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Client ID: {invoice.clientId}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Project ID: {invoice.projectId}
                  </p>
                </div>
              </div>
              
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Amount:</span>
                  <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
                    ${invoice.amount.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Due Date:</span>
                  <span className={`font-medium ${
                    new Date(invoice.dueDate) < new Date() && invoice.status !== "paid"
                      ? "text-red-600 dark:text-red-400"
                      : "text-gray-900 dark:text-white"
                  }`}>
                    {new Date(invoice.dueDate).toLocaleDateString()}
                  </span>
                </div>
                
                {new Date(invoice.dueDate) < new Date() && invoice.status !== "paid" && (
                  <div className="flex items-center gap-2 p-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <ApperIcon name="AlertTriangle" size={14} className="text-red-600 dark:text-red-400" />
                    <span className="text-xs text-red-600 dark:text-red-400 font-medium">
                      {Math.floor((new Date() - new Date(invoice.dueDate)) / (1000 * 60 * 60 * 24))} days overdue
                    </span>
                  </div>
                )}
              </div>
              
<div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleViewInvoice(invoice)}
                  >
                    <ApperIcon name="Eye" size={14} className="mr-2" />
                    View
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleEditInvoice(invoice)}
                  >
                    <ApperIcon name="Edit2" size={14} />
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  {invoice.status === "draft" && (
                    <Button 
                      variant="primary" 
                      size="sm"
                      onClick={() => handleSendInvoice(invoice.Id)}
                    >
                      <ApperIcon name="Send" size={14} className="mr-2" />
                      Send
                    </Button>
                  )}
                  
                  {(invoice.status === "sent" || invoice.status === "overdue") && (
                    <Button 
                      variant="success" 
                      size="sm"
                      onClick={() => openPaymentModal(invoice.Id)}
                    >
                      <ApperIcon name="CheckCircle2" size={14} className="mr-2" />
                      Mark Paid
                    </Button>
                  )}
                  
                  <Button variant="ghost" size="sm">
                    <ApperIcon name="MoreHorizontal" size={14} />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {filteredInvoices.length === 0 && searchTerm && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Empty
            title="No Invoices Found"
            description={`No invoices match your search criteria. Try adjusting your filters.`}
            icon="Search"
            actionLabel="Clear Filters"
            onAction={() => {
              setSearchTerm("");
              setStatusFilter("all");
            }}
/>
        </motion.div>
      )}

{/* Invoice Modal */}
      <InvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={handleCloseInvoiceModal}
        onSubmit={handleInvoiceSubmit}
        initialData={editingInvoice}
      />

      {/* Payment Date Modal */}
      <Modal
        isOpen={paymentModalOpen}
        onClose={closePaymentModal}
        title="Mark Invoice as Paid"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-gray-600 dark:text-gray-400">
            Select the payment date for this invoice:
          </p>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Payment Date *
            </label>
            <Input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              className="w-full"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={closePaymentModal}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              onClick={() => handleMarkAsPaid(selectedInvoiceId)}
              disabled={!paymentDate}
            >
              <ApperIcon name="CheckCircle2" size={16} className="mr-2" />
              Mark as Paid
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Invoices;