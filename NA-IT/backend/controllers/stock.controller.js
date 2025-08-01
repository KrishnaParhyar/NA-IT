const stockModel = require('../models/stock.model');

exports.getAllStock = (req, res) => {
  stockModel.getAllStock((err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(200).json(results);
  });
};

exports.getStockById = (req, res) => {
  const { id } = req.params;
  stockModel.getStockById(id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    if (!results.length) return res.status(404).json({ message: 'Stock record not found' });
    res.status(200).json(results[0]);
  });
};

exports.createStock = (req, res) => {
  const { item_id, quantity_in_stock } = req.body;
  if (!item_id || quantity_in_stock === undefined) return res.status(400).json({ message: 'Please provide item_id and quantity_in_stock.' });
  stockModel.createStock(item_id, quantity_in_stock, (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    res.status(201).json({ message: 'Stock record created successfully!', stockId: result.insertId });
  });
};

exports.updateStock = (req, res) => {
  const { id } = req.params;
  const { quantity_in_stock } = req.body;
  if (quantity_in_stock === undefined) return res.status(400).json({ message: 'Please provide quantity_in_stock.' });
  stockModel.updateStock(id, quantity_in_stock, (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Stock record not found.' });
    res.status(200).json({ message: 'Stock updated successfully!' });
  });
};

exports.deleteStock = (req, res) => {
  const { id } = req.params;
  stockModel.deleteStock(id, (err, result) => {
    if (err) return res.status(500).json({ message: 'Server error', error: err.message });
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Stock record not found.' });
    res.status(200).json({ message: 'Stock record deleted successfully!' });
  });
}; 