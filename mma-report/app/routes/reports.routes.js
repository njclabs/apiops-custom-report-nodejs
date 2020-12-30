const controller = require("../controllers/reportsController");

module.exports = function (app) {
    app.use(function (req, res, next) {
        res.header(
            "Access-Control-Allow-Headers"
        );
        next();
    });

    app.get(
        "/",
        controller.fetchReports
    );
};