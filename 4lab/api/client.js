const BASE_URL =
    "https://openlibrary.org";


export class ApiError extends Error {

    constructor(
        status,
        message
    ) {

        super(message);

        this.name =
            "ApiError";

        this.status =
            status;
    }
}


export class NetworkError extends Error {

    constructor(
        message =
            "Ошибка сети"
    ) {

        super(message);

        this.name =
            "NetworkError";
    }
}


export async function request(
    path,
    {
        params = {},
        signal
    } = {}
) {

    const url =
        new URL(
            path,
            BASE_URL
        );


    const query =
        new URLSearchParams();


    Object.entries(params)
        .forEach(
            ([key, value]) => {

                if (
                    value !== undefined &&
                    value !== null &&
                    value !== ""
                ) {

                    query.set(
                        key,
                        String(value)
                    );
                }
            }
        );


    url.search =
        query.toString();


    try {

        const response =
            await fetch(
                url,
                {
                    signal,

                    headers: {
                        Accept:
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new ApiError(
                response.status,
                `HTTP ошибка ${response.status}`
            );
        }


        return await response.json();

    } catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            throw error;
        }


        if (
            error instanceof
            ApiError
        ) {

            throw error;
        }


        throw new NetworkError(
            "Не удалось подключиться к Open Library."
        );
    }
}