const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
const authRoutes = require('./routes/auth.routes');
const itemRoutes = require('./routes/item.routes');
const categoryRoutes = require('./routes/category.routes');

const issuanceRoutes = require('./routes/issuance.routes');

// New routes
const usersRoutes = require('./routes/users.routes');
const departmentsRoutes = require('./routes/departments.routes');
const designationsRoutes = require('./routes/designations.routes');
const employeesRoutes = require('./routes/employees.routes');
const stockRoutes = require('./routes/stock.routes');
const auditLogsRoutes = require('./routes/audit_logs.routes');
const reportRoutes = require('./routes/report.routes');
const searchRoutes = require('./routes/search.routes');
const documentsRoutes = require('./routes/documents.routes');

app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/categories', categoryRoutes);

app.use('/api/issuance', issuanceRoutes);

// Register new routes
app.use('/api/users', usersRoutes);
app.use('/api/departments', departmentsRoutes);
app.use('/api/designations', designationsRoutes);
app.use('/api/employees', employeesRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/audit-logs', auditLogsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/documents', documentsRoutes);
console.log("✅ Categories route registered successfully.");


// Simple route for testing
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the NA Inventory Management System API.' });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
}); 