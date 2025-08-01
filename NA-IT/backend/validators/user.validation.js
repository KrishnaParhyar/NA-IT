const Joi = require('joi');

const userSchema = Joi.object({
  username: Joi.string().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid('Admin', 'Operator', 'Management').required(),
});

exports.validateUser = (req, res, next) => {
  const { error } = userSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Validation error', error: error.details[0].message });
  }
  next();
}; 