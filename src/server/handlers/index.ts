import * as booksApiHandlers from '@/server/handlers/books.api'
import * as chaptersApiHandlers from '@/server/handlers/chapters.api'
import * as versesApiHandlers from '@/server/handlers/verses.api'
import * as authorsApiHandlers from '@/server/handlers/authors.api'
import * as commentariesApiHandlers from '@/server/handlers/commentaries.api'
import * as usersApiHandlers from '@/server/handlers/users.api'
import * as notesApiHandlers from '@/server/handlers/notes.api'
import * as topicsApiHandlers from '@/server/handlers/topics.api'
import * as bookmarksApiHandlers from '@/server/handlers/bookmarks.api'
import * as highlightsApiHandlers from '@/server/handlers/highlights.api'
import * as activitiesApiHandlers from '@/server/handlers/activities.api'
import * as archivesApiHandlers from '@/server/handlers/archives.api'


const serverApiHandlers = {
    books: booksApiHandlers,
    chapters: chaptersApiHandlers,
    verses: versesApiHandlers,
    authors: authorsApiHandlers,
    commentaries: commentariesApiHandlers,
    users: usersApiHandlers,
    notes: notesApiHandlers,
    topics: topicsApiHandlers,
    bookmarks: bookmarksApiHandlers,
    activities: activitiesApiHandlers,
    highlights: highlightsApiHandlers,
    archives: archivesApiHandlers
}

export default serverApiHandlers;
