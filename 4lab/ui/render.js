function createElement(
    tag,
    className,
    text
) {

    const element =
        document.createElement(tag);


    if (className) {

        element.className =
            className;
    }


    if (
        text !== undefined
    ) {

        element.textContent =
            text;
    }


    return element;
}


/* =========================
   CARD
   ========================= */

function createBookCard(
    book,
    isWishlisted
) {

    const article =
        createElement(
            "article",
            "book-card"
        );


    article.dataset.id =
        book.id;


    /* Обложка */

    if (book.cover) {

        const image =
            createElement(
                "img",
                "book-card__image"
            );


        image.src =
            book.cover;


        image.alt =
            `Обложка книги ${book.title}`;


        image.width =
            360;


        image.height =
            520;


        image.addEventListener(
            "error",
            () => {

                image.hidden =
                    true;
            }
        );


        article.append(
            image
        );
    }


    /* Название */

    const title =
        createElement(
            "h3",
            "",
            book.title
        );


    /* Автор */

    const author =
        createElement(
            "p",
            "book-author",
            book.author
        );


    /* Год */

    const year =
        createElement(
            "p",
            "",
            book.year
                ? `Год: ${book.year}`
                : "Год неизвестен"
        );


    /* Рейтинг */

    const rating =
        createElement(
            "p",
            "book-rating",
            book.rating > 0
                ? `★ ${book.rating.toFixed(1)}`
                : "Нет рейтинга"
        );


    /* Статус */

    const status =
        createElement(
            "p",
            "status",
            book.available
                ? "Доступна онлайн"
                : "Недоступна онлайн"
        );


    if (!book.available) {

        status.classList.add(
            "status--unavailable"
        );
    }


    /* Подробнее */

    const details =
        createElement(
            "a",
            "button button--secondary",
            "Подробнее"
        );


    details.href =
        `lab1.2.html?id=${encodeURIComponent(book.id)}`;


    /* Wishlist */

    const wishlistButton =
        createElement(
            "button",
            "button wishlist-button",
            isWishlisted
                ? "✓ В моём списке"
                : "Хочу прочитать"
        );


    wishlistButton.type =
        "button";


    wishlistButton.dataset.action =
        "wishlist";


    wishlistButton.dataset.id =
        book.id;


    wishlistButton.setAttribute(
        "aria-pressed",
        String(
            isWishlisted
        )
    );


    if (isWishlisted) {

        wishlistButton.classList.add(
            "wishlist-button--active"
        );
    }


    article.append(
        title,
        author,
        year,
        rating,
        status,
        details,
        wishlistButton
    );


    return article;
}


/* =========================
   BOOK LIST
   ========================= */

export function renderBookList(
    container,
    books,
    wishlist
) {

    container.replaceChildren();


    const fragment =
        document.createDocumentFragment();


    books.forEach(
        (book) => {

            const card =
                createBookCard(
                    book,
                    wishlist.some(
                        (item) =>
                            item.id ===
                            book.id
                    )
                );


            fragment.append(
                card
            );
        }
    );


    container.append(
        fragment
    );
}


/* =========================
   WISHLIST
   ========================= */

export function renderWishlist(
    container,
    wishlist
) {

    container.replaceChildren();


    wishlist.forEach(
        (book) => {

            const article =
                createElement(
                    "article",
                    "book-card"
                );


            const title =
                createElement(
                    "h3",
                    "",
                    book.title
                );


            const author =
                createElement(
                    "p",
                    "",
                    book.author
                );


            const removeButton =
                createElement(
                    "button",
                    "button button--secondary",
                    "Удалить из списка"
                );


            removeButton.type =
                "button";


            removeButton.dataset.action =
                "remove-wishlist";


            removeButton.dataset.id =
                book.id;


            article.append(
                title,
                author,
                removeButton
            );


            container.append(
                article
            );
        }
    );
}