import React, { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  query,
  orderBy,
  deleteDoc
} from 'firebase/firestore';
import { db } from '../../firebaseConfig';
import { Search, FileText, Package } from 'lucide-react';
import { toast } from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState('desc');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Listen for product orders.
  useEffect(() => {
    setIsLoading(true);
    const ordersQuery = query(
      collection(db, 'orders'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(ordersQuery, snapshot => {
      const ordersList = snapshot.docs.map(docSnap => ({
        id: docSnap.id,
        ...docSnap.data()
      }));
      setOrders(ordersList);
      setIsLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Update order status based on admin selection.
  const handleSetStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(db, 'orders', orderId);
      await updateDoc(orderRef, { status: newStatus });
      toast.success(`Order status updated to ${newStatus}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    }
  };

  // Delete order.
  const handleDeleteOrder = async (orderId) => {
    try {
      await deleteDoc(doc(db, 'orders', orderId));
      toast.success("Order deleted successfully");
    } catch (error) {
      console.error("Error deleting order: ", error);
      toast.error("Failed to delete order");
    }
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Updated robust search: check across multiple fields.
  const filteredOrders = orders.filter(order => {
    const searchTermLower = searchTerm.toLowerCase();

    // Check basic order fields.
    const inBasicFields =
      (order.userId && order.userId.toLowerCase().includes(searchTermLower)) ||
      (order.userName && order.userName.toLowerCase().includes(searchTermLower)) ||
      (order.userEmail && order.userEmail.toLowerCase().includes(searchTermLower)) ||
      (order.orderId && order.orderId.toLowerCase().includes(searchTermLower));

    // Check shippingInfo fields.
    let inShipping = false;
    if (order.shippingInfo) {
      inShipping =
        (order.shippingInfo.fullName && order.shippingInfo.fullName.toLowerCase().includes(searchTermLower)) ||
        (order.shippingInfo.email && order.shippingInfo.email.toLowerCase().includes(searchTermLower)) ||
        (order.shippingInfo.phone && order.shippingInfo.phone.toLowerCase().includes(searchTermLower)) ||
        (order.shippingInfo.address && order.shippingInfo.address.toLowerCase().includes(searchTermLower)) ||
        (order.shippingInfo.city && order.shippingInfo.city.toLowerCase().includes(searchTermLower)) ||
        (order.shippingInfo.state && order.shippingInfo.state.toLowerCase().includes(searchTermLower)) ||
        (order.shippingInfo.zipCode && order.shippingInfo.zipCode.toLowerCase().includes(searchTermLower));
    }

    // Check in each order item.
    let inItems = false;
    if (order.items && Array.isArray(order.items)) {
      inItems = order.items.some(item =>
        item.name && item.name.toLowerCase().includes(searchTermLower)
      );
    }

    return inBasicFields || inShipping || inItems;
  });

  const sortedOrders = [...filteredOrders].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];
    if (!aValue) return 1;
    if (!bValue) return -1;
    if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }
    if (sortField === 'createdAt') {
      if (aValue.toMillis) aValue = aValue.toMillis();
      if (bValue.toMillis) bValue = bValue.toMillis();
    }
    return sortDirection === 'asc'
      ? aValue > bValue ? 1 : -1
      : aValue < bValue ? 1 : -1;
  });

  // Helper to format timestamps.
  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    if (timestamp.toDate) {
      const date = timestamp.toDate();
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    if (timestamp instanceof Date) {
      return timestamp.toLocaleDateString() + ' ' + timestamp.toLocaleTimeString();
    }
    if (typeof timestamp === 'number') {
      const date = new Date(timestamp);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    }
    return 'Invalid date';
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold text-blue-800 mb-6">Order Management</h2>

      {/* Search Filter */}
      <div className="flex flex-col md:flex-row md:justify-between mb-6 space-y-4 md:space-y-0 md:space-x-4">
        <div className="relative w-full md:w-80">
          <input
            type="text"
            placeholder="Search orders by name, email, phone, etc."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="border p-2 rounded w-full pl-10"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-5 w-5 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('createdAt')}>
                Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Details</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading orders...
                </td>
              </tr>
            ) : sortedOrders.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-4 text-center text-sm text-gray-500">
                  No orders found
                </td>
              </tr>
            ) : (
              sortedOrders.map((order) => (
                <React.Fragment key={order.id}>
                  <tr
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.orderId || order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {order.shippingInfo ? (
                        <div className="space-y-1">
                          <div className="text-sm font-medium text-gray-900">Name: {order.shippingInfo.fullName}</div>
                          <div className="text-sm text-gray-500">Phone: {order.shippingInfo.phone}</div>
                          <div className="text-sm text-gray-500">Email: {order.shippingInfo.email}</div>
                          <div className="text-sm text-gray-500">
                            Address: {order.shippingInfo.address}, {order.shippingInfo.city}, {order.shippingInfo.state}
                          </div>
                          <div className="text-sm text-gray-500">Pin: {order.shippingInfo.zipCode}</div>
                        </div>
                      ) : (
                        <div className="text-sm font-medium text-gray-900">No Customer Data</div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        {order.items &&
                          order.items.map((item, index) => (
                            <div key={index}>
                              <span className="font-medium">{item.name}</span> — Qty: {item.quantity}
                            </div>
                          ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {order.items && order.items.reduce((acc, item) => acc + item.quantity, 0)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {`₹${order.total ? order.total.toFixed(2) : '0.00'}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full text-white ${order.status && order.status.toLowerCase() === 'shipped' ? 'bg-blue-500' : 'bg-yellow-500'}`}>
                        {order.status ? order.status.toLowerCase() : 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        {/* Two status buttons: Pending and Shipped */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetStatus(order.id, 'pending');
                          }}
                          disabled={!order.status || order.status.toLowerCase() === 'pending'}
                          className={`px-3 py-1 rounded ${
                            (!order.status || order.status.toLowerCase() === 'pending')
                              ? 'bg-yellow-500 text-white'
                              : 'bg-white border border-yellow-500 text-yellow-500 hover:bg-yellow-100'
                          }`}
                        >
                          Pending
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSetStatus(order.id, 'shipped');
                          }}
                          disabled={order.status && order.status.toLowerCase() === 'shipped'}
                          className={`px-3 py-1 rounded ${
                            order.status && order.status.toLowerCase() === 'shipped'
                              ? 'bg-blue-500 text-white'
                              : 'bg-white border border-blue-500 text-blue-500 hover:bg-blue-100'
                          }`}
                        >
                          Shipped
                        </button>
                        {/* Delete button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteOrder(order.id);
                          }}
                          className="px-3 py-1 rounded bg-red-500 text-white hover:bg-red-600"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedOrderId === order.id && (
                    <tr>
                      <td colSpan="8" className="px-6 py-4 bg-gray-50">
                        <div className="text-sm text-gray-900">
                          <div className="mb-2 font-semibold flex items-center">
                            <FileText className="w-4 h-4 mr-2" />
                            Order Details
                          </div>
                          <div>
                            <p>
                              <strong>Order ID:</strong> {order.orderId || order.id}
                            </p>
                            <p>
                              <strong>Order Date:</strong> {formatDate(order.createdAt)}
                            </p>
                            <div className="mt-4">
                              <h4 className="font-semibold mb-2">Items:</h4>
                              <div className="space-y-2">
                                {order.items &&
                                  order.items.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 border-b">
                                      <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-gray-500">Quantity: {item.quantity}</p>
                                      </div>
                                      <div className="text-right">
                                        <p>₹{item.price && item.price.toFixed(2)}</p>
                                        <p className="text-sm text-gray-500">
                                          Total: ₹{((item.price || 0) * (item.quantity || 1)).toFixed(2)}
                                        </p>
                                      </div>
                                    </div>
                                  ))}
                              </div>
                              <div className="mt-4 text-right">
                                <p className="font-bold">
                                  Order Total: ₹{order.total ? order.total.toFixed(2) : '0.00'}
                                </p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminOrders;
