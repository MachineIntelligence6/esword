import * as booksApiHandlers from '@/server/handlers/books.api'
import * as chaptersApiHandlers from '@/server/handlers/chapters.api'
import * as versesApiHandlers from '@/server/handlers/verses.api'
import * as authorsApiHandlers from '@/server/handlers/authors.api'
import * as commentariesApiHandlers from '@/server/handlers/commentaries.api'



const apiHandlers = {
    books: booksApiHandlers,
    chapters: chaptersApiHandlers,
    verses: versesApiHandlers,
    authors: authorsApiHandlers,
    commentaries: commentariesApiHandlers
}

export default apiHandlers;
