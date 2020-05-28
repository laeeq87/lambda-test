const mongoose = require("mongoose");
const momentTz = require("moment-timezone");
const smsSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    //smsId: { type: Number, unique: true, required: true },
    twilioSid: { type: String },
    smsStatus: { type: String },
    smsType: { type: String },
    smsMessage: { type: String },
    to: { type: String },
    from: { type: String },
    cmpgId: { type: String },
    createdAt: {
      type: Date,
      default: new Date().toISOString()
    }
  },
  { autoCreate: true }
);

smsSchema.statics.setSmsStatus = async function setSmsStatus(
  twilioSid,
  status
) {
  return await this.updateOne(
    { twilioSid: twilioSid, smsStatus: { $ne: "delivered" } },
    { $set: { smsStatus: status } }
  );
};

smsSchema.statics.setSmsFromPhone = async function setSmsFromPhone(
  twilioSid,
  fromPhone
) {
  return await this.updateOne(
    { twilioSid: twilioSid },
    { $set: { from: fromPhone } }
  );
};
module.exports = mongoose.model("Sms", smsSchema);
