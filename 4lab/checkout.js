import {
    ApiError,
    NetworkError
} from "./api/client.js";


import {
    getBookDetails
} from "./api/books.js";


/* =========================
   DOM
   ========================= */

const loading =
    document.querySelector(
        "#checkout-loading"
    );


const errorBox =
    document.querySelector(
        "#checkout-error"
    );


const errorMessage =
    document.querySelector(
        "#checkout-error-message"
    );


const content =
    document.querySelector(
        "#checkout-content"
    );


const image =
    document.querySelector(
        "#checkout-image"
    );


const title =
    document.querySelector(
        "#checkout-title"
    );


const rating =
    document.querySelector(
        "#checkout-rating"
    );


const bookIdInput =
    document.querySelector(
        "#book-id"
    );


const backToBook =
    document.querySelector(
        "#back-to-book"
    );


const form =
    document.querySelector(
        "#checkout-form"
    );


const submitButton =
    document.querySelector(
        "#submit-button"
    );


const successBox =
    document.querySelector(
        "#checkout-success"
    );


const successMessage =
    document.querySelector(
        "#checkout-success-message"
    );


const dateInput =
    document.querySelector(
        "#date"
    );


let selectedBook =
    null;


/* =========================
   СЕГОДНЯШНЯЯ ДАТА
   ========================= */

function setTodayDate() {

    const today =
        new Date();


    const year =
        today.getFullYear();


    const month =
        String(
            today.getMonth() + 1
        ).padStart(
            2,
            "0"
        );


    const day =
        String(
            today.getDate()
        ).padStart(
            2,
            "0"
        );


    const value =
        `${year}-${month}-${day}`;


    dateInput.value =
        value;


    dateInput.min =
        value;
}


/* =========================
   ERROR
   ========================= */

function showError(
    message
) {

    loading.hidden =
        true;


    content.hidden =
        true;


    errorBox.hidden =
        false;


    errorMessage.textContent =
        message;
}


/* =========================
   ЗАГРУЗКА КНИГИ
   ========================= */

async function loadSelectedBook() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const id =
        params.get("id");


    if (!id) {

        showError(
            "Книга не выбрана. Сначала выберите книгу в каталоге."
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


        selectedBook =
            book;


        document.title =
            `BookNest — Выдача ${book.title}`;


        title.textContent =
            book.title;


        rating.textContent =
            book.rating > 0
                ? book.rating.toFixed(1)
                : "нет оценок";


        bookIdInput.value =
            id;


        backToBook.href =
            `lab1.2.html?id=${encodeURIComponent(id)}`;


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


        loading.hidden =
            true;


        errorBox.hidden =
            true;


        content.hidden =
            false;


        setTodayDate();

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
            "Не удалось загрузить выбранную книгу."
        );
    }
}


/* =========================
   ОФОРМЛЕНИЕ
   ========================= */

form.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        if (!selectedBook) {

            return;
        }


        if (!form.checkValidity()) {

            form.reportValidity();

            return;
        }


        const formData =
            new FormData(form);


        const readerName =
            formData.get(
                "full_name"
            );


        const days =
            formData.get(
                "days"
            );


        /*
            Для ЛР backend пока нет,
            поэтому сохраняем историю
            локально.
        */

        const issue = {

            id:
                crypto.randomUUID(),

            bookId:
                selectedBook.id,

            bookTitle:
                selectedBook.title,

            readerName,

            email:
                formData.get(
                    "email"
                ),

            phone:
                formData.get(
                    "phone"
                ),

            ticket:
                formData.get(
                    "ticket"
                ),

            date:
                formData.get(
                    "date"
                ),

            days:
                Number(days),

            comment:
                formData.get(
                    "comment"
                ),

            createdAt:
                new Date()
                    .toISOString()

        };


        try {

            const saved =
                localStorage.getItem(
                    "booknest-issues"
                );


            const history =
                saved
                    ? JSON.parse(saved)
                    : [];


            const safeHistory =
                Array.isArray(history)
                    ? history
                    : [];


            localStorage.setItem(
                "booknest-issues",

                JSON.stringify([
                    ...safeHistory,
                    issue
                ])
            );

        } catch (error) {

            console.warn(
                "Не удалось сохранить историю выдачи:",
                error
            );
        }


        successMessage.textContent =
            `Книга «${selectedBook.title}» оформлена на ${readerName} сроком на ${days} дней.`;


        successBox.hidden =
            false;


        submitButton.disabled =
            true;


        submitButton.textContent =
            "Оформлено";


        successBox.scrollIntoView({
            behavior:
                "smooth",

            block:
                "center"
        });
    }
);


/* =========================
   RESET
   ========================= */

form.addEventListener(
    "reset",
    () => {

        setTimeout(
            () => {

                setTodayDate();

                successBox.hidden =
                    true;

                submitButton.disabled =
                    false;

                submitButton.textContent =
                    "Оформить выдачу";

            },
            0
        );
    }
);


/* =========================
   START
   ========================= */

loadSelectedBook();