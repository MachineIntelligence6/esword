import AuthorsTable from "@/components/dashboard/tables/authors.table"
import BlogsTable from "@/components/dashboard/tables/blogs.table"
import BooksTable from "@/components/dashboard/tables/books.table"
import ChaptersTable from "@/components/dashboard/tables/chapters.table"
import CommentariesTable from "@/components/dashboard/tables/commentaries.table"
import TopicsTable from "@/components/dashboard/tables/topics.table"
import UsersTable from "@/components/dashboard/tables/users.table"
import VersesTable from "@/components/dashboard/tables/verses.table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"



export default function Page() {

  return (
    <div>
      <Card className="min-h-[600px]">
        <CardHeader className="border-b-8 border-silver-light py-4">
          <CardTitle className="font-bold text-2xl">
            Archives
          </CardTitle>
        </CardHeader>
        <CardContent className="p-5 space-y-5">
          {/* Books Archived Table Start  */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="font-semibold text-xl">
                Books
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <BooksTable archivedOnly />
            </CardContent>
          </Card>
          {/* Books Archived Table End  */}
          {/* Chapters Archived Table Start  */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="font-semibold text-xl">
                Chapters
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <ChaptersTable archivedOnly />
            </CardContent>
          </Card>
          {/* Chapters Archived Table End  */}
          {/* Topics Archived Table Start  */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="font-semibold text-xl">
                Topics
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <TopicsTable archivedOnly />
            </CardContent>
          </Card>
          {/* Topics Archived Table End  */}
          {/* Verses Archived Table Start  */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="font-semibold text-xl">
                Verses
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <VersesTable archivedOnly />
            </CardContent>
          </Card>
          {/* Verses Archived Table End  */}
          {/* Commentaries Archived Table Start  */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="font-semibold text-xl">
                Commentaries
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <CommentariesTable archivedOnly />
            </CardContent>
          </Card>
          {/* Commentaries Archived Table End  */}
          {/* Authors Archived Table Start  */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="font-semibold text-xl">
                Authors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <AuthorsTable archivedOnly />
            </CardContent>
          </Card>
          {/* Authors Archived Table End  */}
          {/* Users Archived Table Start  */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="font-semibold text-xl">
                Users
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <UsersTable archivedOnly />
            </CardContent>
          </Card>
          {/* Users Archived Table End  */}
          {/* Blogs Archived Table Start  */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="font-semibold text-xl">
                Blogs
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5">
              <BlogsTable archivedOnly />
            </CardContent>
          </Card>
          {/* Blogs Archived Table End  */}

        </CardContent>
      </Card>
    </div>
  )
}