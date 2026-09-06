/**
 * Clears content tables and seeds ~100 books with demo nested data.
 * Keeps existing users (admin).
 *
 * Usage:
 *   node --env-file=.env prisma/seed-demo.mjs
 * Or:
 *   set -a && source .env && set +a && node prisma/seed-demo.mjs
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Canonical 66 + extras to reach ~100 demo library volumes */
const BIBLE_BOOKS = [
  ["Genesis", "Gen"],
  ["Exodus", "Exod"],
  ["Leviticus", "Lev"],
  ["Numbers", "Num"],
  ["Deuteronomy", "Deut"],
  ["Joshua", "Josh"],
  ["Judges", "Judg"],
  ["Ruth", "Ruth"],
  ["1 Samuel", "1Sam"],
  ["2 Samuel", "2Sam"],
  ["1 Kings", "1Kgs"],
  ["2 Kings", "2Kgs"],
  ["1 Chronicles", "1Chr"],
  ["2 Chronicles", "2Chr"],
  ["Ezra", "Ezra"],
  ["Nehemiah", "Neh"],
  ["Esther", "Esth"],
  ["Job", "Job"],
  ["Psalms", "Ps"],
  ["Proverbs", "Prov"],
  ["Ecclesiastes", "Eccl"],
  ["Song of Solomon", "Song"],
  ["Isaiah", "Isa"],
  ["Jeremiah", "Jer"],
  ["Lamentations", "Lam"],
  ["Ezekiel", "Ezek"],
  ["Daniel", "Dan"],
  ["Hosea", "Hos"],
  ["Joel", "Joel"],
  ["Amos", "Amos"],
  ["Obadiah", "Obad"],
  ["Jonah", "Jonah"],
  ["Micah", "Mic"],
  ["Nahum", "Nah"],
  ["Habakkuk", "Hab"],
  ["Zephaniah", "Zeph"],
  ["Haggai", "Hag"],
  ["Zechariah", "Zech"],
  ["Malachi", "Mal"],
  ["Matthew", "Matt"],
  ["Mark", "Mark"],
  ["Luke", "Luke"],
  ["John", "John"],
  ["Acts", "Acts"],
  ["Romans", "Rom"],
  ["1 Corinthians", "1Cor"],
  ["2 Corinthians", "2Cor"],
  ["Galatians", "Gal"],
  ["Ephesians", "Eph"],
  ["Philippians", "Phil"],
  ["Colossians", "Col"],
  ["1 Thessalonians", "1Thess"],
  ["2 Thessalonians", "2Thess"],
  ["1 Timothy", "1Tim"],
  ["2 Timothy", "2Tim"],
  ["Titus", "Titus"],
  ["Philemon", "Phlm"],
  ["Hebrews", "Heb"],
  ["James", "Jas"],
  ["1 Peter", "1Pet"],
  ["2 Peter", "2Pet"],
  ["1 John", "1John"],
  ["2 John", "2John"],
  ["3 John", "3John"],
  ["Jude", "Jude"],
  ["Revelation", "Rev"],
  // Deuterocanonical / study extras
  ["Tobit", "Tob"],
  ["Judith", "Jdt"],
  ["Wisdom", "Wis"],
  ["Sirach", "Sir"],
  ["Baruch", "Bar"],
  ["1 Maccabees", "1Macc"],
  ["2 Maccabees", "2Macc"],
  ["3 Maccabees", "3Macc"],
  ["4 Maccabees", "4Macc"],
  ["1 Esdras", "1Esd"],
  ["2 Esdras", "2Esd"],
  ["Prayer of Manasseh", "PrMan"],
  ["Psalm 151", "Ps151"],
  ["Bel and the Dragon", "Bel"],
  ["Susanna", "Sus"],
  ["Letter of Jeremiah", "EpJer"],
];

const AUTHORS = [
  {
    name: "Matthew Henry",
    description:
      "Classic commentator known for practical and pastoral insights on Scripture.",
  },
  {
    name: "John Gill",
    description: "Baptist theologian with extensive verse-by-verse exposition.",
  },
  {
    name: "Demo Scholar",
    description: "Modern study notes prepared for local eSword demo browsing.",
  },
  {
    name: "Adam Clarke",
    description: "Methodist commentator with linguistic and historical notes.",
  },
  {
    name: "Albert Barnes",
    description: "Concise verse notes useful for classroom and personal study.",
  },
];

const TOPIC_TITLES = [
  "Opening words",
  "Covenant themes",
  "People and places",
  "Law and instruction",
  "Worship and praise",
  "Promise and fulfillment",
  "Journey narrative",
  "Wisdom and warning",
  "Prophetic oracle",
  "Gospel witness",
];

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildBookCatalog(target = 100) {
  const books = [];
  for (let i = 0; i < BIBLE_BOOKS.length && books.length < target; i++) {
    const [name, abbreviation] = BIBLE_BOOKS[i];
    const rich = i < 5;
    books.push({
      name,
      slug: slugify(name),
      abbreviation,
      priority: target - i,
      chapters: rich ? 5 : 2,
      topicsPerChapter: rich ? 2 : 2,
      versesPerTopic: rich ? 3 : 2,
      commentariesPerVerse: rich ? 2 : 1,
    });
  }

  let n = 1;
  while (books.length < target) {
    const name = `Study Volume ${n}`;
    books.push({
      name,
      slug: `study-volume-${n}`,
      abbreviation: `SV${n}`,
      priority: target - books.length,
      chapters: 2,
      topicsPerChapter: 1,
      versesPerTopic: 2,
      commentariesPerVerse: 1,
    });
    n += 1;
  }
  return books;
}

function verseText(bookAbbr, chapter, verse) {
  return `${bookAbbr} ${chapter}:${verse} — Demo text for local testing. The word of the Lord endures forever, and this verse is seeded so lists, filters, and reader layouts can be evaluated with realistic volume.`;
}

function commentaryHtml(authorName, ref) {
  return `<p><strong>${authorName}</strong> on ${ref}: This demo commentary expands the meaning of the passage for study. It is intentionally longer so dashboard tables and the reader panel show wrapped content.</p><p>Key idea: read carefully, compare related passages, and apply with humility.</p>`;
}

const ABOUT_DEMO_HTML = `
<h2>Welcome to Apocryphal Writings</h2>
<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>
<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
<h3>Our Mission</h3>
<p>Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac turpis egestas. Vestibulum tortor quam, feugiat vitae, ultricies eget, tempor sit amet, ante. Donec eu libero sit amet quam egestas semper.</p>
<ul>
  <li>Curabitur ullamcorper ultricies nisi — nam eget dui.</li>
  <li>Etiam rhoncus — maecenas tempus, tellus eget.</li>
  <li>Aenean vulputate eleifend tellus — aenean leo ligula.</li>
</ul>
<h3>Study Resources</h3>
<p>Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim.</p>
<p><em>This is demo placeholder content for the About page. Replace it anytime from Dashboard → About Page.</em></p>
`.trim();

async function clearContent() {
  await prisma.highlight.deleteMany();
  await prisma.bookmark.deleteMany();
  await prisma.note.deleteMany();
  await prisma.commentary.deleteMany();
  await prisma.verse.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.book.deleteMany();
  await prisma.blog.deleteMany();
  await prisma.activity.deleteMany();
  await prisma.author.deleteMany();
  console.log(
    "Cleared books, chapters, topics, verses, commentaries, authors, blogs, notes, bookmarks, highlights, activities."
  );
}

async function seedDemo() {
  const admin =
    (await prisma.user.findFirst({
      where: { role: "ADMIN", archived: false },
    })) ??
    (await prisma.user.findFirst({ where: { archived: false } }));

  if (!admin) {
    throw new Error("No user found. Run npm run seed first to create an admin.");
  }

  const authors = [];
  for (const a of AUTHORS) {
    authors.push(
      await prisma.author.create({
        data: { name: a.name, description: a.description },
      })
    );
  }

  const catalog = buildBookCatalog(100);
  let totalChapters = 0;
  let totalTopics = 0;
  let totalVerses = 0;
  let totalCommentaries = 0;
  const firstVerses = [];
  const catalogBooks = [];

  console.log(`Seeding ${catalog.length} books…`);

  for (let bi = 0; bi < catalog.length; bi++) {
    const bookDef = catalog[bi];
    const chaptersCreate = [];

    for (let ch = 1; ch <= bookDef.chapters; ch++) {
      const topicsCreate = [];
      let verseNumber = 1;

      for (let t = 1; t <= bookDef.topicsPerChapter; t++) {
        const topicName =
          TOPIC_TITLES[(ch + t + bi) % TOPIC_TITLES.length] +
          ` (${bookDef.abbreviation} ${ch}.${t})`;
        const versesCreate = [];

        for (let v = 1; v <= bookDef.versesPerTopic; v++) {
          const ref = `${bookDef.abbreviation} ${ch}:${verseNumber}`;
          const authorSlice = authors.slice(
            0,
            Math.min(bookDef.commentariesPerVerse, authors.length)
          );
          const commentariesCreate = authorSlice.map((author) => ({
            name: `${author.name} — ${ref}`,
            text: commentaryHtml(author.name, ref),
            authorId: author.id,
          }));

          versesCreate.push({
            number: verseNumber,
            text: verseText(bookDef.abbreviation, ch, verseNumber),
            commentaries: { create: commentariesCreate },
          });

          totalVerses += 1;
          totalCommentaries += commentariesCreate.length;
          verseNumber += 1;
        }

        topicsCreate.push({
          name: topicName,
          number: t,
          verses: { create: versesCreate },
        });
        totalTopics += 1;
      }

      chaptersCreate.push({
        name: ch,
        slug: `${bookDef.slug}_${ch}`,
        commentaryName: `${bookDef.name} ${ch} overview`,
        commentaryText: `<p>Overview notes for <em>${bookDef.name} chapter ${ch}</em>. Seeded chapter commentary for UI density testing.</p>`,
        topics: { create: topicsCreate },
      });
      totalChapters += 1;
    }

    const book = await prisma.book.create({
      data: {
        name: bookDef.name,
        slug: bookDef.slug,
        abbreviation: bookDef.abbreviation,
        priority: bookDef.priority,
        chapters: { create: chaptersCreate },
      },
      include: {
        chapters: {
          include: {
            topics: {
              include: { verses: { take: 1, orderBy: { number: "asc" } } },
            },
          },
        },
      },
    });

    catalogBooks.push(book);

    if (firstVerses.length < 8) {
      for (const chapter of book.chapters) {
        for (const topic of chapter.topics) {
          for (const verse of topic.verses) {
            if (firstVerses.length < 8) firstVerses.push(verse);
          }
        }
      }
    }

    if ((bi + 1) % 10 === 0 || bi + 1 === catalog.length) {
      console.log(`  … ${bi + 1}/${catalog.length} books`);
    }
  }

  for (let i = 0; i < Math.min(5, firstVerses.length); i++) {
    const verse = firstVerses[i];
    await prisma.note.create({
      data: {
        text: `<p>Personal study note #${i + 1} on verse ${verse.number}. Demo HTML note for the dashboard Notes table.</p>`,
        verseId: verse.id,
        userId: admin.id,
      },
    });
    await prisma.bookmark.create({
      data: { verseId: verse.id, userId: admin.id },
    });
    if (i < 3) {
      await prisma.highlight.create({
        data: {
          text: "Demo text",
          index: 0,
          verseId: verse.id,
          userId: admin.id,
        },
      });
    }
  }

  const genesis = catalogBooks[0];
  const exodus = catalogBooks[1] ?? catalogBooks[0];
  const firstChapter = genesis?.chapters?.[0] ?? null;
  const firstVerse =
    firstChapter?.topics?.[0]?.verses?.[0] ?? firstVerses[0] ?? null;

  await prisma.blog.createMany({
    data: [
      {
        slug: "genesis-manuscript-overview",
        title: "Genesis Manuscript Overview",
        content:
          "<p>Scholarly overview of Genesis manuscript traditions for this demo library. This entry is <strong>book-level</strong> and appears whenever Genesis is selected.</p>",
        type: "MANUSCRIPT",
        status: "PUBLISHED",
        tags: "manuscript,genesis,overview",
        userId: admin.id,
        bookId: genesis.id,
        chapterId: null,
        verseId: null,
      },
      {
        slug: "genesis-ch1-manuscript-notes",
        title: "Genesis 1 — Opening Manuscript Notes",
        content:
          "<p>Chapter-level manuscript notes for Genesis chapter 1. Visible when Chapter 1 is selected, alongside book-level manuscripts.</p>",
        type: "MANUSCRIPT",
        status: "PUBLISHED",
        tags: "manuscript,genesis,chapter",
        userId: admin.id,
        bookId: genesis.id,
        chapterId: firstChapter?.id ?? null,
        verseId: null,
      },
      {
        slug: "genesis-textual-problem-book",
        title: "Genesis — Text Tradition Problem",
        content:
          "<p>Book-level problem entry describing a textual difficulty spanning Genesis. Appears for the whole book.</p>",
        type: "PROBLEM",
        status: "PUBLISHED",
        tags: "problem,genesis",
        userId: admin.id,
        bookId: genesis.id,
        chapterId: null,
        verseId: null,
      },
      {
        slug: "genesis-ch1-v1-problem",
        title: "Genesis 1:1 — Opening Phrase Variant",
        content:
          "<p>Verse-level problem for Genesis 1:1. Prioritized when that verse is active; otherwise chapter/book problems still appear.</p>",
        type: "PROBLEM",
        status: "PUBLISHED",
        tags: "problem,genesis,verse",
        userId: admin.id,
        bookId: genesis.id,
        chapterId: firstChapter?.id ?? null,
        verseId: firstVerse?.id ?? null,
      },
      {
        slug: "exodus-manuscript-overview",
        title: "Exodus Manuscript Overview",
        content:
          "<p>Book-level manuscript notes for Exodus so switching books replaces Genesis entries.</p>",
        type: "MANUSCRIPT",
        status: "PUBLISHED",
        tags: "manuscript,exodus",
        userId: admin.id,
        bookId: exodus.id,
        chapterId: null,
        verseId: null,
      },
      {
        slug: "exodus-problem-overview",
        title: "Exodus — Transmission Problem",
        content:
          "<p>Book-level problem for Exodus used to verify book filtering.</p>",
        type: "PROBLEM",
        status: "PUBLISHED",
        tags: "problem,exodus",
        userId: admin.id,
        bookId: exodus.id,
        chapterId: null,
        verseId: null,
      },
    ],
  });

  await prisma.activity.createMany({
    data: [
      {
        action: "CREATE",
        model: "BOOKS",
        description: `Seeded demo library: ${catalog.length} books`,
        userId: admin.id,
      },
      {
        action: "CREATE",
        model: "AUTHORS",
        description: "Seeded demo commentators",
        userId: admin.id,
      },
    ],
  });

  await prisma.aboutContent.upsert({
    where: { id: 1 },
    create: {
      id: 1,
      title: "About Us",
      content: ABOUT_DEMO_HTML,
    },
    update: {
      title: "About Us",
      content: ABOUT_DEMO_HTML,
    },
  });

  console.log("Demo seed complete:");
  console.log({
    books: catalog.length,
    chapters: totalChapters,
    topics: totalTopics,
    verses: totalVerses,
    commentaries: totalCommentaries,
    authors: authors.length,
    notes: Math.min(5, firstVerses.length),
    blogs: 6,
    aboutContent: true,
  });
}

async function main() {
  await clearContent();
  await seedDemo();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
