const BaseController = require('./base.controller');
const usersService = require('../services/users.service');
const asyncHandler = require('../utils/asyncHandler');

class UsersController extends BaseController {
  constructor() {
    super(usersService, 'user');

    this.getAllUsers = this.getAllUsers.bind(this);
    this.getUserById = this.getUserById.bind(this);
    this.getUserPermissions = this.getUserPermissions.bind(this);
  }

  getAllUsers = asyncHandler(async (req, res) => {
    const users = await this.service.findAllUsers();
    res.status(200).json(users);
  });

  getUserById = asyncHandler(async (req, res) => {
    const user = await this.service.findById(req.params.id);
    res.status(200).json(user);
  });

  getUserPermissions = asyncHandler(async (req, res) => {
    const permissions = await this.service.getUserPermissions(req.params.id);
    res.status(200).json(permissions);
  });

}

module.exports = new UsersController();