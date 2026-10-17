import {
    ApiError,
    NetworkError
} from "./api/client.js";

import {
    searchBooks
} from "./api/books.js";

import {
    loadSavedState,
    saveState
} from "./lib/storage.js";

import {
    renderBookList,
    renderWishlist
} from "./ui/render.js";


const savedState = loadSavedState();


const state = {
    status: "loading",

    filters: {
        query: savedState.filters.query,
        genre: savedState.filters.genre,
        sort: savedState.filters.sort,
        availableOnly: savedState.filters.availableOnly
    },

    wishlist: savedState.wishlist,

    books: [],

    total: 0,

    page: 1,

    totalPages: 1,

    errorMessage: "",

    emptyMessage: ""
};


/* =========================
   DOM
   ========================= */

const form =
    document.querySelector("#filter-form");

const searchInput =
    document.querySelector("#search");

const genreSelect =
    document.querySelector("#genre");

const sortSelect =
    document.querySelector("#sort");

const availableCheckbox =
    document.querySelector("#available");

const resetButton =
    document.querySelector("#reset-filters");


const loadingState =
    document.querySelector("#loading-state");

const successState =
    document.querySelector("#success-state");

const emptyState =
    document.querySelector("#empty-state");

const errorState =
    document.querySelector("#error-state");


const bookList =
    document.querySelector("#book-list");

const resultCount =
    document.querySelector("#result-count");

const emptyMessage =
    document.querySelector("#empty-message");

const errorMessage =
    document.querySelector("#error-message");


const retryButton =
    document.querySelector("#retry-button");


const previousPageButton =
    document.querySelector("#previous-page");

const nextPageButton =
    document.querySelector("#next-page");

const pageInfo =
    document.querySelector("#page-info");


const wishlistList =
    document.querySelector("#wishlist-list");

const wishlistCount =
    document.querySelector("#wishlist-count");

const wishlistTotal =
    document.querySelector("#wishlist-total");

const wishlistEmpty =
    document.querySelector("#wishlist-empty");


/* =========================
   DEBOUNCE
   ========================= */

let debounceTimer = null;


/* =========================
   ABORT CONTROLLER
   ========================= */

let currentController = null;


/* =========================
   RENDER
   ========================= */

function render() {

    loadingState.hidden =
        state.status !== "loading";

    successState.hidden =
        state.status !== "success";

    emptyState.hidden =
        state.status !== "empty";

    errorState.hidden =
        state.status !== "error";


    searchInput.value =
        state.filters.query;

    genreSelect.value =
        state.filters.genre;

    sortSelect.value =
        state.filters.sort;

    availableCheckbox.checked =
        state.filters.availableOnly;


    if (state.status === "success") {

        renderBookList(
            bookList,
            state.books,
            state.wishlist
        );


        resultCount.textContent =
            `Найдено книг: ${state.total}`;


        pageInfo.textContent =
            `Страница ${state.page} из ${state.totalPages}`;


        previousPageButton.disabled =
            state.page <= 1;


        nextPageButton.disabled =
            state.page >= state.totalPages;
    }


    if (state.status === "empty") {

        emptyMessage.textContent =
            state.emptyMessage;
    }


    if (state.status === "error") {

        errorMessage.textContent =
            state.errorMessage;
    }


    renderWishlist(
        wishlistList,
        state.wishlist
    );


    wishlistCount.textContent =
        String(state.wishlist.length);

    wishlistTotal.textContent =
        String(state.wishlist.length);

    wishlistEmpty.hidden =
        state.wishlist.length > 0;


    saveState(
        state.filters,
        state.wishlist
    );
}


/* =========================
   ЧТЕНИЕ ФИЛЬТРОВ
   ========================= */

function readFilters() {

    state.filters.query =
        searchInput.value.trim();

    state.filters.genre =
        genreSelect.value;

    state.filters.sort =
        sortSelect.value;

    state.filters.availableOnly =
        availableCheckbox.checked;
}


/* =========================
   ОБРАБОТКА ОШИБОК
   ========================= */

function getErrorMessage(error) {

    if (error instanceof NetworkError) {

        return (
            "Нет соединения с интернетом. " +
            "Проверьте подключение и повторите запрос."
        );
    }


    if (error instanceof ApiError) {

        if (
            error.status >= 400 &&
            error.status < 500
        ) {

            return (
                `Ошибка ${error.status}. ` +
                "Сервер не смог обработать запрос."
            );
        }


        if (error.status >= 500) {

            return (
                `Ошибка сервера ${error.status}. ` +
                "Попробуйте повторить запрос позже."
            );
        }
    }


    return "Произошла неизвестная ошибка.";
}


/* =========================
   ЗАГРУЗКА КНИГ
   ========================= */

async function loadBooks() {

    const query =
        state.filters.query.trim();


    if (query.length < 2) {

        if (currentController) {
            currentController.abort();
        }


        state.books = [];

        state.total = 0;

        state.status = "empty";

        state.emptyMessage =
            "Введите минимум 2 символа для поиска.";


        render();

        return;
    }


    if (currentController) {
        currentController.abort();
    }


    const controller =
        new AbortController();


    currentController =
        controller;


    state.status =
        "loading";


    render();


    try {

        const result =
            await searchBooks({
                query: state.filters.query,
                genre: state.filters.genre,
                availableOnly:
                    state.filters.availableOnly,
                sort: state.filters.sort,
                page: state.page,
                signal: controller.signal
            });


        if (
            currentController !==
            controller
        ) {

            return;
        }


        state.books =
            result.items;

        state.total =
            result.total;

        state.totalPages =
            result.totalPages;


        if (
            result.items.length === 0
        ) {

            state.status =
                "empty";

            state.emptyMessage =
                "По вашему запросу ничего не найдено.";

        } else {

            state.status =
                "success";
        }

    } catch (error) {

        if (
            error.name ===
            "AbortError"
        ) {

            return;
        }


        state.status =
            "error";


        state.errorMessage =
            getErrorMessage(error);

    } finally {

        if (
            currentController ===
            controller
        ) {

            render();
        }
    }
}


/* =========================
   ПОИСК С DEBOUNCE
   ========================= */

searchInput.addEventListener(
    "input",
    () => {

        clearTimeout(
            debounceTimer
        );


        readFilters();


        state.page = 1;


        debounceTimer =
            setTimeout(
                () => {
                    loadBooks();
                },
                350
            );
    }
);


/* =========================
   SELECT ЖАНРА
   ========================= */

genreSelect.addEventListener(
    "change",
    () => {

        readFilters();

        state.page = 1;

        loadBooks();
    }
);


/* =========================
   СОРТИРОВКА
   ========================= */

sortSelect.addEventListener(
    "change",
    () => {

        readFilters();

        state.page = 1;

        loadBooks();
    }
);


/* =========================
   ДОСТУПНОСТЬ
   ========================= */

availableCheckbox.addEventListener(
    "change",
    () => {

        readFilters();

        state.page = 1;

        loadBooks();
    }
);


/* =========================
   ФОРМА
   ========================= */

form.addEventListener(
    "submit",
    (event) => {

        event.preventDefault();


        clearTimeout(
            debounceTimer
        );


        readFilters();

        state.page = 1;

        loadBooks();
    }
);


/* =========================
   СБРОС
   ========================= */

resetButton.addEventListener(
    "click",
    () => {

        state.filters = {
            query: "programming",
            genre: "all",
            sort: "relevance",
            availableOnly: false
        };


        state.page = 1;


        render();

        loadBooks();
    }
);


/* =========================
   RETRY
   ========================= */

retryButton.addEventListener(
    "click",
    () => {

        loadBooks();
    }
);


/* =========================
   ПРЕДЫДУЩАЯ СТРАНИЦА
   ========================= */

previousPageButton.addEventListener(
    "click",
    () => {

        if (state.page <= 1) {
            return;
        }


        state.page--;


        loadBooks();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


/* =========================
   СЛЕДУЮЩАЯ СТРАНИЦА
   ========================= */

nextPageButton.addEventListener(
    "click",
    () => {

        if (
            state.page >=
            state.totalPages
        ) {

            return;
        }


        state.page++;


        loadBooks();


        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    }
);


/* =========================
   DELEGATION
   ========================= */

document.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                "[data-action]"
            );


        if (!button) {

            return;
        }


        const id =
            button.dataset.id;


        /* Добавить в список */

        if (
            button.dataset.action ===
            "wishlist"
        ) {

            const exists =
                state.wishlist.some(
                    (book) =>
                        book.id === id
                );


            if (exists) {

                state.wishlist =
                    state.wishlist.filter(
                        (book) =>
                            book.id !== id
                    );

            } else {

                const book =
                    state.books.find(
                        (item) =>
                            item.id === id
                    );


                if (book) {

                    state.wishlist = [
                        ...state.wishlist,
                        book
                    ];
                }
            }


            render();
        }


        /* Удалить */

        if (
            button.dataset.action ===
            "remove-wishlist"
        ) {

            state.wishlist =
                state.wishlist.filter(
                    (book) =>
                        book.id !== id
                );


            render();
        }
    }
);


/* =========================
   ПЕРВЫЙ ЗАПУСК
   ========================= */

render();

loadBooks();