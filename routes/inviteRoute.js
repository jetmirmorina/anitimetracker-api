const express = require("express");

const {
  inviteUser,
  acceptInvite,
  getInvites,
  getInvite,
  deleteInvite,
} = require("../controllers/inviteController");
const Invitation = require("../models/invitationModel");
const User = require("../models/userModel");

const advancedResults = require("../middleware/advancedResults");

const router = express.Router({ mergeParams: true });
const { protect } = require("../middleware/auth");

router
  .route("/")
  .post(protect, inviteUser)
  .get(
    protect,
    advancedResults(Invitation, {
      path: "company",
      select: "name description address",
    }),
    getInvites
  );

router.post("/accept-invite/:token", acceptInvite);

router.route("/:id").get(protect, getInvite).delete(protect, deleteInvite);

module.exports = router;
