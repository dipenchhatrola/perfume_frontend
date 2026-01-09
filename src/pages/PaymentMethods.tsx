// pages/PaymentMethods.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CreditCard, Plus, Trash2, Edit, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const PaymentMethods: React.FC = () => {
  const navigate = useNavigate();
  const [paymentMethods, setPaymentMethods] = useState([
    {
      id: 1,
      type: 'visa',
      last4: '4242',
      expiry: '12/25',
      name: 'John Doe',
      isDefault: true
    },
    {
      id: 2,
      type: 'mastercard',
      last4: '5555',
      expiry: '08/24',
      name: 'John Doe',
      isDefault: false
    },
    {
      id: 3,
      type: 'paypal',
      email: 'john.doe@example.com',
      isDefault: false
    }
  ]);
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [newCard, setNewCard] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: ''
  });

  const handleAddCard = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCard.number || !newCard.expiry || !newCard.cvv || !newCard.name) {
      toast.error('Please fill all fields');
      return;
    }

    const last4 = newCard.number.slice(-4);
    const newPaymentMethod = {
      id: paymentMethods.length + 1,
      type: 'visa',
      last4,
      expiry: newCard.expiry,
      name: newCard.name,
      isDefault: false
    };

    setPaymentMethods([...paymentMethods, newPaymentMethod]);
    setNewCard({ number: '', expiry: '', cvv: '', name: '' });
    setShowAddForm(false);
    toast.success('Payment method added successfully');
  };

  const handleSetDefault = (id: number) => {
    setPaymentMethods(methods =>
      methods.map(method => ({
        ...method,
        isDefault: method.id === id
      }))
    );
    toast.success('Default payment method updated');
  };

  const handleDelete = (id: number) => {
    if (paymentMethods.find(m => m.id === id)?.isDefault) {
      toast.error('Cannot delete default payment method');
      return;
    }
    
    setPaymentMethods(methods => methods.filter(m => m.id !== id));
    toast.success('Payment method removed');
  };

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'visa': return 'VISA';
      case 'mastercard': return 'MasterCard';
      case 'paypal': return 'PayPal';
      default: return 'Card';
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <motion.div 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div 
          className="mb-8 flex justify-between items-center"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          <div>
            <h1 className="text-3xl font-serif font-light tracking-wide">
              Payment Methods
            </h1>
            <p className="text-gray-600 mt-2">
              Manage your payment options for seamless shopping
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
        </motion.div>

        <div className="space-y-8">
          {/* Current Payment Methods */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            whileHover={{ y: -5 }}
          >
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
              Saved Payment Methods
            </h2>
            
            <AnimatePresence>
              <div className="space-y-4">
                {paymentMethods.map((method, index) => (
                  <motion.div
                    key={method.id}
                    className={`flex items-center justify-between p-4 border rounded-lg ${
                      method.isDefault ? 'border-gray-900 bg-gray-50' : 'border-gray-200'
                    }`}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    transition={{ delay: index * 0.1 }}
                    layout
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center">
                      <motion.div 
                        className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center mr-4"
                        whileHover={{ rotate: [0, -10, 10, 0] }}
                        transition={{ duration: 0.3 }}
                      >
                        <CreditCard size={20} className="text-gray-600" />
                      </motion.div>
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">
                            {getCardIcon(method.type)}
                            {method.type !== 'paypal' && ` •••• ${method.last4}`}
                          </span>
                          {method.isDefault && (
                            <motion.span 
                              className="ml-3 bg-gray-900 text-white text-xs px-2 py-1 rounded"
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", stiffness: 200 }}
                            >
                              Default
                            </motion.span>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {method.type === 'paypal' ? (
                            <span>Connected as {method.email}</span>
                          ) : (
                            <span>
                              Expires {method.expiry} • {method.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      {!method.isDefault && (
                        <motion.button
                          onClick={() => handleSetDefault(method.id)}
                          className="text-sm text-gray-700 hover:text-gray-900"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          Set as default
                        </motion.button>
                      )}
                      {method.isDefault && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <Check className="text-green-500" size={20} />
                        </motion.div>
                      )}
                      <motion.button
                        onClick={() => handleDelete(method.id)}
                        className="text-red-600 hover:text-red-700"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Trash2 size={18} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </motion.div>

          {/* Add New Payment Method */}
          <motion.div 
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-800">
                Add New Payment Method
              </h2>
              <motion.button
                onClick={() => setShowAddForm(!showAddForm)}
                className="flex items-center text-gray-700 hover:text-gray-900"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Plus size={20} className="mr-2" />
                {showAddForm ? 'Cancel' : 'Add New Card'}
              </motion.button>
            </div>
            
            <AnimatePresence>
              {showAddForm && (
                <motion.form 
                  onSubmit={handleAddCard} 
                  className="space-y-6"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <motion.div
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 }}
                  >
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={newCard.number}
                      onChange={(e) => setNewCard(prev => ({ ...prev, number: e.target.value }))}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </motion.div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {['Expiry Date', 'CVV', 'Cardholder Name'].map((label, index) => (
                      <motion.div
                        key={label}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: 0.1 + (index * 0.05) }}
                      >
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          {label}
                        </label>
                        <input
                          type="text"
                          value={newCard[label === 'Expiry Date' ? 'expiry' : label === 'CVV' ? 'cvv' : 'name']}
                          onChange={(e) => setNewCard(prev => ({ 
                            ...prev, 
                            [label === 'Expiry Date' ? 'expiry' : label === 'CVV' ? 'cvv' : 'name']: e.target.value 
                          }))}
                          placeholder={label === 'Expiry Date' ? 'MM/YY' : label === 'CVV' ? '123' : 'John Doe'}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                        />
                      </motion.div>
                    ))}
                  </div>
                  
                  <motion.div 
                    className="flex items-center"
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                  >
                    <input
                      type="checkbox"
                      id="saveCard"
                      className="w-4 h-4 text-gray-900 border-gray-300 rounded focus:ring-gray-900"
                    />
                    <label htmlFor="saveCard" className="ml-2 text-sm text-gray-700">
                      Save this card for future purchases
                    </label>
                  </motion.div>
                  
                  <motion.button
                    type="submit"
                    className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800"
                    whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Add Card
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>

          {/* Security Note */}
          <motion.div 
            className="bg-blue-50 border border-blue-200 rounded-xl p-6"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="font-semibold text-blue-900 mb-2">Secure Payment</h3>
            <p className="text-blue-800 text-sm">
              Your payment information is encrypted and secure. We never store your CVV code.
              All transactions are protected by 256-bit SSL encryption.
            </p>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default PaymentMethods;