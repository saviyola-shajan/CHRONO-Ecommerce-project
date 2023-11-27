const Banner = require("../../models/banner");

module.exports.getBanner = async (req, res) => {
  const banners = await Banner.find({});
  res.render("add-banner", { banners });
};

module.exports.postBanner = async (req, res) => {
  try {
    const { description, startDate, endDate, status } = req.body;
    const photoPath = req.file.path;
    const newBanner = new Banner({
      description,
      startDate,
      endDate,
      status,
      photo: photoPath,
    });
    await newBanner.save();
    res.redirect("/admin/banner");
  } catch (error) {}
};

module.exports.getEditBanner = async (req, res) => {
  try {
    const bannerId = req.query.bannerId;
    const banner = await Banner.findOne({ _id: bannerId });
    res.render("edit-banner", { banner });
  } catch (error) {
    console.log(error);
  }
};

module.exports.postEditedBanner = async (req, res) => {
  try {
    const banner = req.params.bannerId;
    const { description, startDate, endDate } = req.body;
    const newPhoto = req.file;
    const existingBanner = await Banner.findOne({ _id: banner });
    if (newPhoto) {
      existingBanner.photo = newPhoto.path;
    }
    (existingBanner.description = description),
      (existingBanner.startDate = startDate),
      (existingBanner.endDate = endDate),
      await existingBanner.save();
    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error);
  }
};

module.exports.unblockBanner = async (req, res) => {
  try {
    const bannerid = req.params.bannerId;
    const newStatus = await Banner.findById({ _id: bannerid });
    const updatedResult = await Banner.updateOne(
      { _id: bannerid },
      { $set: { status: "Active" } }
    );
    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error);
  }
};

module.exports.blockBanner = async (req, res) => {
  try {
    const bannerid = req.params.bannerId;
    const newStatus = await Banner.findById({ _id: bannerid });
    const updatedResult = await Banner.updateOne(
      { _id: bannerid },
      { $set: { status: "Inactive" } }
    );
    res.redirect("/admin/banner");
  } catch (error) {
    console.log(error);
  }
};
