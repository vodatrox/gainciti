"""Seed the database with sample data for development."""

import json
import random
import secrets
from datetime import timedelta

from django.contrib.postgres.search import SearchVector
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.utils.text import slugify

from apps.accounts.models import User
from apps.analytics.models import AnalyticsSnapshot, PageView
from apps.comments.models import Comment
from apps.newsletters.models import Subscriber
from apps.posts.models import Category, Post, PostTag, Tag
from apps.seo.models import SEOMetadata


CATEGORIES = [
    {"name": "Technology", "color": "#6366F1", "description": "Latest tech trends, gadgets, and digital innovation."},
    {"name": "Finance", "color": "#10B981", "description": "Investment strategies, market analysis, and financial growth."},
    {"name": "Business", "color": "#F59E0B", "description": "Entrepreneurship, startups, and business strategy."},
    {"name": "Lifestyle", "color": "#EC4899", "description": "Personal development, wellness, and modern living."},
    {"name": "AI & Machine Learning", "color": "#8B5CF6", "description": "Artificial intelligence, deep learning, and automation."},
    {"name": "Crypto & Web3", "color": "#06B6D4", "description": "Blockchain, cryptocurrency, and decentralized finance."},
]

TAGS = [
    "python", "javascript", "react", "nextjs", "django", "investing",
    "startups", "productivity", "design", "ux", "ai", "blockchain",
    "cloud", "devops", "mobile", "saas", "fintech", "leadership",
    "growth", "marketing",
]

SAMPLE_POSTS = [
    {
        "title": "The Future of AI in Financial Markets",
        "excerpt": "How artificial intelligence is reshaping trading strategies and risk management in modern financial markets.",
        "category": "AI & Machine Learning",
    },
    {
        "title": "Building Scalable Web Applications with Next.js 15",
        "excerpt": "A deep dive into Next.js 15's App Router, Server Components, and how to build production-ready applications.",
        "category": "Technology",
    },
    {
        "title": "10 Investment Strategies for the Modern Investor",
        "excerpt": "Diversification, index funds, and emerging market opportunities that every investor should consider.",
        "category": "Finance",
    },
    {
        "title": "Why Every Startup Needs a Technical Co-Founder",
        "excerpt": "The critical role of technical leadership in early-stage startups and how it impacts fundraising.",
        "category": "Business",
    },
    {
        "title": "Understanding DeFi: A Complete Beginner's Guide",
        "excerpt": "Decentralized finance explained — from liquidity pools to yield farming and everything in between.",
        "category": "Crypto & Web3",
    },
    {
        "title": "The Art of Deep Work in a Distracted World",
        "excerpt": "Practical strategies for achieving focused, meaningful work in an age of constant notifications.",
        "category": "Lifestyle",
    },
    {
        "title": "Django vs FastAPI: Choosing the Right Python Framework",
        "excerpt": "A comprehensive comparison of Django and FastAPI for building modern REST APIs.",
        "category": "Technology",
    },
    {
        "title": "How to Build a Personal Brand That Attracts Opportunity",
        "excerpt": "Lessons from top industry leaders on crafting an authentic personal brand online.",
        "category": "Business",
    },
    {
        "title": "Machine Learning Operations: From Notebook to Production",
        "excerpt": "Best practices for deploying ML models with CI/CD, monitoring, and feature stores.",
        "category": "AI & Machine Learning",
    },
    {
        "title": "The Rise of Tokenized Real-World Assets",
        "excerpt": "How blockchain is enabling fractional ownership of real estate, art, and commodities.",
        "category": "Crypto & Web3",
    },
    {
        "title": "Mastering CSS Grid and Flexbox for Modern Layouts",
        "excerpt": "Practical examples and patterns for building responsive, pixel-perfect layouts.",
        "category": "Technology",
    },
    {
        "title": "Index Funds vs ETFs: Which Is Right for You?",
        "excerpt": "Breaking down the differences, tax implications, and performance of passive investment vehicles.",
        "category": "Finance",
    },
    {
        "title": "Remote Team Leadership: Managing Across Time Zones",
        "excerpt": "Strategies for building trust, maintaining productivity, and fostering culture in distributed teams.",
        "category": "Business",
    },
    {
        "title": "Mindful Productivity: Working Smarter, Not Harder",
        "excerpt": "How mindfulness practices can dramatically improve your focus and output at work.",
        "category": "Lifestyle",
    },
    {
        "title": "Prompt Engineering: Getting the Most from Large Language Models",
        "excerpt": "Advanced techniques for crafting prompts that produce accurate, useful AI outputs.",
        "category": "AI & Machine Learning",
    },
    {
        "title": "Building a SaaS Product from Zero to $10K MRR",
        "excerpt": "A step-by-step playbook covering ideation, validation, MVP development, and growth.",
        "category": "Business",
    },
    {
        "title": "PostgreSQL Performance Tuning for High-Traffic Applications",
        "excerpt": "Index strategies, query optimization, and connection pooling for production databases.",
        "category": "Technology",
    },
    {
        "title": "The Psychology of Spending: Why We Buy What We Buy",
        "excerpt": "Understanding the cognitive biases that influence our financial decisions.",
        "category": "Finance",
    },
    {
        "title": "Docker and Kubernetes in Production: Lessons Learned",
        "excerpt": "Real-world insights from running containerized workloads at scale.",
        "category": "Technology",
    },
    {
        "title": "Morning Routines of Successful Entrepreneurs",
        "excerpt": "What the most productive founders do before 9 AM to set up their day for success.",
        "category": "Lifestyle",
    },
    {
        "title": "Smart Contracts Explained: Code as Law",
        "excerpt": "How Ethereum smart contracts work and their implications for business automation.",
        "category": "Crypto & Web3",
    },
    {
        "title": "The Complete Guide to API Design Best Practices",
        "excerpt": "RESTful conventions, versioning, pagination, and error handling patterns.",
        "category": "Technology",
    },
    {
        "title": "Compound Interest: The Eighth Wonder of the World",
        "excerpt": "Why starting to invest early is the single most powerful financial decision you can make.",
        "category": "Finance",
    },
    {
        "title": "Building Design Systems That Scale",
        "excerpt": "How to create and maintain a design system that serves multiple products and teams.",
        "category": "Technology",
    },
    {
        "title": "The Lean Startup Methodology in 2026",
        "excerpt": "How the build-measure-learn loop has evolved for the AI era.",
        "category": "Business",
    },
    {
        "title": "RAG Architecture: Building AI Apps with Your Own Data",
        "excerpt": "Retrieval-Augmented Generation explained with practical implementation patterns.",
        "category": "AI & Machine Learning",
    },
    {
        "title": "Automating Your Finances: Tools and Strategies",
        "excerpt": "Set-and-forget systems for budgeting, saving, and investing on autopilot.",
        "category": "Finance",
    },
    {
        "title": "Web Performance in 2026: Core Web Vitals Deep Dive",
        "excerpt": "How to achieve perfect Lighthouse scores and deliver fast user experiences.",
        "category": "Technology",
    },
    {
        "title": "Finding Your Ikigai: Purpose-Driven Career Design",
        "excerpt": "Aligning passion, mission, vocation, and profession for a fulfilling career.",
        "category": "Lifestyle",
    },
    {
        "title": "NFTs Beyond Art: Utility Tokens and Digital Identity",
        "excerpt": "How non-fungible tokens are evolving beyond digital art into real-world applications.",
        "category": "Crypto & Web3",
    },
]


def make_tiptap_body(title: str, excerpt: str) -> dict:
    """Generate a realistic TipTap JSON document."""
    return {
        "type": "doc",
        "content": [
            {
                "type": "heading",
                "attrs": {"level": 2},
                "content": [{"type": "text", "text": f"Introduction to {title}"}],
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": f"{excerpt} In this article, we explore the key concepts, practical applications, and future implications of this topic.",
                    }
                ],
            },
            {
                "type": "heading",
                "attrs": {"level": 2},
                "content": [{"type": "text", "text": "Key Concepts"}],
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "Understanding the fundamentals is crucial before diving into advanced topics. Let's break down the core ideas that form the foundation of this subject.",
                    }
                ],
            },
            {
                "type": "bulletList",
                "content": [
                    {
                        "type": "listItem",
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [{"type": "text", "text": "First, we need to understand the underlying principles and how they connect to broader trends."}],
                            }
                        ],
                    },
                    {
                        "type": "listItem",
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [{"type": "text", "text": "Second, practical implementation requires careful consideration of trade-offs and constraints."}],
                            }
                        ],
                    },
                    {
                        "type": "listItem",
                        "content": [
                            {
                                "type": "paragraph",
                                "content": [{"type": "text", "text": "Third, measuring outcomes and iterating based on data is essential for long-term success."}],
                            }
                        ],
                    },
                ],
            },
            {
                "type": "heading",
                "attrs": {"level": 2},
                "content": [{"type": "text", "text": "Practical Applications"}],
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "Theory without practice is incomplete. Here are actionable steps you can take today to apply these concepts in your work and daily life. The key is starting small and building momentum over time.",
                    }
                ],
            },
            {
                "type": "blockquote",
                "content": [
                    {
                        "type": "paragraph",
                        "content": [
                            {
                                "type": "text",
                                "text": "The best time to start was yesterday. The second best time is now.",
                            }
                        ],
                    }
                ],
            },
            {
                "type": "heading",
                "attrs": {"level": 2},
                "content": [{"type": "text", "text": "Looking Ahead"}],
            },
            {
                "type": "paragraph",
                "content": [
                    {
                        "type": "text",
                        "text": "As we look to the future, the trends discussed here will only accelerate. Staying informed, adaptable, and proactive is the best strategy for navigating the changes ahead. Keep learning, keep building, and keep growing.",
                    }
                ],
            },
        ],
    }


def extract_text(body: dict) -> str:
    """Extract plain text from TipTap JSON."""
    texts = []

    def walk(node):
        if isinstance(node, dict):
            if "text" in node:
                texts.append(node["text"])
            for child in node.get("content", []):
                walk(child)
        elif isinstance(node, list):
            for item in node:
                walk(item)

    walk(body)
    return " ".join(texts)


class Command(BaseCommand):
    help = "Seed the database with sample data for development"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # 1. Create admin user
        admin, created = User.objects.get_or_create(
            email="admin@gainciti.com",
            defaults={
                "first_name": "Admin",
                "last_name": "User",
                "role": "admin",
                "is_staff": True,
                "is_superuser": True,
                "bio": "GainCiti platform administrator.",
            },
        )
        if created:
            admin.set_password("admin123")
            admin.save()
            self.stdout.write(self.style.SUCCESS("  Created admin user: admin@gainciti.com / admin123"))

        # Create an author
        author, created = User.objects.get_or_create(
            email="author@gainciti.com",
            defaults={
                "first_name": "Jane",
                "last_name": "Writer",
                "role": "author",
                "bio": "Tech writer and financial analyst with 8 years of experience.",
            },
        )
        if created:
            author.set_password("author123")
            author.save()
            self.stdout.write(self.style.SUCCESS("  Created author user: author@gainciti.com / author123"))

        # 2. Create categories
        categories = {}
        for i, cat_data in enumerate(CATEGORIES):
            cat, _ = Category.objects.get_or_create(
                name=cat_data["name"],
                defaults={
                    "slug": slugify(cat_data["name"]),
                    "description": cat_data["description"],
                    "color": cat_data["color"],
                    "sort_order": i,
                },
            )
            categories[cat_data["name"]] = cat
        self.stdout.write(self.style.SUCCESS(f"  Created {len(CATEGORIES)} categories"))

        # 3. Create tags
        tags = []
        for tag_name in TAGS:
            tag, _ = Tag.objects.get_or_create(
                name=tag_name,
                defaults={"slug": slugify(tag_name)},
            )
            tags.append(tag)
        self.stdout.write(self.style.SUCCESS(f"  Created {len(TAGS)} tags"))

        # 4. Create posts
        authors = [admin, author]
        now = timezone.now()
        posts_created = 0

        for i, post_data in enumerate(SAMPLE_POSTS):
            slug = slugify(post_data["title"])
            if Post.objects.filter(slug=slug).exists():
                continue

            body = make_tiptap_body(post_data["title"], post_data["excerpt"])
            body_text = extract_text(body)
            body_html = f"<h2>Introduction to {post_data['title']}</h2><p>{post_data['excerpt']}</p><p>{body_text[:500]}</p>"

            # Vary statuses
            if i < 24:
                status = Post.Status.PUBLISHED
                published_at = now - timedelta(days=30 - i, hours=random.randint(0, 12))
            elif i < 27:
                status = Post.Status.DRAFT
                published_at = None
            else:
                status = Post.Status.SCHEDULED
                published_at = None

            word_count = len(body_text.split())

            post = Post.objects.create(
                title=post_data["title"],
                slug=slug,
                excerpt=post_data["excerpt"],
                body=body,
                body_html=body_html,
                body_text=body_text,
                author=random.choice(authors),
                category=categories[post_data["category"]],
                status=status,
                is_featured=(i < 3),
                is_pinned=(i == 0),
                position="hero" if i == 0 else ("trending" if i < 5 else ""),
                reading_time_minutes=max(1, word_count // 200),
                published_at=published_at,
                scheduled_for=(now + timedelta(days=random.randint(1, 7))) if status == Post.Status.SCHEDULED else None,
                view_count=random.randint(50, 5000) if status == Post.Status.PUBLISHED else 0,
            )

            # Add random tags
            post_tags = random.sample(tags, random.randint(2, 5))
            for tag in post_tags:
                PostTag.objects.get_or_create(post=post, tag=tag)

            # Create SEO metadata for published posts
            if status == Post.Status.PUBLISHED:
                SEOMetadata.objects.get_or_create(
                    post=post,
                    defaults={
                        "meta_title": post_data["title"][:70],
                        "meta_description": post_data["excerpt"][:160],
                    },
                )

            posts_created += 1

        # Update search vectors
        Post.objects.update(
            search_vector=SearchVector("title", weight="A") + SearchVector("body_text", weight="B")
        )

        self.stdout.write(self.style.SUCCESS(f"  Created {posts_created} posts"))

        # 5. Create sample comments
        published_posts = list(Post.objects.filter(status=Post.Status.PUBLISHED)[:10])
        comments_created = 0
        comment_authors = [
            ("Alex Johnson", "alex@example.com"),
            ("Maria Garcia", "maria@example.com"),
            ("David Chen", "david@example.com"),
            ("Sarah Williams", "sarah@example.com"),
            ("Mike Brown", "mike@example.com"),
        ]
        comment_bodies = [
            "Great article! Really insightful and well-written.",
            "This is exactly what I needed to read today. Thanks for sharing.",
            "I've been thinking about this topic a lot lately. Excellent analysis.",
            "Could you elaborate more on the practical applications? Would love a follow-up piece.",
            "Shared this with my team. Very relevant to what we're working on.",
            "The section on key concepts really resonated with me. Bookmarked!",
            "Interesting perspective. I'd love to see some case studies on this.",
        ]

        for post in published_posts:
            for _ in range(random.randint(1, 4)):
                name, email = random.choice(comment_authors)
                Comment.objects.create(
                    post=post,
                    author_name=name,
                    author_email=email,
                    body=random.choice(comment_bodies),
                    is_approved=random.choice([True, True, True, False]),
                )
                comments_created += 1

        self.stdout.write(self.style.SUCCESS(f"  Created {comments_created} comments"))

        # 6. Create sample subscribers
        subscribers_created = 0
        for i in range(15):
            _, created = Subscriber.objects.get_or_create(
                email=f"subscriber{i+1}@example.com",
                defaults={
                    "is_confirmed": i < 12,
                    "confirmation_token": "" if i < 12 else secrets.token_urlsafe(48),
                },
            )
            if created:
                subscribers_created += 1

        self.stdout.write(self.style.SUCCESS(f"  Created {subscribers_created} subscribers"))

        # 7. Create sample analytics snapshots
        snapshots_created = 0
        for day_offset in range(30):
            date = (now - timedelta(days=day_offset)).date()
            AnalyticsSnapshot.objects.get_or_create(
                post=None,
                date=date,
                defaults={
                    "views": random.randint(100, 800),
                    "unique_visitors": random.randint(60, 400),
                    "bounce_rate": round(random.uniform(0.3, 0.7), 2),
                },
            )
            snapshots_created += 1

        self.stdout.write(self.style.SUCCESS(f"  Created {snapshots_created} analytics snapshots"))

        self.stdout.write(self.style.SUCCESS("\nSeeding complete!"))
        self.stdout.write(f"\n  Admin login: admin@gainciti.com / admin123")
        self.stdout.write(f"  Author login: author@gainciti.com / author123")
