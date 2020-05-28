const mongoose = require("mongoose");
const momentTz = require("moment-timezone");
const recipientSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    practiceName: { type: String },
    practicePhone: { type: String },
    providerName: { type: String },
    patientName: { type: String },
    patientPhone: { type: String },
    patientId: { type: String },
    optOut: { type: String, default: "no" },
    cmpgId: { type: String },
    smses: [{ type: mongoose.Schema.Types.ObjectId, ref: "Sms" }],
    createdAt: { type: Date, default: new Date().toISOString() }
  },
  { autoCreate: true }
);

recipientSchema.statics.pushSmsId = async function pushSmsId(id, smsId) {
  let recipient = await this.updateOne(
    { _id: id },
    { $push: { smses: smsId } }
  );
  return recipient;
};

recipientSchema.statics.setOptOut = async function setOptOut(id, opt) {
  let recipient = await this.updateOne({ _id: id }, { $set: { optOut: opt } });
  return recipient;
};

module.exports = mongoose.model("Recipient", recipientSchema);
