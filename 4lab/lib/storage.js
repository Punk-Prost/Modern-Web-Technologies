const STORAGE_KEY =
    "booknest-lab4";


const DEFAULT_FILTERS = {
    query: "programming",
    genre: "all",
    sort: "relevance",
    availableOnly: false
};


/* =========================
   LOAD
   ========================= */

export function loadSavedState() {

    try {

        const data =
            localStorage.getItem(
                STORAGE_KEY
            );


        if (!data) {

            return {
                filters: {
                    ...DEFAULT_FILTERS
                },

                wishlist: []
            };
        }


        const parsed =
            JSON.parse(data);


        return {
            filters: {
                ...DEFAULT_FILTERS,
                ...(parsed.filters ?? {})
            },

            wishlist:
                Array.isArray(
                    parsed.wishlist
                )
                    ? parsed.wishlist
                    : []
        };

    } catch (error) {

        console.warn(
            "Ошибка чтения localStorage:",
            error
        );


        return {
            filters: {
                ...DEFAULT_FILTERS
            },

            wishlist: []
        };
    }
}


/* =========================
   SAVE
   ========================= */

export function saveState(
    filters,
    wishlist
) {

    try {

        const data = {
            filters,
            wishlist
        };


        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(data)
        );

    } catch (error) {

        console.warn(
            "Ошибка сохранения localStorage:",
            error
        );
    }
}