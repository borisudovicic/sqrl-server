to run this server:

    set env variables:
        DATABASE_URL
        ENVIORNMENT
        MAILBOT_PASSWORD
        SESSION_SECRET

        AWS_ACCESS_KEY_ID
        AWS_SECRET_ACCESS_KEY
        S3_BUCKET

        TWILIO_ACCOUNT_SID
        TWILIO_AUTH_TOKEN
        TWILIO_NUMBER

    create a database and run the SQL code from node_modules>connect-pg-simple>table.sql in it

    nodemon

Notes:
-NO slashes in ChatID for pubnub