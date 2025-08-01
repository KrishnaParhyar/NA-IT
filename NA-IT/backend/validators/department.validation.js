const Joi = require('joi');

const departmentSchema = Joi.object({
  department_name: Joi.string().required(),
});

exports.validateDepartment = (req, res, next) => {
  const { error } = departmentSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Validation error', error: error.details[0].message });
  }
  next();
}; 