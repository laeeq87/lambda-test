require("dotenv").config();

const fs = require("fs");
const mongoose = require("mongoose");
const { Parser } = require("json2csv");
const moment = require("moment-timezone");
const Client = require("ssh2-sftp-client");
const Campaign = require("./models/campaign");

const currentDate = moment().format("YYYY-MM-DD");
const nextDate = moment().add(1, "days").format("YYYY-MM-DD");

const remoteDir = `/uploads/${currentDate}`;
const uploadBasePath = `/uploads/${currentDate}`;

const sftp = new Client();

exports.handler = async (event) => {
  try {
    //Set up default mongoose connection
    const mongoDB = process.env.DB_URL;
    await mongoose
      .connect(mongoDB, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false,
      })
      .catch((err) => {
        console.log("Error in DB connectivity :", err.message);
        return err;
      });

    const campaignsArray = [];
    const responseArray = [];
    const recepientArray = [];
    const smsArray = [];
    const fromDate = new Date("2020-04-21");
    const toDate = new Date("2020-04-22");

    const campaigns = await Campaign.fetchPopulatedCampaign(fromDate, toDate);

    campaigns.map((campaign) => {
      // CAMPAIGN MAP

      campaignsArray.push({
        // Campaigns Push
        cmpgId: campaign.cmpgId,
        name: campaign.name,
        message: campaign.message,
        messageServiceSid: campaign.messageServiceSid,
        status: campaign.status,
        createdAt: campaign.createdAt,
        startTime: campaign.startTime,
      });

      campaign.responses.map((response) => {
        //RESPONSE MAP & PUSH
        responseArray.push({
          key: response.key,
          message: response.message,
          cmpgId: response.cmpgId,
          optOut: response.optOut,
          createdAt: response.createdAt,
        });
      });

      campaign.recipients.map((recipient) => {
        // RECIPIENT MAP & PUSH
        recepientArray.push({
          practiceName: recipient.practiceName,
          practicePhone: recipient.practicePhone,
          providerName: recipient.providerName,
          patientName: recipient.patientName,
          patientPhone: recipient.patientPhone,
          patientId: recipient.patientId,
          optOut: recipient.optOut,
          cmpgId: recipient.cmpgId,
          createdAt: recipient.createdAt,
        });

        recipient.smses.map((sms) => {
          //SMS MAP & PUSH
          smsArray.push({
            twilioSid: sms.twilioSid,
            smsStatus: sms.smsStatus,
            smsType: sms.smsType,
            smsMessage: sms.smsMessage,
            to: sms.to,
            from: sms.from,
            cmpgId: sms.cmpgId,
            createdAt: sms.createdAt,
          });
        }); // SMES MAP END
      }); // RECIPIENT MAP END
    }); // CAMPAIGNS MAP END

    await sftp
      .connect({
        host: process.env.SFTP_AWS_HOST,
        port: process.env.SFTP_AWS_PORT,
        username: process.env.SFTP_AWS_USERNAME,
        privateKey: fs.readFileSync("./stratifi-smslogging/stratifisms.key"),
      })
      .catch((error) => {
        console.log("Error Connecting To SFTP Server ===> ", error);
        throw error;
      });

    console.log("connected to SFTP server successfully");

    /*------- CREATE Campaign File ------------*/
    if (campaignsArray.length > 0) {
      // Only Create File IF have any data

      /*------- CREATE DIRECTORY ------------*/
      let createDirectory = await sftp.mkdir(remoteDir, true);
      console.log("Create Directory ", createDirectory);

      let campaignsParser = new Parser();
      let campaignsCsv = Buffer.from(campaignsParser.parse(campaignsArray));
      let createCampaignsFile = await sftp.put(
        campaignsCsv,
        `${uploadBasePath}/campaigns.csv`
      );
      console.log("Campaign ==> ", createCampaignsFile);

      if (responseArray.length > 0) {
        let responseParser = new Parser();
        let responseCsv = Buffer.from(responseParser.parse(responseArray));
        let createResponseFile = await sftp.put(
          responseCsv,
          `${uploadBasePath}/response.csv`
        );
        console.log("Response ==> ", createResponseFile);
      }

      if (recepientArray.length > 0) {
        let recipientParser = new Parser();
        let recipientCsv = Buffer.from(recipientParser.parse(recepientArray));
        let createRecipientFile = await sftp.put(
          recipientCsv,
          `${uploadBasePath}/recipient.csv`
        );
        console.log("Recipient ==> ", createRecipientFile);
      }

      if (smsArray.length > 0) {
        let smsParser = new Parser();
        let smsCsv = Buffer.from(smsParser.parse(smsArray));
        let createSMSFile = await sftp.put(smsCsv, `${uploadBasePath}/sms.csv`);
        console.log("SMS ==> ", createSMSFile);
      }
    }

    let response = {
      statusCode: 200,
      body: `created log files on SMTP server`,
    };
    mongoose.connection.close();
    sftp.end();
    return response;
  } catch (error) {
    mongoose.connection.close();
    console.log("Error in try catch", error);
    return error;
  }
};

this.event;
