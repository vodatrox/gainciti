# GainCiti Blog Platform -- Comprehensive Phased Development Plan

## 1. Technology Stack with Justification

| Layer | Technology | Why |
|---|---|---|
| Public Blog | Next.js 15 (App Router) | Server Components for SEO, streaming, ISR for cache invalidation |
| Admin Backoffice | Next.js 15 (App Router) | Shared tooling with blog, rich client-side interactivity |
| Styling | Tailwind CSS 4 | Utility-first, dark mode via `dark:` variant, design token system via `@theme` |
| Backend API | Django 5.1 + DRF 3.15 | Mature ORM, built-in admin as escape hatch, excellent PostgreSQL integration |
| Database | PostgreSQL 16 | Full-text search built in, JSONB for flexible content, `pg_trgm` for autocomplete |
| Cache / Broker | Redis 7 | Session cache, rate limiting, Celery broker if needed alongside Temporal |
| Async Orchestration | Temporal (self-hosted) | Durable workflows for scheduling, newsletter fan-out, analytics aggregation |
| Static Files | WhiteNoise 6 | Serves Django static files without nginx in development; CDN in production |
| Media Storage | Local (dev) / S3 (prod) | `django-storages` with S3 backend, WhiteNoise for static only |
| Auth | `djangorestframework-simplejwt` | Access + refresh token pair, rotation, blacklisting |
| Rich Text | TipTap (blog + admin) | Block-based editor, outputs JSON (portable), renders to HTML |
| Charts | Recharts | Lightweight, composable, React-native |
| Container | Docker + docker-compose | Reproducible dev environment, matches production topology |

---

## 2. Project Directory Structure

### 2.1 Root

```
/Users/kennedy/development/gainciti/
  docker-compose.yml
  docker-compose.prod.yml
  .env.example
  .gitignore
  README.md
  Makefile                       # convenience targets: make up, make migrate, make seed
  blog/                          # Next.js 15 public blog
  admin-backoffice/              # Next.js 15 admin app
  backend/                       # Django 5 API
  temporal/                      # Temporal workflow definitions + worker
  docker/                        # Dockerfiles and config
    blog.Dockerfile
    admin.Dockerfile
    backend.Dockerfile
    temporal-worker.Dockerfile
    nginx/
      nginx.conf                 # reverse proxy (production)
    postgres/
      init.sql                   # extensions: pg_trgm, unaccent
```

### 2.2 Backend (`/Users/kennedy/development/gainciti/backend/`)

```
backend/
  manage.py
  requirements/
    base.txt
    dev.txt
    prod.txt
  config/
    __init__.py
    settings/
      __init__.py
      base.py
      dev.py
      prod.py
      test.py
    urls.py
    wsgi.py
    asgi.py
  apps/
    accounts/
      __init__.py
      models.py                  # User, AuthorProfile
      serializers.py
      views.py
      urls.py
      services.py                # business logic
      repositories.py            # data access
      admin.py
      tests/
        __init__.py
        test_models.py
        test_views.py
    posts/
      __init__.py
      models.py                  # Post, Category, Tag, PostTag
      serializers.py
      views.py
      urls.py
      services.py
      repositories.py
      filters.py
      admin.py
      tests/
    media_library/
      __init__.py
      models.py                  # MediaAsset
      serializers.py
      views.py
      urls.py
      services.py                # image processing (resize, optimize)
      repositories.py
      tests/
    analytics/
      __init__.py
      models.py                  # PageView, AnalyticsSnapshot
      serializers.py
      views.py
      urls.py
      services.py
      repositories.py
      tests/
    comments/
      __init__.py
      models.py                  # Comment
      serializers.py
      views.py
      urls.py
      services.py
      repositories.py
      tests/
    newsletters/
      __init__.py
      models.py                  # Subscriber, Campaign, SendLog
      serializers.py
      views.py
      urls.py
      services.py
      repositories.py
      tests/
    seo/
      __init__.py
      models.py                  # SEOMetadata (OneToOne with Post)
      serializers.py
      views.py
      urls.py
      sitemaps.py
      tests/
  common/
    __init__.py
    pagination.py                # CursorPagination, PageNumberPagination
    permissions.py               # IsAdmin, IsAuthor, ReadOnly
    throttling.py                # custom rate limit classes
    middleware.py                # CORS, analytics ingestion
    exceptions.py                # unified error format
    utils.py                     # slug generation, reading time calc
```

### 2.3 Public Blog (`/Users/kennedy/development/gainciti/blog/`)

```
blog/
  package.json
  next.config.ts
  tailwind.config.ts
  tsconfig.json
  postcss.config.mjs
  .env.local.example
  public/
    fonts/
    images/
    favicon.ico
    robots.txt
  src/
    app/
      layout.tsx                 # root layout: theme provider, fonts, analytics script
      page.tsx                   # homepage
      loading.tsx
      error.tsx
      not-found.tsx
      (home)/
        page.tsx                 # hero + featured + recent + trending
      posts/
        [slug]/
          page.tsx               # article detail
          loading.tsx
        page.tsx                 # all posts listing
      categories/
        [slug]/
          page.tsx               # posts filtered by category
        page.tsx                 # category index
      search/
        page.tsx                 # search results
      tags/
        [slug]/
          page.tsx
      about/
        page.tsx
      sitemap.ts                 # dynamic sitemap generation
      robots.ts
    components/
      layout/
        Header.tsx
        Footer.tsx
        Sidebar.tsx
        MobileMenu.tsx
        ThemeToggle.tsx
        Breadcrumbs.tsx
      home/
        HeroSection.tsx          # large featured post + 2 secondary
        TrendingPosts.tsx        # horizontal scroll or numbered list
        RecentPosts.tsx          # vertical card list
        CategoryBar.tsx          # horizontal filter chips
        NewsletterCTA.tsx        # inline subscription form
      posts/
        PostCard.tsx             # reusable card (thumbnail, title, excerpt, meta)
        PostCardLarge.tsx        # hero variant
        PostCardCompact.tsx      # sidebar/trending variant
        PostGrid.tsx             # responsive grid wrapper
        PostList.tsx             # list layout wrapper
        LoadMoreButton.tsx       # "load more" with loading state
        InfiniteScrollTrigger.tsx
      article/
        ArticleHeader.tsx        # title, author, date, reading time, category badge
        ArticleBody.tsx          # renders TipTap JSON to HTML
        ArticleTOC.tsx           # table of contents (sticky sidebar)
        CodeBlock.tsx            # syntax-highlighted code
        ImageBlock.tsx           # optimized image with caption
        QuoteBlock.tsx
        EmbedBlock.tsx           # YouTube, Twitter embeds
        RelatedArticles.tsx
        SocialShareBar.tsx       # Twitter, LinkedIn, copy link
        AuthorCard.tsx
      comments/
        CommentSection.tsx
        CommentForm.tsx
        CommentThread.tsx
      search/
        SearchInput.tsx          # with autocomplete dropdown
        SearchResults.tsx
        SearchFilters.tsx
      common/
        Badge.tsx                # category/tag badge
        Avatar.tsx
        ReadingTime.tsx
        DateDisplay.tsx
        Skeleton.tsx             # loading skeletons
        SEOHead.tsx
        Pagination.tsx
    lib/
      api/
        client.ts               # fetch wrapper with base URL, error handling
        posts.ts                 # getPost, getPosts, getFeaturedPosts, searchPosts
        categories.ts
        comments.ts
        newsletter.ts
        analytics.ts             # sendPageView, sendEvent
      hooks/
        useInfiniteScroll.ts
        useSearch.ts
        useDarkMode.ts
        useReadingProgress.ts
      utils/
        formatDate.ts
        readingTime.ts
        slugify.ts
        cn.ts                    # clsx + tailwind-merge
      types/
        post.ts
        category.ts
        comment.ts
        api.ts                   # ApiResponse<T>, PaginatedResponse<T>
      constants.ts
    styles/
      globals.css                # @import "tailwindcss", @theme block, custom utilities
```

### 2.4 Admin Backoffice (`/Users/kennedy/development/gainciti/admin-backoffice/`)

```
admin-backoffice/
  package.json
  next.config.ts
  tailwind.config.ts
  tsconfig.json
  postcss.config.mjs
  .env.local.example
  public/
  src/
    app/
      layout.tsx
      (auth)/
        login/
          page.tsx
        forgot-password/
          page.tsx
      (dashboard)/
        layout.tsx               # sidebar + topbar shell
        page.tsx                 # dashboard overview
        posts/
          page.tsx               # post list with filters, bulk actions
          new/
            page.tsx             # editor
          [id]/
            edit/
              page.tsx           # editor with pre-filled data
        categories/
          page.tsx               # CRUD table
        tags/
          page.tsx
        media/
          page.tsx               # media library grid
        comments/
          page.tsx               # moderation queue
        analytics/
          page.tsx               # charts, date range, export
          posts/
            [id]/
              page.tsx           # per-post analytics
        newsletters/
          page.tsx               # subscriber list, campaigns
          campaigns/
            new/
              page.tsx
        users/
          page.tsx               # author management
          [id]/
            page.tsx
        settings/
          page.tsx               # site settings, SEO defaults
    components/
      layout/
        Sidebar.tsx              # collapsible, icon + label nav
        Topbar.tsx               # user menu, notifications, search
        DashboardShell.tsx
      auth/
        LoginForm.tsx
        ProtectedRoute.tsx
      editor/
        PostEditor.tsx           # TipTap block editor wrapper
        EditorToolbar.tsx
        blocks/
          ParagraphBlock.tsx
          HeadingBlock.tsx
          ImageBlock.tsx
          CodeBlock.tsx
          QuoteBlock.tsx
          EmbedBlock.tsx
          DividerBlock.tsx
          ListBlock.tsx
        EditorSidebar.tsx        # metadata: category, tags, SEO, scheduling
        SEOMetadataForm.tsx
        SlugEditor.tsx
        FeaturedImagePicker.tsx
        PublishControls.tsx       # draft / publish / schedule
      posts/
        PostsTable.tsx           # sortable, filterable data table
        PostStatusBadge.tsx
        PostFilters.tsx
        BulkActions.tsx
      media/
        MediaGrid.tsx
        MediaUploader.tsx        # drag-and-drop
        MediaDetail.tsx
        ImageCropper.tsx
      analytics/
        OverviewCards.tsx         # visitors, views, bounce rate, top post
        ViewsChart.tsx           # line chart, date range picker
        TopPostsTable.tsx
        TrafficSourcesChart.tsx
        DateRangePicker.tsx
        ExportButton.tsx
      comments/
        ModerationQueue.tsx
        CommentRow.tsx
      newsletters/
        SubscriberTable.tsx
        CampaignEditor.tsx
      common/
        DataTable.tsx            # generic sortable/paginated table
        Modal.tsx
        ConfirmDialog.tsx
        Toast.tsx
        FileUpload.tsx
        RichSelect.tsx           # category/tag multi-select with create
        StatusBadge.tsx
        EmptyState.tsx
        LoadingSpinner.tsx
    lib/
      api/
        client.ts               # fetch wrapper with JWT refresh logic
        auth.ts
        posts.ts
        categories.ts
        tags.ts
        media.ts
        analytics.ts
        comments.ts
        newsletters.ts
        users.ts
      hooks/
        useAuth.ts
        usePosts.ts
        useDebounce.ts
        useMediaLibrary.ts
      utils/
        formatDate.ts
        cn.ts
      types/
        post.ts
        user.ts
        analytics.ts
        api.ts
      constants.ts
      auth/
        context.tsx              # AuthContext provider
        tokens.ts                # store/refresh/clear JWT
    styles/
      globals.css
```

### 2.5 Temporal (`/Users/kennedy/development/gainciti/temporal/`)

```
temporal/
  __init__.py
  worker.py                      # runs the Temporal worker
  workflows/
    __init__.py
    publish_scheduled.py         # checks for posts due, publishes them
    send_newsletter.py           # fan-out email sending
    aggregate_analytics.py       # daily/hourly rollup
    process_image.py             # resize, generate thumbnails, WebP
  activities/
    __init__.py
    post_activities.py
    email_activities.py
    analytics_activities.py
    image_activities.py
  config.py
```

---

## 3. Database Schema

### 3.1 `accounts.User`

| Field | Type | Notes |
|---|---|---|
| id | UUIDField (pk) | `default=uuid4` |
| email | EmailField (unique) | login identifier |
| password | CharField | via AbstractBaseUser |
| first_name | CharField(100) | |
| last_name | CharField(100) | |
| role | CharField(20) | choices: `admin`, `editor`, `author` |
| avatar | ImageField (nullable) | |
| bio | TextField (blank) | |
| social_twitter | URLField (blank) | |
| social_linkedin | URLField (blank) | |
| is_active | BooleanField | default True |
| is_staff | BooleanField | default False |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |

Custom user model extending `AbstractBaseUser` + `PermissionsMixin`. Uses email as `USERNAME_FIELD`.

### 3.2 `posts.Category`

| Field | Type | Notes |
|---|---|---|
| id | AutoField (pk) | |
| name | CharField(100, unique) | |
| slug | SlugField(120, unique) | auto-generated |
| description | TextField (blank) | |
| color | CharField(7) | hex color for badge, e.g. `#FF5733` |
| icon | CharField(50, blank) | icon class or SVG name |
| sort_order | IntegerField | default 0 |
| is_active | BooleanField | default True |
| created_at | DateTimeField | auto_now_add |

### 3.3 `posts.Tag`

| Field | Type | Notes |
|---|---|---|
| id | AutoField (pk) | |
| name | CharField(60, unique) | |
| slug | SlugField(80, unique) | |
| created_at | DateTimeField | auto_now_add |

### 3.4 `posts.Post`

| Field | Type | Notes |
|---|---|---|
| id | UUIDField (pk) | |
| title | CharField(255) | |
| slug | SlugField(280, unique) | |
| excerpt | TextField(500) | manual or auto-generated from body |
| body | JSONField | TipTap JSON document |
| body_html | TextField | pre-rendered HTML for public consumption |
| body_text | TextField | plain text for FTS indexing |
| featured_image | ForeignKey(MediaAsset, null) | |
| author | ForeignKey(User) | |
| category | ForeignKey(Category) | |
| status | CharField(20) | choices: `draft`, `published`, `scheduled`, `archived` |
| is_featured | BooleanField | default False; shown in hero |
| is_pinned | BooleanField | default False; sticky at top |
| position | CharField(20, blank) | `hero`, `sidebar`, `trending`, or blank |
| reading_time_minutes | PositiveIntegerField | computed on save |
| published_at | DateTimeField (nullable) | set when published or scheduled |
| scheduled_for | DateTimeField (nullable) | Temporal checks this |
| view_count | PositiveIntegerField | denormalized, updated by analytics aggregation |
| created_at | DateTimeField | auto_now_add |
| updated_at | DateTimeField | auto_now |
| search_vector | SearchVectorField | PostgreSQL tsvector, GIN-indexed |

**Indexes:**
- `GinIndex` on `search_vector`
- `Index` on `(status, published_at)` -- the hot query path
- `Index` on `(category_id, status, published_at)`
- `Index` on `(is_featured, status)`

**M2M:** `tags = ManyToManyField(Tag, through='PostTag')`

### 3.5 `posts.PostTag`

| Field | Type |
|---|---|
| id | AutoField (pk) |
| post | ForeignKey(Post) |
| tag | ForeignKey(Tag) |

`unique_together = ('post', 'tag')`

### 3.6 `seo.SEOMetadata`

| Field | Type | Notes |
|---|---|---|
| id | AutoField (pk) | |
| post | OneToOneField(Post) | |
| meta_title | CharField(70, blank) | falls back to post.title |
| meta_description | CharField(160, blank) | falls back to post.excerpt |
| og_title | CharField(70, blank) | |
| og_description | CharField(200, blank) | |
| og_image | ForeignKey(MediaAsset, null) | |
| canonical_url | URLField (blank) | |
| no_index | BooleanField | default False |
| structured_data | JSONField (blank) | JSON-LD override |

### 3.7 `media_library.MediaAsset`

| Field | Type | Notes |
|---|---|---|
| id | UUIDField (pk) | |
| file | FileField | upload_to `media/%Y/%m/` |
| filename | CharField(255) | original filename |
| alt_text | CharField(255, blank) | |
| caption | TextField (blank) | |
| mime_type | CharField(100) | |
| file_size | PositiveIntegerField | bytes |
| width | PositiveIntegerField (nullable) | for images |
| height | PositiveIntegerField (nullable) | |
| thumbnail | FileField (nullable) | auto-generated 300px wide |
| uploaded_by | ForeignKey(User) | |
| created_at | DateTimeField | auto_now_add |

### 3.8 `analytics.PageView`

| Field | Type | Notes |
|---|---|---|
| id | BigAutoField (pk) | high-write table |
| post | ForeignKey(Post, nullable) | null for non-post pages |
| path | CharField(500) | URL path |
| session_id | CharField(64) | hashed client fingerprint |
| referrer | URLField (blank) | |
| user_agent | TextField (blank) | |
| ip_hash | CharField(64) | hashed, not raw IP |
| country | CharField(2, blank) | ISO code from IP |
| created_at | DateTimeField | auto_now_add |

Partitioned by month using `django-postgres-extra` or raw SQL partitioning.

### 3.9 `analytics.AnalyticsSnapshot`

| Field | Type | Notes |
|---|---|---|
| id | AutoField (pk) | |
| post | ForeignKey(Post, nullable) | null = site-wide |
| date | DateField | |
| views | PositiveIntegerField | |
| unique_visitors | PositiveIntegerField | |
| avg_time_on_page | FloatField (nullable) | seconds |
| bounce_rate | FloatField (nullable) | 0-1 |

`unique_together = ('post', 'date')`

### 3.10 `comments.Comment`

| Field | Type | Notes |
|---|---|---|
| id | UUIDField (pk) | |
| post | ForeignKey(Post) | |
| parent | ForeignKey('self', nullable) | threaded replies |
| author_name | CharField(100) | guest name |
| author_email | EmailField | for gravatar, not displayed |
| body | TextField | |
| is_approved | BooleanField | default False; moderation |
| ip_hash | CharField(64) | spam detection |
| created_at | DateTimeField | auto_now_add |

### 3.11 `newsletters.Subscriber`

| Field | Type | Notes |
|---|---|---|
| id | UUIDField (pk) | |
| email | EmailField (unique) | |
| is_confirmed | BooleanField | double opt-in |
| confirmation_token | CharField(64, blank) | |
| subscribed_at | DateTimeField | auto_now_add |
| unsubscribed_at | DateTimeField (nullable) | soft unsubscribe |

### 3.12 `newsletters.Campaign`

| Field | Type | Notes |
|---|---|---|
| id | UUIDField (pk) | |
| subject | CharField(200) | |
| body_html | TextField | |
| status | CharField(20) | `draft`, `sending`, `sent` |
| sent_at | DateTimeField (nullable) | |
| created_by | ForeignKey(User) | |
| created_at | DateTimeField | auto_now_add |

### 3.13 `newsletters.SendLog`

| Field | Type |
|---|---|
| id | BigAutoField (pk) |
| campaign | ForeignKey(Campaign) |
| subscriber | ForeignKey(Subscriber) |
| status | CharField(20) | `sent`, `failed`, `bounced` |
| sent_at | DateTimeField |

---

## 4. API Endpoint Design

Base URL: `/api/v1/`

### 4.1 Public Endpoints (no auth required)

```
GET  /api/v1/posts/                          # paginated, filterable by category, tag, status=published
GET  /api/v1/posts/{slug}/                   # single post detail (increments view via analytics)
GET  /api/v1/posts/featured/                 # posts where is_featured=True
GET  /api/v1/posts/trending/                 # top by view_count, last 7 days
GET  /api/v1/posts/search/?q=term            # full-text search with ranking
GET  /api/v1/posts/search/autocomplete/?q=t  # prefix search, returns titles only

GET  /api/v1/categories/                     # all active categories
GET  /api/v1/categories/{slug}/              # category detail
GET  /api/v1/categories/{slug}/posts/        # posts in category

GET  /api/v1/tags/                           # all tags
GET  /api/v1/tags/{slug}/posts/              # posts with tag

GET  /api/v1/posts/{slug}/comments/          # approved comments, threaded
POST /api/v1/posts/{slug}/comments/          # submit comment (rate-limited)

POST /api/v1/newsletter/subscribe/           # email subscription
GET  /api/v1/newsletter/confirm/{token}/     # double opt-in confirmation
POST /api/v1/newsletter/unsubscribe/         # unsubscribe

POST /api/v1/analytics/event/               # page view / event ingestion (fire-and-forget)

GET  /api/v1/sitemap/posts/                  # returns post URLs + lastmod for sitemap generation
```

**Query parameters for `GET /api/v1/posts/`:**
- `category` (slug)
- `tag` (slug)
- `search` (full-text query)
- `ordering` (`-published_at`, `-view_count`, `title`)
- `cursor` (for cursor pagination)
- `page_size` (default 12, max 50)

### 4.2 Admin Endpoints (JWT required)

```
# Auth
POST /api/v1/auth/login/                     # returns access + refresh tokens
POST /api/v1/auth/refresh/                   # refresh access token
POST /api/v1/auth/logout/                    # blacklist refresh token

# Posts (CRUD)
GET    /api/v1/admin/posts/                  # all posts (any status), filterable
POST   /api/v1/admin/posts/                  # create post
GET    /api/v1/admin/posts/{id}/             # single post (by UUID)
PUT    /api/v1/admin/posts/{id}/             # full update
PATCH  /api/v1/admin/posts/{id}/             # partial update (e.g., status change)
DELETE /api/v1/admin/posts/{id}/             # soft delete / archive

POST   /api/v1/admin/posts/{id}/publish/     # publish now
POST   /api/v1/admin/posts/{id}/schedule/    # schedule for future datetime
POST   /api/v1/admin/posts/{id}/unpublish/   # revert to draft

# Categories
GET    /api/v1/admin/categories/
POST   /api/v1/admin/categories/
PUT    /api/v1/admin/categories/{id}/
DELETE /api/v1/admin/categories/{id}/

# Tags
GET    /api/v1/admin/tags/
POST   /api/v1/admin/tags/
PUT    /api/v1/admin/tags/{id}/
DELETE /api/v1/admin/tags/{id}/

# Media
GET    /api/v1/admin/media/                  # paginated media grid
POST   /api/v1/admin/media/                  # upload (multipart/form-data)
GET    /api/v1/admin/media/{id}/
PUT    /api/v1/admin/media/{id}/             # update alt_text, caption
DELETE /api/v1/admin/media/{id}/

# Comments moderation
GET    /api/v1/admin/comments/               # all, filterable by is_approved
PATCH  /api/v1/admin/comments/{id}/          # approve/reject
DELETE /api/v1/admin/comments/{id}/

# Analytics
GET    /api/v1/admin/analytics/overview/     # site-wide: views, visitors, bounce, top posts
GET    /api/v1/admin/analytics/posts/{id}/   # per-post time series
GET    /api/v1/admin/analytics/export/       # CSV export
  Query params: date_from, date_to, granularity (day/week/month)

# Newsletter
GET    /api/v1/admin/newsletter/subscribers/
DELETE /api/v1/admin/newsletter/subscribers/{id}/
GET    /api/v1/admin/newsletter/campaigns/
POST   /api/v1/admin/newsletter/campaigns/
POST   /api/v1/admin/newsletter/campaigns/{id}/send/

# Users
GET    /api/v1/admin/users/
POST   /api/v1/admin/users/
GET    /api/v1/admin/users/{id}/
PUT    /api/v1/admin/users/{id}/
DELETE /api/v1/admin/users/{id}/
```

---

## 5. Docker Architecture

### 5.1 Services in `docker-compose.yml`

| Service | Image / Build | Ports | Depends On |
|---|---|---|---|
| `postgres` | `postgres:16-alpine` | 5432 | - |
| `redis` | `redis:7-alpine` | 6379 | - |
| `temporal` | `temporalio/auto-setup:latest` | 7233 | postgres |
| `temporal-ui` | `temporalio/ui:latest` | 8080 | temporal |
| `backend` | build `docker/backend.Dockerfile` | 8000 | postgres, redis |
| `temporal-worker` | build `docker/temporal-worker.Dockerfile` | - | temporal, postgres, redis |
| `blog` | build `docker/blog.Dockerfile` | 3000 | backend |
| `admin` | build `docker/admin.Dockerfile` | 3001 | backend |

### 5.2 Volumes

- `postgres_data` -- persistent DB
- `redis_data` -- persistent cache
- `media_uploads` -- mounted into backend at `/app/media/`

### 5.3 Networks

Single bridge network `gainciti_net`. All services communicate via service names as hostnames.

### 5.4 Environment Variables (`.env`)

```
# Database
POSTGRES_DB=gainciti
POSTGRES_USER=gainciti
POSTGRES_PASSWORD=<secret>
DATABASE_URL=postgres://gainciti:<secret>@postgres:5432/gainciti

# Redis
REDIS_URL=redis://redis:6379/0

# Django
DJANGO_SECRET_KEY=<secret>
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,backend
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# JWT
JWT_ACCESS_TOKEN_LIFETIME=15         # minutes
JWT_REFRESH_TOKEN_LIFETIME=7         # days

# Temporal
TEMPORAL_HOST=temporal:7233
TEMPORAL_NAMESPACE=gainciti
TEMPORAL_TASK_QUEUE=gainciti-tasks

# Next.js (blog)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Next.js (admin)
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

---

## 6. Phased Development Plan

### PHASE 1: Foundation (Week 1-2)

**Goal:** Scaffolding, Docker orchestration, database, and basic Django project.

**Tasks:**

1.1. **Initialize Git repository**
- `git init` in `/Users/kennedy/development/gainciti/`
- Create `.gitignore` (Python, Node, .env, __pycache__, .next, node_modules, media/)

1.2. **Scaffold Django project**
- `django-admin startproject config /Users/kennedy/development/gainciti/backend/`
- Restructure settings into `config/settings/{base,dev,prod,test}.py`
- Split requirements: `requirements/base.txt` (Django 5.1, djangorestframework, djangorestframework-simplejwt, django-cors-headers, django-filter, whitenoise, psycopg[binary], Pillow, django-storages, boto3)
- Create all Django apps: `accounts`, `posts`, `media_library`, `analytics`, `comments`, `newsletters`, `seo`
- Configure `base.py`: installed apps, middleware (WhiteNoise, CORS), REST_FRAMEWORK defaults (pagination, authentication, throttling), DATABASES (PostgreSQL), AUTH_USER_MODEL

1.3. **Scaffold Next.js projects**
- `npx create-next-app@latest blog` with App Router, TypeScript, Tailwind CSS 4, ESLint, src/ directory
- `npx create-next-app@latest admin-backoffice` with same options
- Configure `next.config.ts` in both: `images.remotePatterns` for API domain, rewrites if needed

1.4. **Docker setup**
- Write `docker/backend.Dockerfile` (python:3.12-slim, install requirements, gunicorn CMD)
- Write `docker/blog.Dockerfile` (node:20-alpine, multi-stage: deps, build, run)
- Write `docker/admin.Dockerfile` (same pattern)
- Write `docker/temporal-worker.Dockerfile` (python:3.12-slim, temporalio SDK)
- Write `docker-compose.yml` with all services
- Write `docker/postgres/init.sql`: `CREATE EXTENSION IF NOT EXISTS pg_trgm; CREATE EXTENSION IF NOT EXISTS unaccent;`
- Write `Makefile` with targets: `up`, `down`, `migrate`, `createsuperuser`, `seed`, `logs`, `shell`

1.5. **Database models -- first migration**
- Implement all models listed in Section 3
- Create and run migrations
- Verify with `python manage.py dbshell`

1.6. **Common utilities**
- `common/pagination.py`: `CursorPagination` (default, for infinite scroll) and `PageNumberPagination` (for admin tables)
- `common/permissions.py`: `IsAdminUser`, `IsEditorOrAdmin`, `ReadOnly`
- `common/throttling.py`: `PublicBurstRate` (60/min), `PublicSustainedRate` (1000/day), `AdminRate` (300/min)
- `common/exceptions.py`: custom exception handler returning `{ "error": { "code": "...", "message": "...", "details": {} } }`

**Deliverable:** `docker-compose up` boots all services. Django responds at `:8000/api/v1/`. Both Next.js apps respond at `:3000` and `:3001` with default pages.

---

### PHASE 2: Backend Core (Week 2-4)

**Goal:** Full API implementation with repository + service pattern.

**Tasks:**

2.1. **Authentication system**
- `accounts/models.py`: Custom User with `AbstractBaseUser` + `PermissionsMixin`, custom `UserManager`
- `accounts/serializers.py`: `UserSerializer`, `UserCreateSerializer`, `LoginSerializer`, `TokenRefreshSerializer`
- `accounts/views.py`: `LoginView`, `LogoutView`, `TokenRefreshView`, `UserViewSet`
- `accounts/urls.py`: wire up auth + user endpoints
- Configure `SIMPLE_JWT` in settings: access=15min, refresh=7d, rotate=True, blacklist=True

2.2. **Posts CRUD**
- `posts/repositories.py`:
  - `PostRepository`: `get_published(filters)`, `get_by_slug(slug)`, `get_featured()`, `get_trending(days=7)`, `search(query)`, `create(data)`, `update(id, data)`, `delete(id)`
  - `CategoryRepository`: standard CRUD
  - `TagRepository`: standard CRUD
- `posts/services.py`:
  - `PostService`: `create_post(data, author)` (generates slug, computes reading time, renders body_html, builds search_vector), `update_post(id, data)`, `publish(id)`, `schedule(id, datetime)`, `unpublish(id)`, `get_public_feed(filters)`, `full_text_search(query)`
- `posts/serializers.py`:
  - `PostListSerializer` (lightweight: id, title, slug, excerpt, featured_image_url, category, author_name, reading_time, published_at, view_count)
  - `PostDetailSerializer` (full: includes body, body_html, tags, seo_metadata)
  - `PostCreateUpdateSerializer` (write: title, body (JSON), category_id, tag_ids, status, is_featured, position, seo fields)
  - `CategorySerializer`, `TagSerializer`
- `posts/views.py`:
  - `PublicPostViewSet`: list (published only, cursor pagination), retrieve (by slug), featured, trending, search
  - `AdminPostViewSet`: full CRUD, publish/schedule/unpublish actions
  - `PublicCategoryViewSet`: list, retrieve, posts
  - `AdminCategoryViewSet`: full CRUD
  - `AdminTagViewSet`: full CRUD
- `posts/filters.py`: `PostFilter` using django-filter (category__slug, tag__slug, status, search)
- Full-text search: use `SearchVector('title', weight='A') + SearchVector('body_text', weight='B')` with `SearchQuery` and `SearchRank`. Update `search_vector` on post save via `post_save` signal or in the service.
- Autocomplete: use `pg_trgm` similarity on title, returning top 5 matches.

2.3. **Media library**
- `media_library/services.py`: `upload(file, user)` validates file type/size, stores file, extracts dimensions for images, triggers thumbnail generation
- `media_library/views.py`: `AdminMediaViewSet` with `create` handling multipart upload
- File storage: `DEFAULT_FILE_STORAGE = 'django.core.files.storage.FileSystemStorage'` in dev, S3 in prod

2.4. **Comments**
- `comments/services.py`: `submit_comment(post_slug, data)` with rate limiting (max 5 per IP per hour), `approve(id)`, `reject(id)`, `get_threaded(post_id)`
- `comments/views.py`: `PublicCommentViewSet` (list approved, create), `AdminCommentViewSet` (list all, approve/reject/delete)

2.5. **Newsletter**
- `newsletters/services.py`: `subscribe(email)` generates confirmation token, `confirm(token)`, `unsubscribe(email)`
- `newsletters/views.py`: public subscribe/confirm/unsubscribe endpoints, admin subscriber list + campaign CRUD

2.6. **SEO**
- `seo/sitemaps.py`: custom endpoint returning post URLs with `lastmod`
- `seo/serializers.py`: `SEOMetadataSerializer` nested within `PostDetailSerializer`

2.7. **Analytics ingestion**
- `analytics/views.py`: `EventIngestionView` -- accepts POST with `{path, referrer, session_id}`, creates `PageView` asynchronously (use `transaction.on_commit` + Redis queue or direct Temporal activity)
- `analytics/services.py`: `record_page_view(data)`, `get_overview(date_from, date_to)`, `get_post_analytics(post_id, date_from, date_to)`, `export_csv(date_from, date_to)`

2.8. **URL wiring**
- `config/urls.py`:
  ```python
  urlpatterns = [
      path('api/v1/', include('apps.posts.urls')),
      path('api/v1/', include('apps.accounts.urls')),
      path('api/v1/', include('apps.media_library.urls')),
      path('api/v1/', include('apps.comments.urls')),
      path('api/v1/', include('apps.newsletters.urls')),
      path('api/v1/', include('apps.analytics.urls')),
      path('api/v1/', include('apps.seo.urls')),
  ]
  ```

2.9. **Seed data**
- Management command `python manage.py seed` that creates: 1 admin user, 6 categories, 20 tags, 30 sample posts (varying statuses), sample comments, sample subscribers

**Deliverable:** Full API testable via `curl` or Swagger (add `drf-spectacular` for OpenAPI docs at `/api/v1/docs/`).

---

### PHASE 3: Public Blog Frontend (Week 4-6)

**Goal:** Fully functional, SEO-optimized public blog.

**Tasks:**

3.1. **Design system and layout**
- `blog/src/styles/globals.css`: Define `@theme` block with color tokens for light/dark, font families (Inter for body, JetBrains Mono for code), spacing scale
- `blog/src/lib/utils/cn.ts`: `clsx` + `tailwind-merge` helper
- `blog/src/components/layout/Header.tsx`: Logo, navigation links (Home, Categories dropdown, About), search icon, ThemeToggle
- `blog/src/components/layout/Footer.tsx`: Logo, nav links, social icons, newsletter inline form, copyright
- `blog/src/components/layout/MobileMenu.tsx`: slide-over menu for mobile
- `blog/src/components/layout/ThemeToggle.tsx`: uses `next-themes` provider
- `blog/src/app/layout.tsx`: ThemeProvider, font loading (next/font), Header, Footer, analytics script

3.2. **API client layer**
- `blog/src/lib/api/client.ts`: `apiFetch<T>(path, options)` -- prepends `NEXT_PUBLIC_API_URL`, handles errors, returns typed data. Supports both server-side (no-cache/ISR) and client-side fetching.
- `blog/src/lib/api/posts.ts`: `getPosts(params)`, `getPostBySlug(slug)`, `getFeaturedPosts()`, `getTrendingPosts()`, `searchPosts(query, cursor)`, `getAutocomplete(query)`
- `blog/src/lib/api/categories.ts`: `getCategories()`, `getCategoryBySlug(slug)`, `getPostsByCategory(slug, cursor)`
- `blog/src/lib/api/comments.ts`: `getComments(postSlug)`, `submitComment(postSlug, data)`
- `blog/src/lib/api/newsletter.ts`: `subscribe(email)`
- `blog/src/lib/api/analytics.ts`: `sendPageView(path, referrer)`
- `blog/src/lib/types/`: TypeScript interfaces matching API serializer shapes

3.3. **Homepage**
- `blog/src/app/page.tsx`: Server Component. Fetches featured posts, recent posts, trending posts, categories in parallel. Passes to child components.
- `HeroSection.tsx`: Large card for primary featured post (full-width image, title overlay, excerpt, category badge, reading time). Two secondary featured cards beside or below. Inspired by Gizmodo's dense hero.
- `CategoryBar.tsx`: Horizontal scrollable chips for all categories. Clicking navigates to `/categories/{slug}`. Inspired by Framer's filter bar.
- `RecentPosts.tsx`: Responsive grid (3 columns desktop, 2 tablet, 1 mobile) of `PostCard` components. Shows first 12. Has `LoadMoreButton` that fetches next cursor page client-side.
- `TrendingPosts.tsx`: Sidebar or numbered list (1-5) with `PostCardCompact`. Inspired by Mockplus "most popular" sidebar.
- `NewsletterCTA.tsx`: Full-width section with email input, "Subscribe" button, success/error toast.

3.4. **Post cards**
- `PostCard.tsx`: Featured image (Next.js `Image`, lazy loaded), category badge (color-coded), title (link), excerpt (2 lines, truncated), author avatar + name, date, reading time. Hover: subtle scale + shadow.
- `PostCardLarge.tsx`: Hero variant, larger image, more excerpt text.
- `PostCardCompact.tsx`: No image, numbered or small thumbnail, title + date only.

3.5. **Article page**
- `blog/src/app/posts/[slug]/page.tsx`: Server Component. Fetches post by slug. `generateMetadata` for dynamic SEO (title, description, OG tags, article structured data).
- `ArticleHeader.tsx`: Title (h1), category badge, author card (avatar, name, bio snippet), published date, reading time, social share buttons.
- `ArticleBody.tsx`: Renders TipTap JSON or pre-rendered `body_html`. Uses custom components for each block type:
  - `CodeBlock.tsx`: syntax highlighting via `shiki` or `prism-react-renderer`
  - `ImageBlock.tsx`: Next.js `Image` with caption, lightbox on click
  - `QuoteBlock.tsx`: styled blockquote with attribution
  - `EmbedBlock.tsx`: responsive iframe for YouTube/Twitter
- `ArticleTOC.tsx`: Sticky sidebar table of contents extracted from headings. Highlights current section via Intersection Observer. Inspired by Mockplus sticky sidebar.
- `RelatedArticles.tsx`: 3 posts from same category, excluding current. Grid of `PostCard`.
- `SocialShareBar.tsx`: Fixed or inline. Twitter, LinkedIn, copy-to-clipboard. Uses Web Share API on mobile.
- `CommentSection.tsx`, `CommentForm.tsx`, `CommentThread.tsx`: Threaded comments. Form has name, email, body fields. Client Component with optimistic UI.

3.6. **Reading progress indicator**
- `useReadingProgress.ts` hook: tracks scroll position, returns percentage
- Thin progress bar at top of article page

3.7. **Category and tag pages**
- `blog/src/app/categories/page.tsx`: Grid of category cards (name, description, post count, color)
- `blog/src/app/categories/[slug]/page.tsx`: Category header + paginated posts grid
- `blog/src/app/tags/[slug]/page.tsx`: Tag header + paginated posts

3.8. **Search**
- `blog/src/components/search/SearchInput.tsx`: Client Component. Debounced input (300ms). Calls autocomplete API. Dropdown with suggestions. Enter submits to `/search?q=...`.
- `blog/src/app/search/page.tsx`: Server Component reads `searchParams.q`, fetches results. Shows result count, highlighted matches, `LoadMoreButton`.

3.9. **SEO**
- `blog/src/app/sitemap.ts`: Fetches all published post slugs from API, generates XML sitemap
- `blog/src/app/robots.ts`: Allow all, point to sitemap
- `generateMetadata` on every page route
- JSON-LD structured data for Article, BreadcrumbList, Organization

3.10. **Analytics tracking**
- Client-side: `useEffect` in layout or a dedicated `AnalyticsProvider` that fires `sendPageView` on route change (using `usePathname` + `useSearchParams`)

3.11. **Performance**
- All images via `next/image` with `sizes` prop and blur placeholder
- `loading.tsx` files with skeleton components for each route
- ISR: `revalidate: 60` on homepage, `revalidate: 300` on article pages
- Font optimization via `next/font/google`

**Deliverable:** Fully navigable public blog. SEO-optimized. Dark/light mode. Responsive. Performant.

---

### PHASE 4: Admin Backoffice Frontend (Week 6-8)

**Goal:** Full content management interface.

**Tasks:**

4.1. **Authentication**
- `admin-backoffice/src/lib/auth/context.tsx`: `AuthProvider` with React Context. Stores tokens in `httpOnly` cookies (via Next.js API route) or `localStorage`. Provides `user`, `login()`, `logout()`, `isAuthenticated`.
- `admin-backoffice/src/lib/auth/tokens.ts`: `getAccessToken()`, `setTokens(access, refresh)`, `clearTokens()`, `refreshAccessToken()`
- `admin-backoffice/src/lib/api/client.ts`: Wrapper that auto-attaches `Authorization: Bearer <token>`, auto-refreshes on 401, redirects to login on refresh failure.
- `admin-backoffice/src/app/(auth)/login/page.tsx`: Email + password form, error handling
- `admin-backoffice/src/components/auth/ProtectedRoute.tsx`: Middleware or layout-level redirect for unauthenticated users. Use Next.js middleware (`middleware.ts`) to check cookie.

4.2. **Dashboard shell**
- `admin-backoffice/src/app/(dashboard)/layout.tsx`: Sidebar + Topbar + main content area
- `Sidebar.tsx`: Collapsible. Icons + labels. Sections: Dashboard, Posts, Categories, Tags, Media, Comments, Analytics, Newsletter, Users, Settings. Active state highlighting. Collapse to icons on narrow screens.
- `Topbar.tsx`: Breadcrumb, search, user avatar dropdown (profile, logout)

4.3. **Dashboard overview**
- `admin-backoffice/src/app/(dashboard)/page.tsx`: Fetches analytics overview
- `OverviewCards.tsx`: 4 stat cards: Total Views (with % change), Unique Visitors, Bounce Rate, Total Posts
- `ViewsChart.tsx`: Line chart (Recharts `LineChart`) showing views over last 30 days. Date range picker.
- `TopPostsTable.tsx`: Top 5 posts by views, with title, views, unique visitors
- Quick actions: "New Post" button, recent drafts list

4.4. **Post management**
- `admin-backoffice/src/app/(dashboard)/posts/page.tsx`: Full data table
- `PostsTable.tsx`: Columns: Title, Author, Category, Status (badge), Published Date, Views, Actions (edit, delete). Sortable headers. Filterable by status, category. Search. Bulk select + bulk delete/publish.
- `PostFilters.tsx`: Status dropdown, category dropdown, search input, date range
- `PostStatusBadge.tsx`: Color-coded (green=published, yellow=draft, blue=scheduled, gray=archived)

4.5. **Post editor**
- `admin-backoffice/src/app/(dashboard)/posts/new/page.tsx` and `[id]/edit/page.tsx`: Both render `PostEditor`
- `PostEditor.tsx`: Full-page editor layout. Left: editor area. Right: metadata sidebar.
  - Uses TipTap with extensions: `StarterKit`, `Image`, `CodeBlockLowlight`, `Link`, `Placeholder`, `Typography`, `TaskList`
  - `EditorToolbar.tsx`: Bold, italic, headings (H2-H4), bullet list, numbered list, code block, blockquote, image upload, embed, horizontal rule, undo/redo
  - Block-based: each block (paragraph, heading, image, code, quote, embed) is visually distinct. Drag handles for reordering. Slash command menu (`/`) for inserting blocks (Notion-style).
- `EditorSidebar.tsx`:
  - `PublishControls.tsx`: Status selector (Draft/Publish/Schedule). If Schedule: datetime picker. Save Draft button, Publish/Update button.
  - `SlugEditor.tsx`: Auto-generated from title, manually editable
  - Category dropdown (single select)
  - Tags multi-select with create-on-the-fly
  - `FeaturedImagePicker.tsx`: Opens media library modal, shows selected image preview
  - Position control: radio buttons for `hero`, `sidebar`, `trending`, or none
  - `is_featured` toggle
  - `SEOMetadataForm.tsx`: meta_title (with character counter /70), meta_description (/160), OG overrides, preview of Google SERP snippet

4.6. **Media library**
- `admin-backoffice/src/app/(dashboard)/media/page.tsx`
- `MediaGrid.tsx`: Masonry or uniform grid of thumbnails. Select mode for bulk operations.
- `MediaUploader.tsx`: Drag-and-drop zone. Progress bar per file. Validates type (image/*, pdf, svg) and size (<10MB).
- `MediaDetail.tsx`: Modal or side panel showing full image, editable alt_text, caption, file info (dimensions, size, type), copy URL button, delete button.

4.7. **Category and tag management**
- `admin-backoffice/src/app/(dashboard)/categories/page.tsx`: Editable table. Inline create. Color picker for category color. Sort order drag.
- `admin-backoffice/src/app/(dashboard)/tags/page.tsx`: Simple CRUD table. Merge tags feature (future).

4.8. **Comment moderation**
- `admin-backoffice/src/app/(dashboard)/comments/page.tsx`
- `ModerationQueue.tsx`: List of pending comments. Each row: post title, author name, body preview, date, approve/reject buttons. Bulk approve.

4.9. **Newsletter management**
- `admin-backoffice/src/app/(dashboard)/newsletters/page.tsx`: Subscriber table with count, export CSV
- `admin-backoffice/src/app/(dashboard)/newsletters/campaigns/new/page.tsx`: Campaign editor (subject, body HTML editor, preview, send)

4.10. **User management**
- `admin-backoffice/src/app/(dashboard)/users/page.tsx`: User table. Create new author/editor. Edit role. Deactivate.

**Deliverable:** Fully functional CMS. Authors can write, editors can review, admins can manage everything.

---

### PHASE 5: Temporal Workflows and Analytics (Week 8-9)

**Goal:** Async task processing and analytics pipeline.

**Tasks:**

5.1. **Temporal worker setup**
- `temporal/config.py`: Read `TEMPORAL_HOST`, `TEMPORAL_NAMESPACE`, `TEMPORAL_TASK_QUEUE` from env
- `temporal/worker.py`: Creates Temporal client, registers all workflows + activities, starts worker

5.2. **Scheduled publishing workflow**
- `temporal/workflows/publish_scheduled.py`:
  - Workflow: runs on a cron schedule (every minute). Queries posts where `status=scheduled AND scheduled_for <= now()`. For each, calls `publish_post` activity.
  - Activity: updates post status to `published`, sets `published_at`, triggers cache invalidation.

5.3. **Newsletter sending workflow**
- `temporal/workflows/send_newsletter.py`:
  - Workflow: accepts campaign_id. Fetches all confirmed subscribers. Fans out to `send_email` activity in batches of 50. Tracks progress. Updates campaign status on completion.
  - Activity: `send_email(subscriber_email, subject, body_html)` using SMTP or SES. Logs result to `SendLog`.

5.4. **Analytics aggregation workflow**
- `temporal/workflows/aggregate_analytics.py`:
  - Workflow: runs daily at 2am. Reads raw `PageView` rows for previous day. Aggregates per-post and site-wide into `AnalyticsSnapshot`. Updates `Post.view_count` denormalized field.

5.5. **Image processing workflow**
- `temporal/workflows/process_image.py`:
  - Workflow: triggered on media upload. Activities: validate image, generate thumbnail (300px wide), convert to WebP, update `MediaAsset` record with thumbnail path and dimensions.

**Deliverable:** `temporal-worker` container processes all async tasks. Scheduled posts publish automatically. Newsletter campaigns send. Analytics aggregate nightly.

---

### PHASE 6: Polish, Testing, and Deployment (Week 9-11)

**Goal:** Production readiness.

**Tasks:**

6.1. **Backend testing**
- `pytest` + `pytest-django` + `factory_boy` for model factories
- Test each repository method, service method, and API endpoint
- Target: 80%+ coverage on services and views

6.2. **Frontend testing**
- `vitest` + `@testing-library/react` for component tests
- `playwright` for E2E: homepage loads, search works, article renders, admin login + create post flow

6.3. **Performance optimization**
- Backend: add `select_related`/`prefetch_related` everywhere, database query logging, N+1 detection
- Blog: Lighthouse audit targeting 90+ on all metrics. Optimize LCP (preload hero image), CLS (image dimension reservation), FID (minimal client JS).
- Add `Cache-Control` headers to public API responses (e.g., `max-age=60` for post list, `max-age=300` for post detail)

6.4. **Security hardening**
- Django: `SECURE_HSTS_SECONDS`, `SECURE_SSL_REDIRECT`, `CSRF_COOKIE_SECURE`, `SESSION_COOKIE_SECURE` in prod settings
- Rate limiting on all public write endpoints (comment submission, newsletter subscribe, analytics ingestion)
- Input sanitization on comment body (bleach or similar)
- CORS locked to specific origins in production

6.5. **Production Docker**
- `docker-compose.prod.yml`: overrides with production settings, no volume mounts for code (copy only), restart policies, health checks
- Nginx reverse proxy: serves blog at `/`, admin at `/admin-panel/`, API at `/api/`
- SSL termination (certbot or Cloudflare)

6.6. **CI/CD pipeline** (GitHub Actions)
- On PR: lint (ruff for Python, eslint for TS), type check, run tests
- On merge to main: build Docker images, push to registry, deploy

6.7. **Monitoring**
- Structured logging (structlog for Django, pino or console for Next.js)
- Error tracking: Sentry integration in all three apps
- Uptime monitoring: health check endpoints (`/api/v1/health/`)

---

## 7. Key Architecture Decisions

**Repository + Service pattern in Django:** Every Django app follows the same structure. `repositories.py` contains only data access (ORM queries). `services.py` contains business logic and calls repositories. `views.py` calls services, never touches ORM directly. This keeps views thin, logic testable, and data access swappable.

**TipTap JSON as source of truth:** Posts store `body` as TipTap JSON (the editor's native format). On save, the service renders `body_html` (for fast public serving) and `body_text` (for FTS indexing). This avoids re-parsing on every read while keeping the structured editor format for future re-editing.

**Cursor pagination for public API, page-number for admin:** The public blog uses cursor pagination because it is stable under inserts (new posts do not shift pages) and supports efficient infinite scroll. The admin uses page-number pagination because admins need to jump to specific pages and see total counts.

**PostgreSQL FTS over Elasticsearch:** For a blog with fewer than 100K posts, PostgreSQL's built-in `tsvector` + `GIN` index is sufficient and avoids an extra service. If search demands grow, Elasticsearch can be added later by replacing only the repository method.

**Temporal over Celery:** Temporal provides durable, resumable workflows with built-in retry, timeout, and visibility. For scheduled publishing (which must not be missed) and newsletter fan-out (which must track progress), Temporal's guarantees are stronger than Celery's at-most-once default. The Temporal server also provides a UI for workflow inspection.

**Separate Next.js apps for blog and admin:** They have fundamentally different concerns. The blog is SSR/ISR-heavy, SEO-critical, and mostly read-only Server Components. The admin is client-heavy, behind auth, and interaction-dense. Separate apps mean independent deployment, no cross-contamination of bundle size, and different caching strategies.

**WhiteNoise for static, S3 for media:** WhiteNoise efficiently serves Django's own static files (admin CSS, DRF browsable API CSS) without nginx. User-uploaded media goes to S3 in production (local filesystem in dev) via `django-storages`. This separates concerns: WhiteNoise handles immutable hashed assets, S3 handles mutable user content.

---

## 8. Dependency Summary

### Backend (`requirements/base.txt`)
```
Django==5.1.*
djangorestframework==3.15.*
djangorestframework-simplejwt==5.4.*
django-cors-headers==4.6.*
django-filter==24.*
django-storages==1.14.*
drf-spectacular==0.28.*
whitenoise==6.8.*
psycopg[binary]==3.2.*
Pillow==11.*
boto3==1.35.*
temporalio==1.9.*
gunicorn==23.*
structlog==24.*
sentry-sdk[django]==2.*
bleach==6.*
```

### Blog (`blog/package.json` key dependencies)
```json
{
  "next": "15.*",
  "react": "19.*",
  "tailwindcss": "4.*",
  "@tailwindcss/postcss": "4.*",
  "next-themes": "^0.4",
  "clsx": "^2",
  "tailwind-merge": "^2",
  "shiki": "^1",
  "date-fns": "^4",
  "swr": "^2"
}
```

### Admin (`admin-backoffice/package.json` key dependencies)
```json
{
  "next": "15.*",
  "react": "19.*",
  "tailwindcss": "4.*",
  "@tailwindcss/postcss": "4.*",
  "@tiptap/react": "^2",
  "@tiptap/starter-kit": "^2",
  "@tiptap/extension-image": "^2",
  "@tiptap/extension-code-block-lowlight": "^2",
  "@tiptap/extension-link": "^2",
  "@tiptap/extension-placeholder": "^2",
  "recharts": "^2",
  "date-fns": "^4",
  "swr": "^2",
  "react-dropzone": "^14",
  "clsx": "^2",
  "tailwind-merge": "^2"
}
```

---

## 9. Data Flow Diagrams (Textual)

### Public blog page load
```
Browser -> Next.js Server Component -> fetch(API_URL/posts/?cursor=X)
  -> Django View -> PostService.get_public_feed()
    -> PostRepository.get_published(filters)
      -> PostgreSQL (SELECT ... WHERE status='published' ORDER BY published_at DESC)
    <- QuerySet
  <- Serialized JSON
<- Rendered HTML (streamed via React Server Components)
```

### Admin post creation
```
Browser (PostEditor) -> POST /api/v1/admin/posts/ (JWT in Authorization header)
  -> Django AdminPostViewSet.create()
    -> PostService.create_post(validated_data, request.user)
      -> generate slug, compute reading_time, render body_html, extract body_text
      -> PostRepository.create(data)
        -> PostgreSQL INSERT
      -> Update search_vector (UPDATE ... SET search_vector = to_tsvector(...))
    <- Post instance
  <- 201 Created + PostDetailSerializer
```

### Scheduled publish
```
Temporal Cron (every 1 min) -> publish_scheduled_workflow
  -> query_due_posts activity -> PostgreSQL (SELECT ... WHERE status='scheduled' AND scheduled_for <= now())
  -> for each post: publish_post activity
    -> PostService.publish(post_id)
      -> UPDATE status='published', published_at=now()
```

---

### Critical Files for Implementation

- `/Users/kennedy/development/gainciti/backend/apps/posts/models.py` -- The Post model is the central entity; its design (JSON body, search_vector, denormalized view_count, status workflow) dictates the entire system's behavior.
- `/Users/kennedy/development/gainciti/backend/apps/posts/services.py` -- The PostService encapsulates all business logic (slug generation, reading time computation, HTML rendering, FTS indexing, publish/schedule state machine); getting this right is prerequisite to both frontends.
- `/Users/kennedy/development/gainciti/blog/src/app/posts/[slug]/page.tsx` -- The article detail page is the highest-value page on the public blog; it must handle SEO metadata generation, structured data, content rendering, and performance in a single Server Component.
- `/Users/kennedy/development/gainciti/admin-backoffice/src/components/editor/PostEditor.tsx` -- The TipTap-based block editor is the most complex frontend component; its integration with the metadata sidebar, media library, and publish controls defines the authoring experience.
- `/Users/kennedy/development/gainciti/docker-compose.yml` -- Orchestrates all 8+ services (postgres, redis, temporal, temporal-ui, backend, temporal-worker, blog, admin); errors here block all development.