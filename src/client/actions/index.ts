import * as booksActions from './books.actions'
import * as chaptersActions from './chapters.actions'
import * as versesActions from './verses.actions'
import * as authorsActions from './authors.actions'
import * as commentariesActions from './commentaries.actions'


const apiClientActions = {
    books: booksActions,
    chapters: chaptersActions,
    verses: versesActions,
    authors: authorsActions,
    commentaries: commentariesActions
}

export default apiClientActions;
