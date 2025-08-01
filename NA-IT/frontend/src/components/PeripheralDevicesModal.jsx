import React, { useState, useEffect } from 'react';
import itemService from '../services/itemService';
import categoryService from '../services/categoryService';

const PeripheralDevicesModal = ({ isOpen, onClose, onSelectDevices, selectedDevices = [] }) => {
  const [devices, setDevices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedItems, setSelectedItems] = useState(selectedDevices);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Define peripheral device categories
  const peripheralCategories = ['Mouse', 'Keyboard', 'Speaker', 'Monitor', 'Headphone', 'Webcam', 'Microphone', 'Printer', 'Scanner', 'USB Drive', 'External Hard Drive', 'Network Cable', 'Power Cable', 'Adapter'];

  useEffect(() => {
    if (isOpen) {
      fetchDevices();
      setSelectedItems(selectedDevices);
    }
  }, [isOpen, selectedDevices]);

  const fetchDevices = async () => {
    setLoading(true);
    try {
      // First get all categories
      const categoriesRes = await categoryService.getAllCategories();
      setCategories(categoriesRes.data);
      
      // Get peripheral category IDs
      const peripheralCategoryIds = categoriesRes.data
        .filter(cat => peripheralCategories.includes(cat.category_name))
        .map(cat => cat.category_id);

      if (peripheralCategoryIds.length > 0) {
        // Get all items and filter for peripheral devices
        const itemsRes = await itemService.getAllItems();
        const peripheralItems = itemsRes.data.filter(item => 
          peripheralCategoryIds.includes(item.category_id) && 
          item.status === 'In Stock'
        );
        setDevices(peripheralItems);
      } else {
        setDevices([]);
      }
      setError('');
    } catch (err) {
      setError('Failed to fetch peripheral devices.');
      console.error(err);
    }
    setLoading(false);
  };

  const handleDeviceToggle = (device) => {
    setSelectedItems(prev => {
      const isSelected = prev.some(item => item.item_id === device.item_id);
      if (isSelected) {
        return prev.filter(item => item.item_id !== device.item_id);
      } else {
        return [...prev, device];
      }
    });
  };

  const handleConfirm = () => {
    onSelectDevices(selectedItems);
    onClose();
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.category_id === categoryId);
    return category ? category.category_name : 'Unknown';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Select Peripheral Devices</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded mb-4">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <p>Loading peripheral devices...</p>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto mb-4">
              {devices.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {devices.map((device) => {
                    const isSelected = selectedItems.some(item => item.item_id === device.item_id);
                    return (
                      <div
                        key={device.item_id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          isSelected 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => handleDeviceToggle(device)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{device.brand} {device.model}</h3>
                            <p className="text-sm text-gray-600">{device.serial_number}</p>
                            <p className="text-xs text-gray-500">{getCategoryName(device.category_id)}</p>
                            {device.specifications && (
                              <p className="text-xs text-gray-500 mt-1">{device.specifications}</p>
                            )}
                          </div>
                          <div className="ml-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleDeviceToggle(device)}
                              className="h-4 w-4 text-blue-600 rounded"
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No available peripheral devices found.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Make sure you have items in categories like Mouse, Keyboard, Speaker, etc.
                  </p>
                </div>
              )}
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
              <div className="text-sm text-gray-600">
                {selectedItems.length} device(s) selected
              </div>
              <div className="space-x-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  disabled={selectedItems.length === 0}
                >
                  Confirm Selection ({selectedItems.length})
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PeripheralDevicesModal; 