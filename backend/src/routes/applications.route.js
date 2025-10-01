const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const { authenticate } = require("../middlewares/authMiddleware");

const applicationsController = require("../controllers/applications.controller");

router.post(
  "/",
  authenticate,
  upload.single("clientPhoto"),
  applicationsController.createApplication
);

router.put("/:id", authenticate, applicationsController.updateApplication);

router.delete("/:id", authenticate, applicationsController.deleteApplication);

router.get(
  "/stage/:stageId",
  authenticate,
  applicationsController.getApplicationsByStage
);

router.post(
  "/:userId/force-complete",
  authenticate,
  applicationsController.completeApplication
);

router.get("/", authenticate, applicationsController.getAllApplications);
module.exports = router;
