import {
    request
} from "./client.js";


const PAGE_SIZE = 20;


/* =========================
   ОБЛОЖКА
   ========================= */

function getCoverUrl(
    coverId,
    size = "M"
) {

    if (!coverId) {

        return null;
    }


    return (
        "https://covers.openlibrary.org" +
        `/b/id/${coverId}-${size}.jpg`
    );
}


/* =========================
   НОРМАЛИЗАЦИЯ КНИГИ
   ========================= */

function normalizeBook(doc) {

    const key =
        doc.key ?? "";


    const id =
        key.replace(
            "/works/",
            ""
        );


    return {
        id,

        title:
            doc.title ??
            "Без названия",

        author:
            doc.author_name?.[0] ??
            "Автор неизвестен",

        year:
            doc.first_publish_year ??
            null,

        rating:
            Number(
                doc.ratings_average ??
                0
            ),

        available:
            Boolean(
                doc.public_scan_b
            ),

        cover:
            getCoverUrl(
                doc.cover_i
            )
    };
}


/* =========================
   QUERY
   ========================= */

function buildSearchQuery({
    query,
    genre,
    availableOnly
}) {

    const parts = [];


    if (query) {

        parts.push(query);
    }


    if (
        genre &&
        genre !== "all"
    ) {

        parts.push(
            `subject:${genre}`
        );
    }


    if (availableOnly) {

        parts.push(
            "public_scan_b:true"
        );
    }


    return parts.join(" ");
}


/* =========================
   SEARCH
   ========================= */

export async function searchBooks({
    query,
    genre,
    availableOnly,
    sort,
    page = 1,
    signal
}) {

    const searchQuery =
        buildSearchQuery({
            query,
            genre,
            availableOnly
        });


    const data =
        await request(
            "/search.json",
            {
                params: {
                    q: searchQuery,

                    page,

                    limit:
                        PAGE_SIZE,

                    fields: [
                        "key",
                        "title",
                        "author_name",
                        "first_publish_year",
                        "cover_i",
                        "ratings_average",
                        "public_scan_b"
                    ].join(",")
                },

                signal
            }
        );


    let items =
        (data.docs ?? [])
            .map(
                normalizeBook
            );


    /* =========================
       СОРТИРОВКА
       ========================= */

    if (
        sort === "title"
    ) {

        items =
            [...items].sort(
                (a, b) =>

                    a.title.localeCompare(
                        b.title,
                        "ru"
                    )
            );
    }


    if (
        sort === "new"
    ) {

        items =
            [...items].sort(
                (a, b) =>

                    (b.year ?? 0) -
                    (a.year ?? 0)
            );
    }


    if (
        sort === "rating"
    ) {

        items =
            [...items].sort(
                (a, b) =>

                    b.rating -
                    a.rating
            );
    }


    const total =
        data.numFound ??
        data.num_found ??
        0;


    const totalPages =
        Math.max(
            1,

            Math.ceil(
                total /
                PAGE_SIZE
            )
        );


    return {
        items,
        total,
        page,
        totalPages
    };
}


/* =========================
   DETAILS
   ========================= */

export async function getBookDetails(
    id,
    signal
) {

    const [
        work,
        ratings
    ] = await Promise.all([

        request(
            `/works/${id}.json`,
            {
                signal
            }
        ),

        request(
            `/works/${id}/ratings.json`,
            {
                signal
            }
        )

    ]);


    let description =
        "Описание отсутствует.";


    if (
        typeof work.description ===
        "string"
    ) {

        description =
            work.description;

    } else if (
        work.description?.value
    ) {

        description =
            work.description.value;
    }


    return {
        id,

        title:
            work.title ??
            "Без названия",

        description,

        subjects:
            Array.isArray(
                work.subjects
            )
                ? work.subjects.slice(
                    0,
                    10
                )
                : [],

        cover:
            getCoverUrl(
                work.covers?.[0],
                "L"
            ),

        rating:
            Number(
                ratings?.summary?.average ??
                0
            )
    };
}