module.exports = {
    errors: {
        MESSAGE_NOT_FOUND_AGAINST_DOCUMENT_ID: "Message not found against provided documentId",
        INTERNAL_SERVER_ERROR: "Something went wrong, internal server error has occured",
        COLLECTION_NOT_FOUND: "Collection does not exist in Database",
        REPORT_FILTER_OPTION_REQUIRED: "Filter Options are required.",
        REPORT_NOT_FOUND: "Data not found against the provided filters."
    },
    responses: {
        auth: {
            invalidCredentialsMessage: "Invalid Credentials. Provided username/password combination not found",
            invalidTokenResponse: "Invalid Token. The provided token is invalid or unauthorized for the requested resource"
        },
    },
    auth: {
        jwtSecret: 'PLwJKm955eksnWWDQ)/8P(*)OpjmksnOk'
    },
};