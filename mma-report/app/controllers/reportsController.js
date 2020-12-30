let reportsService = require("../services/reportsService");

exports.fetchReports = async function (req, res) {
    try {
        let reportsGenrated = await reportsService.fetchReports(req, res);
        res.render('index', { complex: reportsGenrated.complex, time: reportsGenrated.time, cost: reportsGenrated.cost, data: reportsGenrated.data });
    } catch (er) {
        res.status(500).send({ errorCode: 500, errorMessage: er })
    }
}