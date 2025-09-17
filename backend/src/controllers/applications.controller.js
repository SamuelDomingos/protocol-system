const { Application, Stage, User } = require('../models');
const applicationSchema = require('../validation/applicationSchema');

exports.createApplication = async (req, res) => {
  try {
    const isMultipart = req.headers['content-type']?.includes('multipart/form-data');

    const data = isMultipart ? {
      stageId: req.body.stageId,
      appliedAt: req.body.appliedAt,
      clientSignature: req.body.clientSignature,
      nurseSignature: req.body.nurseSignature,
      clientPhoto: req.file?.buffer?.toString('base64') // if using multer
    } : req.body;

    const { error, value } = applicationSchema.validate(data);
    if (error) return res.status(400).json({ message: error.details[0].message });

    const stage = await Stage.findByPk(value.stageId);
    if (!stage) return res.status(400).json({ message: 'Stage not found or already applied' });

    // Salvar aplicação
    const application = await Application.create({
      stageId: value.stageId,
      nurseId: req.user.id,
      appliedAt: value.appliedAt,
      clientPhoto: value.clientPhoto,
      clientSignature: value.clientSignature,
      nurseSignature: value.nurseSignature,
      status: 'applied'
    });

    res.status(201).json(application);
  } catch (err) {
    console.error('❌ Error creating application:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateApplication = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findByPk(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });
    
    res.status(200).json({ message: 'Application updated', application });
  } catch (err) {
    console.error('❌ Error updating application:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.deleteApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const application = await Application.findByPk(id);

    if (!application) return res.status(404).json({ message: 'Application not found' });

    await application.destroy();
    res.status(200).json({ message: 'Application deleted successfully' });
  } catch (err) {
    console.error('❌ Error deleting application:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.getApplicationsByStage = async (req, res) => {
  try {
    const { stageId } = req.params;

    const applications = await Application.findAll({
      where: { stageId },
      include: [
        {
          model: User,
          as: 'nurse',
          attributes: ['id', 'name', 'role']
        },
        {
          model: Stage,
          attributes: ['id', 'name', 'order', 'protocolId']
        }
      ]
    });

    res.status(200).json(applications);
  } catch (err) {
    console.error('❌ Error fetching applications by stage:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.completeApplication = async (req, res) => {
  try {
    const { id } = req.params;
    
    const application = await Application.findByPk(id);
    if (!application) return res.status(404).json({ message: 'Application not found' });

    // Atualizar status e dados
    await application.update({
      status: 'completed',
      completedAt: new Date(),
      completedBy: req.user.id
    });

    res.status(200).json({ message: 'Application completed', application });
  } catch (err) {
    console.error('❌ Error completing application:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
};