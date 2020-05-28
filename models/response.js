const mongoose = require("mongoose");
const responseSchema = new mongoose.Schema(
  {
    _id: mongoose.Schema.Types.ObjectId,
    key: { type: String, required: true },
    message: { type: String, required: true },
    cmpgId: { type: String },
    optOut: { type: String },
    createdAt: {
      type: Date,
      default: new Date().toISOString(),
    },
  },
  { autoCreate: true }
);

responseSchema.statics.getLatestResponseBasedOnMessage = async function getLatestResponseBasedOnMessage(
  message
) {
  return await this.findOne({
    $text: { $search: message, $caseSensitive: false },
  })
    .sort({ createdAt: "desc" })
    .catch((err) => {
      throw err;
    });
};
module.exports = mongoose.model("Response", responseSchema);
