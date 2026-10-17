import {
    ApiError,
    NetworkError
} from "./api/client.js";


import {
    getBookDetails
} from "./api/books.js";


const loading =
    document.querySelector(
        "#detail-loading"
    );


const errorBox =
    document.querySelector(
        "#detail-error"
    );


const errorMessage =
    document.querySelector(
        "#detail-error-message"
    );


const content =
    document.querySelector(
        "#detail-content"
    );


const title =
    document.querySelector(
        "#detail-title"
    );


const image =
    document.querySelector(
        "#detail-image"
    );


const description =
    document.querySelector(
        "#detail-description"
    );


const rating =
    document.querySelector(
        "#detail-rating"
    );


const subjects =
    document.querySelector(
        "#detail-subjects"
    );


const issueLink =
    document.querySelector(
        "#issue-book-link"
    );


function showError(message) {

    loading.hidden =
        true;

    content.hidden =
        true;

    errorBox.hidden =
        false;

    errorMessage.textContent =
        message;
}


async function loadBook() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    if (!id) {

        showError(
            "Книга не выбрана. Вернитесь в каталог."
        );

        return;
    }


    const controller =
        new AbortController();


    try {

        const book =
            await getBookDetails(
                id,
                controller.signal
            );


        document.title =
            `BookNest — ${book.title}`;


        title.textContent =
            book.title;


        description.textContent =
            book.description;


        rating.textContent =
            book.rating > 0
                ? book.rating.toFixed(1)
                : "нет оценок";


        /*
            Передаём ID книги
            на страницу выдачи.
        */
        issueLink.href =
            `lab1.3.html?id=${encodeURIComponent(id)}`;


        if (book.cover) {

            image.src =
                book.cover;

            image.alt =
                `Обложка книги ${book.title}`;

            image.hidden =
                false;

        } else {

            image.hidden =
                true;
        }


        subjects.replaceChildren();


        if (
            book.subjects.length === 0
        ) {

            const item =
                document.createElement(
                    "li"
                );

            item.textContent =
                "Темы не указаны";

            subjects.append(
                item
            );

        } else {

            book.subjects.forEach(
                (subject) => {

                    const item =
                        document.createElement(
                            "li"
                        );

                    item.textContent =
                        subject;

                    subjects.append(
                        item
                    );
                }
            );
        }


        loading.hidden =
            true;

        errorBox.hidden =
            true;

        content.hidden =
            false;

    } catch (error) {

        if (
            error instanceof ApiError &&
            error.status === 404
        ) {

            showError(
                "Книга не найдена. Ошибка 404."
            );

            return;
        }


        if (
            error instanceof NetworkError
        ) {

            showError(
                "Нет подключения к интернету."
            );

            return;
        }


        showError(
            "Произошла ошибка при загрузке книги."
        );
    }
}


loadBook();