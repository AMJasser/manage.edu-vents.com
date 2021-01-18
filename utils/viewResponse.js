const viewResponse = (view, vars, res) => {
    res.status(200).render(view, vars, function(err, html) {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Error rendering view`, 500));
        } else {
            res.send(html);
        }
    });
}

module.exports = viewResponse;