const Joi = require('joi');

const itemSchema = Joi.object({
  category_id: Joi.number().integer().required().messages({
    'any.required': 'Category is required',
    'number.base': 'Category must be a number'
  }),
  serial_number: Joi.string().required().messages({
    'string.empty': 'Serial number is required',
    'any.required': 'Serial number is required'
  }),
  brand: Joi.string().required().messages({
    'string.empty': 'Brand is required',
    'any.required': 'Brand is required'
  }),
  model: Joi.string().required().messages({
    'string.empty': 'Model is required',
    'any.required': 'Model is required'
  }),
  specifications: Joi.string().allow('', null).optional(),
  vendor: Joi.string().allow('', null).optional(),
  date_of_purchase: Joi.date().allow('', null).optional(),
  warranty_end_date: Joi.date().allow('', null).optional(),
  status: Joi.string().valid('In Stock', 'Issued', 'Out of Stock').required().messages({
    'any.only': 'Status must be one of: In Stock, Issued, Out of Stock',
    'any.required': 'Status is required'
  }),
}).unknown(true);

// Separate validation for updates - more flexible
const itemUpdateSchema = Joi.object({
  category_id: Joi.number().integer().optional(),
  serial_number: Joi.string().optional(),
  brand: Joi.string().optional(),
  model: Joi.string().optional(),
  specifications: Joi.string().allow('', null).optional(),
  vendor: Joi.string().allow('', null).optional(),
  date_of_purchase: Joi.date().allow('', null).optional(),
  warranty_end_date: Joi.date().allow('', null).optional(),
  status: Joi.string().valid('In Stock', 'Issued', 'Out of Stock').optional(),
}).unknown(true);

exports.validateItem = (req, res, next) => {
  console.log('🔍 VALIDATING ITEM:', req.body);
  const { error } = itemSchema.validate(req.body);
  if (error) {
    console.log('❌ VALIDATION ERROR:', error.details[0].message);
    return res.status(400).json({ message: 'Validation error', error: error.details[0].message });
  }
  console.log('✅ VALIDATION PASSED');
  next();
};

exports.validateItemUpdate = (req, res, next) => {
  console.log('🔍 VALIDATING ITEM UPDATE:', req.body);
  const { error } = itemUpdateSchema.validate(req.body);
  if (error) {
    console.log('❌ UPDATE VALIDATION ERROR:', error.details[0].message);
    return res.status(400).json({ message: 'Validation error', error: error.details[0].message });
  }
  console.log('✅ UPDATE VALIDATION PASSED');
  next();
}; 