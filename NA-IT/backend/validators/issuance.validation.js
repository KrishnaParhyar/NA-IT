const Joi = require('joi');

const issueSchema = Joi.object({
  item_id: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string().pattern(/^\d+$/)
  ).required().custom((value, helpers) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      return helpers.error('any.invalid');
    }
    return num;
  }),
  employee_id: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string().pattern(/^\d+$/)
  ).required().custom((value, helpers) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      return helpers.error('any.invalid');
    }
    return num;
  }),
  issue_date: Joi.date().required(),
  status: Joi.string().valid('Issued').required(),
});

const receiveSchema = Joi.object({
  log_id: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string().pattern(/^\d+$/)
  ).required().custom((value, helpers) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      return helpers.error('any.invalid');
    }
    return num;
  }),
  return_date: Joi.date().required(),
  status: Joi.string().valid('Returned').required(),
});

const issuePeripheralsSchema = Joi.object({
  item_ids: Joi.array().items(Joi.number().integer()).min(1).required(),
  employee_id: Joi.alternatives().try(
    Joi.number().integer(),
    Joi.string().pattern(/^\d+$/)
  ).required().custom((value, helpers) => {
    const num = parseInt(value, 10);
    if (isNaN(num)) {
      return helpers.error('any.invalid');
    }
    return num;
  }),
  issue_date: Joi.date().required(),
});

exports.validateIssue = (req, res, next) => {
  const { error } = issueSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Validation error', error: error.details[0].message });
  }
  next();
};

exports.validateReceive = (req, res, next) => {
  const { error } = receiveSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Validation error', error: error.details[0].message });
  }
  next();
};

exports.validateIssuePeripherals = (req, res, next) => {
  const { error } = issuePeripheralsSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Validation error', error: error.details[0].message });
  }
  next();
}; 