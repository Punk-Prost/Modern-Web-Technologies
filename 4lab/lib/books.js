export function sortBooks(
    books,
    sortType
) {

    const result =
        [...books];


    if (
        sortType === "title"
    ) {

        return result.sort(
            (a, b) =>

                a.title.localeCompare(
                    b.title,
                    "ru"
                )
        );
    }


    if (
        sortType === "new"
    ) {

        return result.sort(
            (a, b) =>

                (b.year ?? 0) -
                (a.year ?? 0)
        );
    }


    if (
        sortType === "rating"
    ) {

        return result.sort(
            (a, b) =>

                (b.rating ?? 0) -
                (a.rating ?? 0)
        );
    }


    return result;
}


export function filterAvailable(
    books,
    onlyAvailable
) {

    if (!onlyAvailable) {

        return [...books];
    }


    return books.filter(
        (book) =>
            book.available
    );
}


export function searchLocalBooks(
    books,
    searchValue
) {

    const value =
        searchValue
            .trim()
            .toLowerCase();


    if (!value) {

        return [...books];
    }


    return books.filter(
        (book) => {

            const title =
                book.title
                    .toLowerCase();


            const author =
                book.author
                    .toLowerCase();


            return (
                title.includes(value) ||
                author.includes(value)
            );
        }
    );
}


export function getBookById(
    books,
    id
) {

    return books.find(
        (book) =>
            String(book.id) ===
            String(id)
    ) ?? null;
}


export function isInWishlist(
    wishlist,
    id
) {

    return wishlist.some(
        (book) =>
            String(book.id) ===
            String(id)
    );
}


export function addToWishlist(
    wishlist,
    book
) {

    const exists =
        isInWishlist(
            wishlist,
            book.id
        );


    if (exists) {

        return [...wishlist];
    }


    return [
        ...wishlist,
        book
    ];
}


export function removeFromWishlist(
    wishlist,
    id
) {

    return wishlist.filter(
        (book) =>
            String(book.id) !==
            String(id)
    );
}


export function toggleWishlist(
    wishlist,
    book
) {

    const exists =
        isInWishlist(
            wishlist,
            book.id
        );


    if (exists) {

        return removeFromWishlist(
            wishlist,
            book.id
        );
    }


    return addToWishlist(
        wishlist,
        book
    );
}


export function getWishlistIds(
    wishlist
) {

    return wishlist.map(
        (book) =>
            book.id
    );
}


export function clampPage(
    page,
    totalPages
) {

    if (page < 1) {

        return 1;
    }


    if (
        page >
        totalPages
    ) {

        return totalPages;
    }


    return page;
}