import React, { useState, useEffect } from 'react';
import { Package, CheckCircle, Clock, Truck, XCircle, ShoppingBag, Download, X, Search, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

// Define TypeScript interfaces for better type safety
interface Product {
  id: string;
  name: string;
  family: string;
  price: number;
  quantity: number;
  img: string;
}

interface Order {
  id: string;
  date: string;
  status: string;
  items: number;
  total: number;
  products: Product[];
  shipping?: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    email: string;
    phone: string;
  };
  cancellation?: {
    date: string;
    reason: string;
  };
}

interface TrackingInfo {
  status: string;
  mainDate?: string;
  completed: boolean;
  isCancelled?: boolean;
  subSteps: {
    title: string;
    time?: string;
  }[];
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<string | null>(null);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('');
  //const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(50); // Show 4 orders per page like in image
  const [showTrackingModal, setShowTrackingModal] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Load orders from localStorage
    const savedOrders = localStorage.getItem('perfume_orders');
    if (savedOrders) {
      try {
        const parsedOrders = JSON.parse(savedOrders);
        const ordersWithShipping = parsedOrders.map((order: Order) => ({
          ...order,
          shipping: order.shipping || {
            name: 'dipen chhatrola',
            address: 'Sv Road',
            city: 'Rajkot',
            state: 'GJ',
            zipCode: '360005',
            email: 'demo@example.com',
            phone: '9016002198'
          }
        }));
        // Sort orders by date (newest first)
        const sortedOrders = ordersWithShipping.sort((a: Order, b: Order) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        setOrders(sortedOrders);
        setFilteredOrders(sortedOrders);
      } catch (error) {
        console.error('Error parsing orders from localStorage:', error);
        setOrders([]);
        setFilteredOrders([]);
      }
    }
  }, []);

  // Filter orders based on search, status, and time
  useEffect(() => {
    let result = orders;

    // Apply status filter
    if (statusFilter !== 'all') {
      result = result.filter(order => order.status === statusFilter);
    }

    // Apply time filter
    if (timeFilter) {
      const now = new Date();
      result = result.filter(order => {
        const orderDate = new Date(order.date);
        
        switch (timeFilter) {
          case '30days':
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(now.getDate() - 30);
            return orderDate >= thirtyDaysAgo;
          
          case '2024':
            return orderDate.getFullYear() === 2024;
          
          case '2023':
            return orderDate.getFullYear() === 2023;
          
          case '2022':
            return orderDate.getFullYear() === 2022;
          
          default:
            return true;
        }
      });
    }

    // Apply search filter
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      result = result.filter(order => 
        order.id.toLowerCase().includes(query) ||
        order.products.some(product => 
          product.name.toLowerCase().includes(query) ||
          product.family.toLowerCase().includes(query)
        )
      );
    }

    setFilteredOrders(result);
    setCurrentPage(1); // Reset to first page when filters change
  }, [orders, statusFilter, timeFilter, searchQuery]);

  // Pagination logic
  const indexOfLastOrder = currentPage * ordersPerPage;
  const indexOfFirstOrder = indexOfLastOrder - ordersPerPage;
  const currentOrders = filteredOrders.slice(indexOfFirstOrder, indexOfLastOrder);
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);

  // Pagination functions
  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      // Show all pages if total pages are less than max
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Show limited pages with ellipsis
      if (currentPage <= 3) {
        // Near the beginning
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        // Near the end
        pageNumbers.push(1);
        pageNumbers.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        // In the middle
        pageNumbers.push(1);
        pageNumbers.push('...');
        pageNumbers.push(currentPage - 1);
        pageNumbers.push(currentPage);
        pageNumbers.push(currentPage + 1);
        pageNumbers.push('...');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  // View Details Handler
  const handleViewDetails = (order: Order) => {
    setSelectedOrder(order);
    setShowPopup(true);
  };

  // Close Popup
  const handleClosePopup = () => {
    setShowPopup(false);
    setSelectedOrder(null);
  };

  // Open Cancel Confirmation Dialog
  const handleOpenCancelConfirm = (orderId: string) => {
    setOrderToCancel(orderId);
    setCancelReason('');
    setShowCancelConfirm(true);
  };

  // Close Cancel Confirmation Dialog
  const handleCloseCancelConfirm = () => {
    setShowCancelConfirm(false);
    setOrderToCancel(null);
    setCancelReason('');
  };

  // Cancel Order Handler
  const handleCancelOrder = () => {
    if (!orderToCancel) return;

    // Update order status to cancelled
    const updatedOrders = orders.map(order => {
      if (order.id === orderToCancel) {
        return {
          ...order,
          status: 'cancelled',
          // Add cancellation details
          cancellation: {
            date: new Date().toISOString(),
            reason: cancelReason || 'Customer requested cancellation'
          }
        };
      }
      return order;
    });

    // Update state
    setOrders(updatedOrders);

    // Update localStorage
    localStorage.setItem('perfume_orders', JSON.stringify(updatedOrders));

    // Show success message
    alert('Order has been cancelled successfully!');

    // Close confirmation dialog
    handleCloseCancelConfirm();

    // If the cancelled order is currently selected in popup, update it
    if (selectedOrder && selectedOrder.id === orderToCancel) {
      setSelectedOrder(updatedOrders.find(order => order.id === orderToCancel) || null);
    }
  };

  // Check if order can be cancelled
  const canCancelOrder = (orderStatus: string) => {
    // Only allow cancellation for orders that are not already cancelled or delivered
    return orderStatus !== 'cancelled' && orderStatus !== 'delivered';
  };

  // Handle Track Order
  const handleTrackOrder = (orderId: string) => {
    if (!selectedOrder) return;

    const orderDate = new Date(selectedOrder.date);
    
    // Date formatting helper
    const formatDateWithTime = (date: Date, hours: number, minutes: number) => {
      const newDate = new Date(date);
      newDate.setHours(hours, minutes);
      return {
        displayDate: newDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: '2-digit' }).replace(',', ''),
        displayTime: newDate.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase()
      };
    };

    const t1 = formatDateWithTime(orderDate, 12, 59);
    const t2 = formatDateWithTime(orderDate, 22, 31);
    const t3 = formatDateWithTime(orderDate, 23, 59);

    // Default dates for non-completed steps
    const futureDate = new Date(orderDate);
    futureDate.setDate(orderDate.getDate() + 2);
    const tFuture = formatDateWithTime(futureDate, 0, 0);

    const steps: any[] = [];

    // 1. Order Confirmed (Hamesha completed)
    steps.push({
      status: 'Order Confirmed',
      mainDate: t1.displayDate,
      completed: true,
      subSteps: [
        { title: 'Your Order has been placed.', time: `${t1.displayDate} - ${t1.displayTime}` },
        { title: 'Seller has processed your order.', time: `${t2.displayDate} - ${t2.displayTime}` },
        { title: 'Your item has been picked up by delivery partner.', time: `${t2.displayDate} - ${t2.displayTime}` }
      ]
    });

    // Handle Cancellation separately if order is cancelled
    if (selectedOrder.status === 'cancelled') {
      const cancelDate = selectedOrder.cancellation?.date ? new Date(selectedOrder.cancellation.date) : new Date();
      const tc = formatDateWithTime(cancelDate, cancelDate.getHours(), cancelDate.getMinutes());
      steps.push({
        status: 'Cancelled',
        mainDate: tc.displayDate,
        completed: true,
        isCancelled: true,
        subSteps: [{ title: selectedOrder.cancellation?.reason || 'You requested a cancellation', time: `${tc.displayDate} - ${tc.displayTime}` }]
      });
    } else {
      // 2. Shipped (Default)
      const isShipped = selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered';
      steps.push({
        status: 'Shipped',
        mainDate: isShipped ? t3.displayDate : '',
        completed: isShipped,
        subSteps: isShipped ? [
          { title: 'Your item has been shipped.', time: `${t3.displayDate} - ${t3.displayTime}` },
          { title: 'Your item has been received in the hub nearest to you', time: '' }
        ] : []
      });

      // 3. Out For Delivery (Default)
      const isOut = selectedOrder.status === 'delivered'; // Dummy logic: if delivered, it was out
      steps.push({
        status: 'Out For Delivery',
        mainDate: isOut ? tFuture.displayDate : '',
        completed: isOut,
        subSteps: isOut ? [{ title: 'Your item is out for delivery', time: `${tFuture.displayDate} - 9:50am` }] : []
      });

      // 4. Delivered (Default)
      const isDelivered = selectedOrder.status === 'delivered';
      steps.push({
        status: 'Delivered',
        mainDate: isDelivered ? tFuture.displayDate : '',
        completed: isDelivered,
        subSteps: isDelivered ? [{ title: 'Your item has been delivered', time: `${tFuture.displayDate} - 2:18pm` }] : []
      });
    }

    setTrackingInfo(steps);
    setShowTrackingModal(true);
  };

  // Calculate tax (18% GST)
  const calculateTax = (subtotal: number) => {
    const taxRate = 18; // 18% GST
    return (subtotal * taxRate) / 100;
  };

  // Calculate total with tax
  const calculateTotalWithTax = (subtotal: number) => {
    return subtotal + calculateTax(subtotal);
  };

  // Generate Invoice PDF with product images
  const generateInvoice = async (order: Order) => {
    setIsGeneratingPDF(true);

    try {
      // Try to load jspdf dynamically
      let jsPDF;
      try {
        const jsPDFModule = await import('jspdf');
        jsPDF = jsPDFModule.default;
      } catch (importError) {
        console.error('Failed to import jspdf:', importError);
        // Fallback to text file
        createTextInvoice(order);
        setIsGeneratingPDF(false);
        return;
      }

      // Create PDF document
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Set colors
      const primaryColor: [number, number, number] = [41, 128, 185]; // Blue color
      const secondaryColor: [number, number, number] = [52, 73, 94]; // Dark gray

      // Add header with background
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 40, 'F');

      // Store title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.setFont('helvetica', 'bold');
      doc.text('PERFUME STORE', 105, 25, { align: 'center' });

      // Invoice title
      doc.setTextColor(...secondaryColor);
      doc.setFontSize(22);
      doc.text('INVOICE', 105, 55, { align: 'center' });

      // Draw separator line
      doc.setDrawColor(...primaryColor);
      doc.setLineWidth(0.5);
      doc.line(20, 60, 190, 60);

      // Left column - Invoice details
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice #: ${order.id}`, 20, 75);
      doc.text(`Date: ${formatDate(order.date)}`, 20, 82);
      doc.text(`Status: ${getStatusText(order.status)}`, 20, 89);

      // Right column - Store info
      doc.text('Perfume Store Inc.', 140, 75);
      doc.text('123 Fragrance Street', 140, 82);
      doc.text('New York, NY 10001', 140, 89);
      doc.text('contact@perfumestore.com', 140, 96);

      // Billing Information section
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('BILLING & SHIPPING INFORMATION', 20, 110);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      if (order.shipping) {
        doc.text(`Name: ${order.shipping.name}`, 20, 120);
        doc.text(`Address: ${order.shipping.address}`, 20, 127);
        doc.text(`City: ${order.shipping.city}, ${order.shipping.state} ${order.shipping.zipCode}`, 20, 134);
        doc.text(`Email: ${order.shipping.email}`, 20, 141);
        doc.text(`Phone: ${order.shipping.phone}`, 20, 148);
      } else {
        doc.text(`Name: dipen chhatrola`, 20, 120);
        doc.text(`Address: Sv Road, Rajkot, GJ 360005`, 20, 127);
        doc.text(`Email: demo@example.com`, 20, 134);
        doc.text(`Phone: 9016002198`, 20, 141);
      }

      // Payment Method
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('PAYMENT METHOD', 140, 110);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'normal');
      doc.text('Cash On Delivery', 140, 120);
      doc.text('Payment Status: Paid', 140, 127);

      // Draw table header
      doc.setFillColor(...primaryColor);
      doc.rect(20, 155, 170, 10, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Product', 25, 162);
      doc.text('Qty', 110, 162);
      doc.text('Price', 135, 162);
      doc.text('Total', 165, 162);

      // Reset text color for items
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      let yPosition = 170;
      let subtotal = 0;

      // Add product rows with images
      for (let i = 0; i < order.products.length; i++) {
        const product = order.products[i];
        const productTotal = product.price * product.quantity;
        subtotal += productTotal;

        // Add product image
        try {
          // Load image from URL
          const img = new Image();
          img.crossOrigin = 'Anonymous'; // For CORS issues
          
          // Create a promise to handle image loading
          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => {
              console.warn(`Failed to load image: ${product.img}`);
              resolve(null); // Continue even if image fails
            };
            img.src = product.img;
          });

          // Add image to PDF (small thumbnail)
          doc.addImage(img, 'JPEG', 25, yPosition - 8, 15, 15);
        } catch (imgError) {
          console.warn(`Error adding image for ${product.name}:`, imgError);
          // Continue without image
        }

        // Product name (truncate if too long)
        const productName = product.name.length > 30 ? product.name.substring(0, 27) + '...' : product.name;

        // Product text starting after image
        doc.text(productName, 45, yPosition);
        doc.text(product.quantity.toString(), 110, yPosition);
        doc.text(`$${product.price.toFixed(2)}`, 135, yPosition);
        doc.text(`$${productTotal.toFixed(2)}`, 165, yPosition);

        // Add family below in smaller font
        doc.setFontSize(9);
        doc.text(`(${product.family})`, 45, yPosition + 4);
        doc.setFontSize(10);

        // Draw horizontal line
        doc.setDrawColor(200, 200, 200);
        doc.line(20, yPosition + 7, 190, yPosition + 7);

        yPosition += 20;

        // Check for page break
        if (yPosition > 250 && i < order.products.length - 1) {
          doc.addPage();
          yPosition = 20;
        }
      }

      // Calculate tax (18% GST)
      const taxRate = 18; // 18% GST
      const taxAmount = calculateTax(subtotal);
      const shipping = 0;
      const total = subtotal + taxAmount + shipping;

      // Add totals section
      yPosition = Math.max(yPosition, 200);

      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');

      // Subtotal
      doc.text('Subtotal:', 140, yPosition);
      doc.text(`$${subtotal.toFixed(2)}`, 165, yPosition);
      yPosition += 8;

      // Tax (18% GST)
      doc.text(`Tax (${taxRate}%):`, 140, yPosition);
      doc.text(`$${taxAmount.toFixed(2)}`, 165, yPosition);
      yPosition += 8;

      // Shipping
      doc.text('Shipping:', 140, yPosition);
      doc.text('$0.00', 165, yPosition);
      yPosition += 8;

      // Total
      doc.setFontSize(12);
      doc.text('Total:', 140, yPosition);
      doc.text(`$${total.toFixed(2)}`, 165, yPosition);

      // Add footer
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(100, 100, 100);
      doc.text('Thank you for your purchase!', 105, 280, { align: 'center' });
      doc.text('Tax Included: 18% GST | This is a computer-generated invoice.', 105, 285, { align: 'center' });

      // Save the PDF
      doc.save(`invoice-${order.id}.pdf`);

    } catch (error) {
      console.error('Error generating PDF:', error);
      // Fallback to text invoice
      createTextInvoice(order);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Fallback function to create text invoice
  const createTextInvoice = (order: Order) => {
    const invoiceText = `
    ========================================
              PERFUME STORE INVOICE
    ========================================
    Invoice #: ${order.id}
    Date: ${formatDate(order.date)}
    Status: ${getStatusText(order.status)}

    SHIPPING INFORMATION:
    ----------------------
    Name: ${order.shipping?.name || 'dipen chhatrola'}
    Address: ${order.shipping?.address || 'Sv Road'}
    City: ${order.shipping?.city || 'Rajkot'}, ${order.shipping?.state || 'GJ'} ${order.shipping?.zipCode || '360005'}
    Email: ${order.shipping?.email || 'demo@example.com'}
    Phone: ${order.shipping?.phone || '9016002198'}

    PAYMENT METHOD:
    ----------------
    Cash On Delivery

    ORDER ITEMS:
    ------------
    ${order.products.map(p =>
      `- ${p.name} (${p.family})
      Quantity: ${p.quantity} x $${p.price.toFixed(2)} = $${(p.price * p.quantity).toFixed(2)}`
    ).join('\n\n')}

    ORDER SUMMARY:
    --------------
    Subtotal: $${order.total.toFixed(2)}
    Tax (18% GST): $${calculateTax(order.total).toFixed(2)}
    Shipping: $0.00
    Total: $${calculateTotalWithTax(order.total).toFixed(2)}

    ========================================
    Thank you for your purchase!
    ========================================
    `;

    // Create and download text file
    const blob = new Blob([invoiceText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

    alert('PDF generation failed. A text invoice has been downloaded instead.');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return CheckCircle;
      case 'shipped':
        return Truck;
      case 'processing':
        return Clock;
      case 'cancelled':
        return XCircle;
      default:
        return Package;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'text-green-600 bg-green-100';
      case 'shipped':
        return 'text-blue-600 bg-blue-100';
      // case 'orderconfirmed':
      //   return 'text-yellow-600 bg-yellow-100';
      case 'outfordelivery':
        return 'text-blue-600 bg-blue-100';
      case 'cancelled':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-yellow-600 bg-yellow-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Delivered';
      case 'shipped':
        return 'Shipped';
      // case 'orderconfirmed':
      //   return 'Order Confirmed';
      case 'outfordelivery':
        return 'Out for delivery';
      case 'cancelled':
        return 'Cancelled';
      default:
        return 'Order Confirmed';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDeliveryDate = (dateString: string) => {
    const date = new Date(dateString);
    date.setDate(date.getDate() + 7); // Add 7 days for delivery estimate
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getOrderStatusIcon = (status: string) => {
    const Icon = getStatusIcon(status);
    const colorClass = getStatusColor(status);
    const color = colorClass.split(' ')[0].replace('text-', '');

    let rgbColor = 'text-gray-600';
    if (color === 'green-600') rgbColor = '#059669';
    if (color === 'blue-600') rgbColor = '#2563eb';
    if (color === 'yellow-600') rgbColor = '#d97706';
    if (color === 'red-600') rgbColor = '#dc2626';

    return <Icon size={20} style={{ color: rgbColor }} className="mr-2" />;
  };

  const clearFilters = () => {
    setStatusFilter('all');
    setTimeFilter('');
    setSearchQuery('');
  };

  // Simplified animations with proper TypeScript types
  const pageAnimation = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  const slideDownAnimation = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  };

  const slideUpAnimation = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const slideLeftAnimation = {
    hidden: { opacity: 0, x: 20 },
    visible: { opacity: 1, x: 0 }
  };

  const slideRightAnimation = {
    hidden: { opacity: 0, x: -20 },
    visible: { opacity: 1, x: 0 }
  };

  // const scaleAnimation = {
  //   hidden: { opacity: 0, scale: 0.9 },
  //   visible: { opacity: 1, scale: 1 }
  // };

  // const modalAnimation = {
  //   hidden: { opacity: 0, scale: 0.95 },
  //   visible: { opacity: 1, scale: 1 }
  // };

  // Animation transition settings (moved to separate prop)
  const fastTransition = { duration: 0.2 }
  const mediumTransition = { duration: 0.3 }
  // const slowTransition = { duration: 0.5 }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={pageAnimation}
      transition={mediumTransition}
      className="min-h-screen bg-gray-50 pt-10 pb-10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb - Exactly like image */}
        <motion.div 
          className="mb-8 flex justify-between items-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-3xl font-serif font-light tracking-wide">
              My Orders
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your Orders, view order history, track shipments, and handle returns all in one place.
            </p>
          </div>
          <motion.button
            onClick={() => navigate('/profile')}
            className="text-gray-700 hover:text-gray-900"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            ← Back to Profile
          </motion.button>
          {/*<span className="font-medium text-black">My Orders</span>*/}
        </motion.div>

        <motion.div 
          variants={slideUpAnimation}
          transition={{ ...mediumTransition, delay: 0.2 }}
          className="flex flex-col lg:flex-row gap-6"
        >
          {/* Left Sidebar - Filters */}
          <motion.div 
            variants={slideRightAnimation}
            transition={{ ...mediumTransition, delay: 0.3 }}
            className="lg:w-1/4"
          >
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-lg">Filters</h3>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={fastTransition}
                  onClick={clearFilters}
                  className="text-blue-600 text-sm hover:text-blue-800"
                >
                  Clear all filters
                </motion.button>
              </div>

              {/* Order Status Filter */}
              <div className="mb-6">
                <h4 className="font-medium mb-3 text-gray-700">ORDER STATUS</h4>
                <div className="space-y-2">
                  {['all', 'processing', 'shipped', 'delivered', 'cancelled'].map((status, index) => (
                    <motion.label 
                      key={status} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...mediumTransition, delay: 0.1 * index }}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="status"
                        checked={statusFilter === status}
                        onChange={() => setStatusFilter(status)}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <span className="capitalize text-gray-600">
                        {status === 'all' ? 'All Orders' : getStatusText(status)}
                      </span>
                    </motion.label>
                  ))}
                </div>
              </div>

              {/* Order Time Filter */}
              <div>
                <h4 className="font-medium mb-3 text-gray-700">ORDER TIME</h4>
                <div className="space-y-2">
                  {[
                    { label: 'All Orders', value: '' },
                    { label: 'Last 30 days', value: '30days' },
                    { label: '2024', value: '2024' },
                    { label: '2023', value: '2023' },
                    { label: '2022', value: '2022' }
                  ].map((time, index) => (
                    <motion.label 
                      key={time.value} 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...mediumTransition, delay: 0.15 * index }}
                      className="flex items-center cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="time"
                        value={time.value}
                        checked={timeFilter === time.value}
                        onChange={(e) => setTimeFilter(e.target.value)}
                        className="mr-3 h-4 w-4 text-blue-600"
                      />
                      <span className="text-gray-600">{time.label}</span>
                    </motion.label>
                  ))}
                </div>
              </div>
            </div>

            {/* Shop More Button */}
            <Link
              to="/products"
              className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-900 transition flex items-center justify-center font-medium"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={fastTransition}
                className="flex items-center"
              >
                <ShoppingBag size={18} className="mr-2" />
                Shop More
              </motion.div>
            </Link>
          </motion.div>

          {/* Main Content - Orders */}
          <motion.div 
            variants={slideLeftAnimation}
            transition={{ ...mediumTransition, delay: 0.3 }}
            className="lg:w-3/4"
          >
            {/* Search Bar */}
            <motion.div 
              variants={slideDownAnimation}
              transition={{ ...mediumTransition, delay: 0.2 }}
              className="bg-white rounded-lg shadow-sm p-4 mb-6"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search your orders here"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-300"
                  />
                </div>
                
                <div className="flex gap-4">
                  <div className="flex items-center gap-2 bg-gray-100 px-3 py-2 rounded-lg">
                    <span className="text-gray-600 text-sm">Show:</span>
                    <span className="font-medium">{ordersPerPage}</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Pagination Info */}
            {filteredOrders.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-between items-center mb-4 bg-white p-3 rounded-lg shadow-sm"
              >
                <div className="text-sm text-gray-600">
                  Showing <span className="font-semibold">{indexOfFirstOrder + 1}-{Math.min(indexOfLastOrder, filteredOrders.length)}</span> of <span className="font-semibold">{filteredOrders.length}</span> orders
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Page:</span>
                  <span className="font-semibold">{currentPage} / {totalPages}</span>
                </div>
              </motion.div>
            )}

            {/* Orders List - Flipkart Style */}
            <AnimatePresence mode="wait">
              {currentOrders.length === 0 ? (
                <motion.div 
                  key="no-orders"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={mediumTransition}
                  className="bg-white rounded-lg shadow-sm p-12 text-center border border-gray-200"
                >
                  <Package size={64} className="mx-auto text-gray-400 mb-6" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-4">No orders found</h3>
                  <p className="text-gray-600 mb-8">Try changing your filters or search query</p>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={clearFilters}
                    className="px-6 py-3 w-500 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Show All Orders
                  </motion.button>
                </motion.div>
              ) : (
                <>
                  <div className="space-y-[10px]">
                    {currentOrders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...mediumTransition, delay: index * 0.1 }}
                        whileHover={{ 
                          y: -4,
                          transition: fastTransition
                        }}
                        className="bg-white border border-gray-200 rounded-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
                        onClick={() => handleViewDetails(order)}
                      >
                        <div className="p-5 flex flex-col md:flex-row items-start justify-between">
                          {/* Section 1: Product Image & Details */}
                          <div className="flex gap-6 flex-1 min-w-0">
                            <motion.div 
                              whileHover={{ scale: 1.05 }}
                              transition={fastTransition}
                              className="w-[80px] h-[80px] flex-shrink-0"
                            >
                              <img
                                src={order.products[0]?.img}
                                alt={order.products[0]?.name}
                                className="w-full h-full object-contain"
                              />
                            </motion.div>

                            <div className="flex-1 min-w-0">
                              <h4 className="text-[14px] text-[#212121] hover:text-[#2874f0] mb-1 leading-tight line-clamp-2">
                                {order.products[0]?.name}
                              </h4>
                              <p className="text-[12px] text-[#878787] mt-1">
                                {formatDate(order.date)}
                              </p>
                            </div>
                          </div>

                          {/* Section 2: Price */}
                          <div className="md:w-[15%] w-full mt-2 md:mt-0">
                            <span className="text-[14px] text-[#212121]">
                              ₹{calculateTotalWithTax(order.total).toFixed(2)}
                            </span>
                          </div>

                          {/* Section 3: Status & Review Action */}
                          <div className="md:w-[30%] w-full mt-4 md:mt-0">
                            <div className="flex flex-col">
                              {/* Delivery Status Row */}
                              <div className="flex items-center gap-2">
                                <motion.div 
                                  animate={{ 
                                    scale: [1, 1.2, 1],
                                    transition: { repeat: Infinity, duration: 2 }
                                  }}
                                  className={`w-[10px] h-[10px] rounded-full flex-shrink-0 ${order.status === 'delivered' ? 'bg-[#26a541]' :
                                      order.status === 'cancelled' ? 'bg-[#ff6161]' : 'bg-[#ff9f00]'
                                    }`}
                                ></motion.div>
                                <span className="text-[14px] font-medium text-[#212121]">
                                  {order.status === 'delivered'
                                    ? `Delivered on ${getDeliveryDate(order.date)}`
                                    : getStatusText(order.status)}
                                </span>
                              </div>

                              {/* Status Sub-text */}
                              <p className="text-[12px] text-[#212121] mt-1 ml-4">
                                {order.status === 'delivered'
                                  ? 'Your item has been delivered'
                                  : order.status === 'cancelled'
                                    ? 'You requested a cancellation'
                                    : 'Order is being processed'}
                              </p>

                              {/* Rate & Review Action (matches your small image exactly) */}
                              {order.status === 'delivered' && (
                                <motion.button 
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                  transition={fastTransition}
                                  className="flex items-center gap-2 mt-4 ml-4 group"
                                >
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#2874f0" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                                  </svg>
                                  <span className="text-[14px] font-medium text-[#2874f0] group-hover:underline">
                                    Rate & Review Product
                                  </span>
                                </motion.button>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Pagination Controls */}
                  {filteredOrders.length > ordersPerPage && (
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="bg-white border border-gray-200 mt-6 p-6 rounded-lg"
                    >
                      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2">
                          {/* Previous Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={goToPreviousPage}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg border ${
                              currentPage === 1 
                                ? 'border-gray-200 text-gray-400 cursor-not-allowed' 
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <ChevronLeft size={20} />
                          </motion.button>
                          
                          {/* Page Numbers */}
                          <div className="flex gap-1">
                            {getPageNumbers().map((pageNum, index) => (
                              pageNum === '...' ? (
                                <span key={`ellipsis-${index}`} className="px-3 py-2 text-gray-500">
                                  ...
                                </span>
                              ) : (
                                <motion.button
                                  key={pageNum}
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => goToPage(pageNum as number)}
                                  className={`w-10 h-10 rounded-lg border ${
                                    currentPage === pageNum
                                      ? 'bg-blue-600 text-white border-blue-600'
                                      : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                  }`}
                                >
                                  {pageNum}
                                </motion.button>
                              )
                            ))}
                          </div>
                          
                          {/* Next Button */}
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={goToNextPage}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg border ${
                              currentPage === totalPages
                                ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                            }`}
                          >
                            <ChevronRight size={20} />
                          </motion.button>
                        </div>
                        
                        <div className="text-sm text-gray-500">
                          {ordersPerPage}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* Footer pagination-style message */}
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center py-10 bg-white border border-gray-200 mt-4"
                  >
                    <p className="text-[12px] font-medium text-[#878787] uppercase tracking-wide">
                      {currentPage === totalPages ? 'Last Page Reached' : `Page ${currentPage} of ${totalPages}`}
                    </p>
                    <p className="text-[11px] text-[#878787] mt-2">
                      Showing {currentOrders.length} of {filteredOrders.length} orders
                    </p>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>

      {/* Order Details Popup Modal */}
      <AnimatePresence>
        {showPopup && selectedOrder && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={mediumTransition}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={mediumTransition}
              className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="sticky top-0 bg-white p-6 border-b border-gray-200 flex justify-between items-center z-10">
                <div>
                  <h2 className="text-2xl font-bold">Order Details</h2>
                  <p className="text-gray-600">Order ID: {selectedOrder.id}</p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  transition={fastTransition}
                  onClick={handleClosePopup}
                  className="p-2 hover:bg-gray-100 rounded-full transition"
                >
                  <X size={24} />
                </motion.button>
              </div>

              <div className="p-6 space-y-8">
                {/* Order Status */}
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...mediumTransition, delay: 0.1 }}
                  className="flex items-center justify-between"
                >
                  <div>
                    <h3 className="text-lg font-semibold">Order Status</h3>
                    <div className="flex items-center mt-2">
                      {getOrderStatusIcon(selectedOrder.status)}
                      <span className={`px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedOrder.status)}`}>
                        {getStatusText(selectedOrder.status)}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="text-gray-600">Order Date</p>
                    <p className="font-medium">{formatDate(selectedOrder.date)}</p>
                  </div>
                </motion.div>

                {/* Shipping Information */}
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ ...mediumTransition, delay: 0.2 }}
                  className="bg-gray-50 p-6 rounded-lg"
                >
                  <h3 className="text-lg font-semibold mb-4">Shipping Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">Name</p>
                      <p className="text-gray-700">{selectedOrder.shipping?.name || 'dipen chhatrola'}</p>

                      <p className="font-medium text-gray-900 mt-4">Address</p>
                      <p className="text-gray-700">
                        {selectedOrder.shipping?.address || 'Sv Road'},<br />
                        {selectedOrder.shipping?.city || 'Rajkot'}, {selectedOrder.shipping?.state || 'GJ'} {selectedOrder.shipping?.zipCode || '360005'}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <p className="font-medium text-gray-900">Contact Information</p>
                      <p className="text-gray-700">{selectedOrder.shipping?.email || 'demo@example.com'}</p>
                      <p className="text-gray-700">{selectedOrder.shipping?.phone || '9016002198'}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Order Items */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...mediumTransition, delay: 0.3 }}
                >
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Order Items</h3>
                    <span className="text-gray-600">{selectedOrder.items} items</span>
                  </div>
                  <div className="space-y-4">
                    {selectedOrder.products?.map((product: Product, index: number) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ ...mediumTransition, delay: 0.1 * index }}
                        className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg"
                      >
                        <motion.img
                          whileHover={{ scale: 1.05 }}
                          transition={fastTransition}
                          src={product.img}
                          alt={product.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h5 className="font-medium text-lg">{product.name}</h5>
                          <p className="text-gray-600">{product.family}</p>
                          <p className="text-sm text-gray-500">Quantity: {product.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-lg">₹{(product.price * product.quantity).toFixed(2)}</p>
                          <p className="text-gray-500">₹{product.price.toFixed(2)} each</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>

                {/* Order Summary */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ ...mediumTransition, delay: 0.4 }}
                  className="bg-gray-50 p-6 rounded-lg"
                >
                  <h3 className="text-lg font-semibold mb-6">Order Summary</h3>
                  <div className="space-y-4">
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...mediumTransition, delay: 0.5 }}
                      className="flex justify-between"
                    >
                      <span className="text-gray-600">Subtotal</span>
                      <span>₹{selectedOrder.total.toFixed(2)}</span>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...mediumTransition, delay: 0.55 }}
                      className="flex justify-between"
                    >
                      <span className="text-gray-600">Tax (18% GST)</span>
                      <span>₹{calculateTax(selectedOrder.total).toFixed(2)}</span>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ ...mediumTransition, delay: 0.6 }}
                      className="flex justify-between"
                    >
                      <span className="text-gray-600">Shipping</span>
                      <span className="text-green-600 font-medium">Free</span>
                    </motion.div>
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ ...mediumTransition, delay: 0.65 }}
                      className="flex justify-between border-t border-gray-300 pt-4"
                    >
                      <span className="font-semibold text-lg">Total</span>
                      <span className="font-bold text-2xl">
                        ₹{calculateTotalWithTax(selectedOrder.total).toFixed(2)}
                      </span>
                    </motion.div>
                  </div>
                </motion.div>
              </div>

              <div className="sticky bottom-0 bg-white p-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between gap-4">
                <div className="flex gap-4">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={fastTransition}
                    onClick={handleClosePopup}
                    className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center"
                  >
                    Close
                  </motion.button>
                  
                  {/* Cancel Order button - only show if order can be cancelled */}
                  {canCancelOrder(selectedOrder.status) && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={fastTransition}
                      onClick={() => handleOpenCancelConfirm(selectedOrder.id)}
                      className="px-6 py-3 border border-red-600 text-red-600 rounded-lg hover:bg-red-50 transition text-center flex items-center justify-center"
                    >
                      <X size={18} className="mr-2" />
                      Cancel Order
                    </motion.button>
                  )}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Track Order button - only show if order is not cancelled or delivered */}
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={fastTransition}
                    onClick={() => handleTrackOrder(selectedOrder.id)}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center"
                  >
                    <MapPin size={18} className="mr-2" />
                    Track Order
                  </motion.button>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={fastTransition}
                    onClick={() => generateInvoice(selectedOrder)}
                    disabled={isGeneratingPDF}
                    className="px-6 py-3 bg-black text-white rounded-lg hover:bg-gray-900 transition flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isGeneratingPDF ? (
                      <>
                        <motion.svg 
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="h-5 w-5 mr-2 text-white" 
                          xmlns="http://www.w3.org/2000/svg" 
                          fill="none" 
                          viewBox="0 0 24 24"
                        >
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </motion.svg>
                        Generating...
                      </>
                    ) : (
                      <>
                        <Download size={18} className="mr-2" />
                        Download Invoice
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cancel Order Confirmation Modal */}
      <AnimatePresence>
        {showCancelConfirm && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={mediumTransition}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={mediumTransition}
              className="bg-white rounded-xl shadow-2xl max-w-md w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-bold text-red-600">Cancel Order</h2>
                <p className="text-gray-600 mt-2">Are you sure you want to cancel this order?</p>
              </div>

              <div className="p-6">
                <div className="mb-6">
                  <label htmlFor="cancelReason" className="block text-sm font-medium text-gray-700 mb-2">
                    Reason for cancellation (optional):
                  </label>
                  <textarea
                    id="cancelReason"
                    value={cancelReason}
                    onChange={(e) => setCancelReason(e.target.value)}
                    placeholder="Please provide a reason for cancellation..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                    rows={3}
                  />
                </div>
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <p className="text-sm text-yellow-800">
                    <strong>Note:</strong> This action cannot be undone. Once cancelled, the order will be marked as cancelled and cannot be processed further.
                  </p>
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end gap-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={fastTransition}
                  onClick={handleCloseCancelConfirm}
                  className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition text-center"
                >
                  Go Back
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={fastTransition}
                  onClick={handleCancelOrder}
                  className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition text-center"
                >
                  Confirm Cancellation
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Track Order Modal */}
      <AnimatePresence>
        {showTrackingModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-[60] p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-sm shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-4 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                <span className="font-medium text-gray-700">Tracking Details</span>
                <button onClick={() => setShowTrackingModal(false)} className="text-gray-400 hover:text-black">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                <div className="relative">
                  {/* Static Gray Background Line */}
                  <div className="absolute left-[5.5px] top-1 bottom-0 w-[2px] bg-gray-200" />
                  
                  {/* Dynamic Motion Green Line */}
                  <motion.div 
                    initial={{ height: 0 }}
                    animate={{ 
                      // Sirf wahan tak line jayegi jahan tak steps completed hain
                      height: `${(trackingInfo.filter((s: any) => s.completed).length - 1) * 33.3}%` 
                    }}
                    transition={{ duration: 1, ease: "easeInOut" }}
                    className="absolute left-[5.5px] top-1 w-[2px] origin-top z-0"
                    style={{ 
                      backgroundColor: trackingInfo.some((s: any) => s.isCancelled) ? '#ef4444' : '#26a541' 
                    }}
                  />

                  {trackingInfo.map((step: any, index: number) => (
                    <div key={index} className="flex relative z-10">
                      <div className="flex flex-col items-center mr-6">
                        {/* Dot Animation */}
                        <motion.div 
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: index * 0.3 }}
                          className={`w-3 h-3 rounded-full border-2 border-white shadow-sm flex-shrink-0 ${
                            step.isCancelled ? 'bg-red-500' : (step.completed ? 'bg-[#26a541]' : 'bg-gray-300')
                          }`}
                        />
                        <div className="flex-1 w-[2px]"></div>
                      </div>

                      <div className="pb-10 -mt-1 flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className={`font-medium text-[14px] ${step.isCancelled ? 'text-red-600' : 'text-[#212121]'}`}>
                            {step.status}
                          </h3>
                          <span className="text-[14px] text-[#878787]">{step.mainDate}</span>
                        </div>

                        <div className="space-y-3">
                          {step.subSteps.map((sub: any, i: number) => (
                            <motion.div 
                              key={i}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: index * 0.3 + 0.2 }}
                            >
                              <p className={`text-[13px] ${
                                step.isCancelled ? 'text-red-500' : 
                                (i === 0 && step.status === 'Shipped' ? 'text-[#2874f0] font-medium' : 'text-[#878787]')
                              }`}>
                                {sub.title}
                              </p>
                              {sub.time && <p className="text-[12px] text-[#878787] mt-0.5">{sub.time}</p>}
                            </motion.div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Orders;