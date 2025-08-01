const Joi = require('joi');

const itemSchema = Joi.object({
  category_id: Joi.number().integer().required(),
  serial_number: Joi.string().required(),
  brand: Joi.string().required(),
  model: Joi.string().required(),
  specifications: Joi.string().allow('', null),
  vendor: Joi.string().allow('', null).optional(),
  date_of_purchase: Joi.date().required(),
  status: Joi.string().valid('In Stock', 'Issued', 'Out of Stock').required(),
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