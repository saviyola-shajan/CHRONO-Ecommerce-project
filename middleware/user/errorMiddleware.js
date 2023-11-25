module.exports.errorMiddleware = (err, req, res, next) => {
  res.status(500).render("error-page-500", { err });
};
