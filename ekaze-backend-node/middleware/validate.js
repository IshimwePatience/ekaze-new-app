const Joi = require('joi');

const validate = (schema) => (req, res, next) => {
  const validSchema = {};
  ['params', 'query', 'body'].forEach((key) => {
    if (schema[key]) {
      validSchema[key] = schema[key];
    }
  });

  const object = {};
  ['params', 'query', 'body'].forEach((key) => {
    if (schema[key]) {
      object[key] = req[key];
    }
  });

  const { value, error } = Joi.compile(validSchema)
    .prefs({ errors: { label: 'key' }, abortEarly: false, allowUnknown: true })
    .validate(object);

  if (error) {
    const errorMessage = error.details.map((details) => details.message).join(', ');
    return res.status(400).json({
      success: false,
      message: 'Invalid request data',
      errors: errorMessage
    });
  }

  Object.assign(req, value);
  return next();
};

module.exports = validate;
