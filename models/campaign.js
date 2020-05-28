const mongoose = require("mongoose");
const Sms = require("./sms");
const Response = require("./response");
const Recipient = require("./recipient");

const campaignSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    cmpgId: { type: String, required: [true, "Campaign ID is required"] },
    name: { type: String, required: [true, "Campaign Name is required"] },
    message: { type: String, required: true },
    messageServiceSid: { type: String, required: [true, "Message Service ID is required for Campaign"] },
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: "Recipient" }],
    responses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Response" }],
    status: { type: String, default: "processing" },
    createdAt: { type: Date, default: new Date().toISOString() },
    startTime: {
      type: Date, default: new Date().toISOString()
    },
    endTime: {
      type: Date
    },
    total: {
      type: Number,
      default: 0
    }
  },
  { autoCreate: true }
);

campaignSchema.statics.fetchPopulatedCampaign = async function fetchPopulatedCampaign(
  fromDate, toDate
) {
  const campaigns = await this.find({
    createdAt: { $gte: fromDate, $lt: toDate },
  })
    .populate("responses")
    .populate({
      path: "recipients",
      populate: { path: "smses" },
    });
  return campaigns;
};

module.exports = mongoose.model("Campaign", campaignSchema);
