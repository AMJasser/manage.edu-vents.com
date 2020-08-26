const dataValid = (req, res, next) => {
    Object.keys(req.body).forEach(function(key) {
        if (req.body[key] === "") {
            req.body[key] = undefined;
        };
    });

    console.log(req.body);

    if (req.body.location) req.body.location = JSON.parse(req.body.location) || undefined;

    next();
}

module.exports = dataValid;