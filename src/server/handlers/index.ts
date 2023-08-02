import * as booksApiHandlers from '@/server/handlers/books.api'
import * as chaptersApiHandlers from '@/server/handlers/chapters.api'
import * as versesApiHandlers from '@/server/handlers/verses.api'



const apiHandlers = {
    books: booksApiHandlers,
    chapters: chaptersApiHandlers,
    verses: versesApiHandlers
}

export default apiHandlers;
