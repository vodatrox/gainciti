"""Factory Boy factories for all models."""

import factory
from django.utils import timezone

from apps.accounts.models import User
from apps.analytics.models import AnalyticsSnapshot, PageView
from apps.comments.models import Comment
from apps.media_library.models import MediaAsset
from apps.newsletters.models import Campaign, Subscriber
from apps.posts.models import Category, Post, PostTag, Tag


class UserFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = User

    email = factory.Sequence(lambda n: f"user{n}@gainciti.com")
    first_name = factory.Faker("first_name")
    last_name = factory.Faker("last_name")
    password = factory.PostGenerationMethodCall("set_password", "testpass123")
    role = "author"
    is_active = True


class AdminUserFactory(UserFactory):
    role = "admin"
    is_staff = True


class EditorUserFactory(UserFactory):
    role = "editor"


class CategoryFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Category

    name = factory.Sequence(lambda n: f"Category {n}")
    slug = factory.Sequence(lambda n: f"category-{n}")
    description = factory.Faker("sentence")
    color = "#6366F1"
    sort_order = factory.Sequence(lambda n: n)
    is_active = True


class TagFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Tag

    name = factory.Sequence(lambda n: f"Tag {n}")
    slug = factory.Sequence(lambda n: f"tag-{n}")


class PostFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Post

    title = factory.Sequence(lambda n: f"Post Title {n}")
    slug = factory.Sequence(lambda n: f"post-title-{n}")
    excerpt = factory.Faker("paragraph")
    body = factory.LazyFunction(lambda: {"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "Sample content " * 20}]}]})
    body_text = factory.LazyFunction(lambda: "Sample content " * 20)
    author = factory.SubFactory(UserFactory)
    category = factory.SubFactory(CategoryFactory)
    status = Post.Status.DRAFT


class PublishedPostFactory(PostFactory):
    status = Post.Status.PUBLISHED
    published_at = factory.LazyFunction(timezone.now)


class MediaAssetFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = MediaAsset

    filename = factory.Sequence(lambda n: f"image_{n}.jpg")
    alt_text = factory.Faker("sentence")
    mime_type = "image/jpeg"
    file_size = 1024 * 100
    width = 800
    height = 600
    uploaded_by = factory.SubFactory(UserFactory)


class CommentFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Comment

    post = factory.SubFactory(PublishedPostFactory)
    author_name = factory.Faker("name")
    author_email = factory.Faker("email")
    body = factory.Faker("paragraph")
    is_approved = False
    ip_hash = factory.Faker("sha256")


class SubscriberFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Subscriber

    email = factory.Sequence(lambda n: f"subscriber{n}@example.com")
    is_confirmed = True


class CampaignFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = Campaign

    subject = factory.Sequence(lambda n: f"Campaign {n}")
    body_html = "<h1>Hello</h1><p>Newsletter content</p>"
    status = Campaign.Status.DRAFT
    created_by = factory.SubFactory(AdminUserFactory)


class PageViewFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = PageView

    path = "/posts/test-post"
    session_id = factory.Faker("uuid4")
    ip_hash = factory.Faker("sha256")


class AnalyticsSnapshotFactory(factory.django.DjangoModelFactory):
    class Meta:
        model = AnalyticsSnapshot

    date = factory.LazyFunction(lambda: timezone.now().date())
    views = factory.Faker("random_int", min=1, max=1000)
    unique_visitors = factory.Faker("random_int", min=1, max=500)
