const Joi = require('joi');

const designationSchema = Joi.object({
  designation_title: Joi.string().required(),
});

exports.validateDesignation = (req, res, next) => {
  const { error } = designationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ message: 'Validation error', error: error.details[0].message });
  }
  next();
}; 