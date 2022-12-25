python3 -m uvicorn main:app --reload --reload-include "*.js*" --log-level info --ssl-keyfile "./certs/key.pem" --ssl-certfile "./certs/cert.pem"
