import * as booksApiHandlers from '@/server/handlers/books.api'
import * as chaptersApiHandlers from '@/server/handlers/chapters.api'
import * as versesApiHandlers from '@/server/handlers/verses.api'
import * as authorsApiHandlers from '@/server/handlers/authors.api'
import * as commentariesApiHandlers from '@/server/handlers/commentaries.api'
import * as usersApiHandlers from '@/server/handlers/users.api'
import * as notesApiHandlers from '@/server/handlers/notes.api'
import * as topicsApiHandlers from '@/server/handlers/topics.api'
import * as bookmarksApiHandlers from '@/server/handlers/bookmarks.api'


const serverApiHandlers = {
    books: booksApiHandlers,
    chapters: chaptersApiHandlers,
    verses: versesApiHandlers,
    authors: authorsApiHandlers,
    commentaries: commentariesApiHandlers,
    users: usersApiHandlers,
    notes: notesApiHandlers,
    topics: topicsApiHandlers,
    bookmarks: bookmarksApiHandlers
}

export default serverApiHandlers;
