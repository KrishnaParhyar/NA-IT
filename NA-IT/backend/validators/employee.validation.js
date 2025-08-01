const Joi = require('joi');

const employeeSchema = Joi.object({
  employee_name: Joi.string().required(),
  department_id: Joi.number().integer().required(),
  designation_id: Joi.number().integer().required(),
});

exports.validateEmployee = (req, res, next) => {
  const { error } = employeeSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Validation error', error: error.details[0].message });
  }
  next();
}; 