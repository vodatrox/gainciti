from rest_framework.views import exception_handler


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        error_data = {
            "error": {
                "code": _get_error_code(response.status_code),
                "message": _get_error_message(response.data),
                "details": response.data if isinstance(response.data, dict) else {},
            }
        }
        response.data = error_data

    return response


def _get_error_code(status_code):
    codes = {
        400: "bad_request",
        401: "unauthorized",
        403: "forbidden",
        404: "not_found",
        405: "method_not_allowed",
        429: "rate_limited",
        500: "internal_error",
    }
    return codes.get(status_code, "error")


def _get_error_message(data):
    if isinstance(data, dict):
        if "detail" in data:
            return str(data["detail"])
        first_key = next(iter(data), None)
        if first_key:
            value = data[first_key]
            if isinstance(value, list):
                return str(value[0])
            return str(value)
    if isinstance(data, list) and data:
        return str(data[0])
    return "An error occurred"
