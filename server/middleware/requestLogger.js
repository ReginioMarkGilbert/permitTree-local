const requestLogger = (req, res, next) => {
    const importantHeaders = ['user-agent', 'origin', 'referer'];
    const filteredHeaders = Object.keys(req.headers)
        .filter(key => importantHeaders.includes(key.toLowerCase()))
        .reduce((obj, key) => {
            obj[key] = req.headers[key];
            return obj;
        }, {});

    // Format the date and time
    const now = new Date();
    const formattedDate = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
    const formattedTime = now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true
    });
    console.log('-----------------------------------------');
    console.log(`[${formattedDate} ${formattedTime}] ${req.method} ${req.path}`);
    if (Object.keys(filteredHeaders).length > 0) {
        console.log('Important Headers:', filteredHeaders);
    }

    // Log presence of authorization header without revealing the token
    if (req.headers.authorization) {
        console.log('Authorization: Present');
    }

    // Log request body for POST and PUT requests, excluding sensitive data
    if (['POST', 'PUT'].includes(req.method) && req.body) {
        const sanitizedBody = { ...req.body };
        // Remove sensitive fields
        delete sanitizedBody.password;
        delete sanitizedBody.token;
        console.log('Request Body:', sanitizedBody);
    }

    next();
};

module.exports = requestLogger;
