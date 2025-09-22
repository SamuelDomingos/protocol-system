const { Op } = require('sequelize');

exports.validateBody = schema => (req, res, next) => {
  const { error, value } = schema.validate(req.body, { stripUnknown: true });
  if (error) return res.status(400).json({ message: error.details[0].message });
  req.validatedBody = value;
  next();
};

exports.checkCpfUnique = (Model) => async (req, res, next) => {
  try {
    const cpf = req.validatedBody?.cpf ?? req.body?.cpf;
    if (!cpf || cpf.trim() === '') return next();

    const where = { cpf };
    if (req.params.id) where.id = { [Op.ne]: req.params.id };

    const exists = await Model.findOne({ where });
    if (exists) {
      return res.status(400).json({ message: 'CPF already registered' });
    }

    next();
  } catch (err) {
    next(err);
  }
};
