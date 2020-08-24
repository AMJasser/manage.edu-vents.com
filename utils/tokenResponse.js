const tokenResponse = (user, statusCode, res) => {
    // Create token
    const token = user.getSignedJwtToken();

    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    if (process.env.NODE_ENV === "production") {
        options.secure = true;
    }

    res
        .status(statusCode)
        .cookie("token", token, options)
        .redirect("/");
}

module.exports = tokenResponse;