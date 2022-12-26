console.log("Setting up craco...");

module.exports = {
    devServer: {
        historyApiFallback: true,
        headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods":
                "GET, POST, PUT, DELETE, PATCH, OPTIONS",
            "Access-Control-Allow-Headers":
                "X-Requested-With, content-type, Authorization",
        },
        https: {
            key: "./certs/key.pem",
            cert: "./certs/cert.pem",
        },
        proxy: {
            "/api": {
                target: "https://127.0.0.1:8000",
                pathRewrite: {
                    "^/api": "/",
                },
                headers: {
                    Connection: "keep-alive",
                },
                changeOrigin: true,
                secure: false,
                compression: false,
            },
        },
    },
};
