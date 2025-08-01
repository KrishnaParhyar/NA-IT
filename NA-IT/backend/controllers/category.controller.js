const db = require('../config/db');

// Get all categories
exports.getAllCategories = async (req, res) => {
    try {
        const [categories] = await db.query('SELECT * FROM categories ORDER BY category_name');
        res.status(200).json(categories);
    } catch (error) {
        console.error("GET ALL CATEGORIES ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new category
exports.createCategory = async (req, res) => {
    try {
        const { category_name } = req.body;
        const [result] = await db.query('INSERT INTO categories (category_name) VALUES (?)', [category_name]);
        res.status(201).json({ category_id: result.insertId, category_name });
    } catch (error) {
        console.error("CREATE CATEGORY ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a category
exports.updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const { category_name } = req.body;
        await db.query('UPDATE categories SET category_name = ? WHERE category_id = ?', [category_name, id]);
        res.status(200).json({ category_id: id, category_name });
    } catch (error) {
        console.error("UPDATE CATEGORY ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get category by ID
exports.getCategoryById = async (req, res) => {
    try {
        const { id } = req.params;
        const [categories] = await db.query('SELECT * FROM categories WHERE category_id = ?', [id]);
        if (categories.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        res.status(200).json(categories[0]);
    } catch (error) {
        console.error("GET CATEGORY BY ID ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete a category
exports.deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        console.log('🔍 DELETE CATEGORY REQUEST:', { id, user: req.user });
        
        // Check if category exists
        const [categories] = await db.query('SELECT * FROM categories WHERE category_id = ?', [id]);
        if (categories.length === 0) {
            return res.status(404).json({ message: 'Category not found' });
        }
        
        // Check if category is being used by any items
        const [items] = await db.query('SELECT COUNT(*) as count FROM items WHERE category_id = ?', [id]);
        console.log('🔍 Items using this category:', items[0].count);
        if (items[0].count > 0) {
            console.log('❌ Cannot delete category - being used by items');
            return res.status(400).json({ 
                message: 'Cannot delete category. It is being used by items in the inventory.',
                itemCount: items[0].count
            });
        }
        
        // Delete the category
        await db.query('DELETE FROM categories WHERE category_id = ?', [id]);
        console.log('✅ Category deleted successfully');
        res.status(200).json({ message: 'Category deleted successfully' });
    } catch (error) {
        console.error("DELETE CATEGORY ERROR:", error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
}; 