const offer = require("../../models/offers");

module.exports.getOffers = async (req, res) => {
  try {
    const offers = await offer.find({});
    res.render("admin-offers", { offers });
  } catch (error) {
    console.log(error);
  }
};

module.exports.getAddOffer = async (req, res) => {
  try {
    res.render("add-offers");
  } catch (error) {
    console.log(error);
  }
};

module.exports.postAddedOffer = async (req, res) => {
  try {
    const { offerName, offerType, offerAmount, endDate, startDate, status } =
      req.body;
    const newOffer = new offer({
      offerName,
      offerType,
      offerAmount,
      endDate,
      startDate,
      status,
    });
    await newOffer.save();
    res.redirect("/admin/offers");
  } catch (error) {
    console.log(error);
  }
};

module.exports.blockOffers = async (req, res) => {
  try {
    const offerid = req.params.offerId;
    const newStatus = await offer.findById({ _id: offerid });
    const updatedResult = await offer.updateOne(
      { _id: offerid },
      { $set: { status: "Inactive" } }
    );
    res.redirect("/admin/offers");
  } catch (error) {
    console.log(error);
  }
};

module.exports.unblockOffer = async (req, res) => {
  try {
    const offerid = req.params.offerId;
    const newStatus = await offer.findById({ _id: offerid });
    const updatedResult = await offer.updateOne(
      { _id: offerid },
      { $set: { status: "Active" } }
    );
    res.redirect("/admin/offers");
  } catch (error) {
    console.log(error);
  }
};

module.exports.getEditOffer = async (req, res) => {
  try {
    const offerid = req.params.offerId;
    const editOffer = await offer.findOne({ _id: offerid });
    res.render("edit-offers", { editOffer });
  } catch (error) {
    console.log(error);
  }
};

module.exports.postEditedOffer = async (req, res) => {
  try {
    const offerid = req.body.editoffer;
    const { offerName, offerType, offerAmount, endDate, startDate } = req.body;
    const existingOffer = await offer.findById({ _id: offerid });

    (existingOffer.offerName = offerName),
      (existingOffer.offerType = offerType);
    existingOffer.offerAmount = offerAmount;
    existingOffer.endDate = endDate;
    existingOffer.startDate = startDate;
    await existingOffer.save();
    res.redirect("/admin/offers");
  } catch (error) {
    console.log(error);
  }
};
