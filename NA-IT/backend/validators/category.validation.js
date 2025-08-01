const Joi = require('joi');

const categorySchema = Joi.object({
  category_name: Joi.string().required(),
});

exports.validateCategory = (req, res, next) => {
  const { error } = categorySchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Validation error', error: error.details[0].message });
  }
  next();
}; 