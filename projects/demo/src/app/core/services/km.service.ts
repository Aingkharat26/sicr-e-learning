import { Injectable, computed, signal } from '@angular/core';
import { KM_ARTICLES, KM_SPACES, KmArticle, KmSpace, KmSpaceId } from '../models/km.model';

@Injectable({
  providedIn: 'root',
})
export class KmService {
  readonly spaces = signal<KmSpace[]>(KM_SPACES);
  private readonly _articles = signal<KmArticle[]>(KM_ARTICLES);
  readonly articles = this._articles.asReadonly();

  readonly selectedSpaceId = signal<'all' | KmSpaceId>('all');
  readonly selectedCategory = signal<string>('All');
  readonly searchQuery = signal<string>('');
  readonly bookmarkedArticleIds = signal<Set<string>>(new Set(['art-001', 'art-004']));
  readonly likedArticleIds = signal<Set<string>>(new Set(['art-001']));

  // Active Space Metadata
  readonly activeSpace = computed(() => {
    const spaceId = this.selectedSpaceId();
    if (spaceId === 'all') return null;
    return this.spaces().find((s) => s.id === spaceId) || null;
  });

  // KPI Statistics
  readonly stats = computed(() => {
    const all = this._articles();
    const totalViews = all.reduce((sum, a) => sum + a.views, 0);
    const totalLikes = all.reduce((sum, a) => sum + a.likes, 0);
    return {
      totalArticles: all.length,
      totalSpaces: this.spaces().length,
      totalViews,
      totalLikes,
      bookmarkedCount: this.bookmarkedArticleIds().size,
    };
  });

  // Unique Categories Available
  readonly availableCategories = computed(() => {
    const spaceId = this.selectedSpaceId();
    let list = this._articles();
    if (spaceId !== 'all') {
      list = list.filter((a) => a.spaceId === spaceId);
    }
    const cats = new Set<string>();
    list.forEach((a) => cats.add(a.category));
    return ['All', ...Array.from(cats)];
  });

  // Filtered Articles based on Space, Category, Search
  readonly filteredArticles = computed(() => {
    const spaceId = this.selectedSpaceId();
    const cat = this.selectedCategory();
    const query = this.searchQuery().trim().toLowerCase();

    return this._articles().filter((article) => {
      // Space filter
      if (spaceId !== 'all' && article.spaceId !== spaceId) {
        return false;
      }
      // Category filter
      if (cat !== 'All' && article.category !== cat) {
        return false;
      }
      // Search query filter (title, summary, tags, author name, markdown sections)
      if (query) {
        const inTitle = article.title.toLowerCase().includes(query);
        const inSummary = article.summary.toLowerCase().includes(query);
        const inAuthor = article.author.name.toLowerCase().includes(query);
        const inTags = article.tags.some((t) => t.toLowerCase().includes(query));
        const inSections = article.sections.some(
          (s) =>
            s.title.toLowerCase().includes(query) ||
            s.contentMarkdown.toLowerCase().includes(query) ||
            (s.codeSnippet && s.codeSnippet.code.toLowerCase().includes(query))
        );
        return inTitle || inSummary || inAuthor || inTags || inSections;
      }
      return true;
    });
  });

  // Pinned / Featured Articles
  readonly featuredArticles = computed(() => {
    return this._articles().filter((a) => a.pinned || a.featured);
  });

  // Bookmarked Articles
  readonly bookmarkedArticles = computed(() => {
    const ids = this.bookmarkedArticleIds();
    return this._articles().filter((a) => ids.has(a.id));
  });

  setSpace(spaceId: 'all' | KmSpaceId) {
    this.selectedSpaceId.set(spaceId);
    this.selectedCategory.set('All');
  }

  setCategory(category: string) {
    this.selectedCategory.set(category);
  }

  setSearch(query: string) {
    this.searchQuery.set(query);
  }

  getArticleById(id: string): KmArticle | undefined {
    return this._articles().find((a) => a.id === id || a.slug === id);
  }

  getArticlesBySpace(spaceId: KmSpaceId): KmArticle[] {
    return this._articles().filter((a) => a.spaceId === spaceId);
  }

  getRelatedArticles(articleId: string): KmArticle[] {
    const article = this.getArticleById(articleId);
    if (!article) return [];
    if (article.relatedArticleIds && article.relatedArticleIds.length > 0) {
      return this._articles().filter((a) => article.relatedArticleIds?.includes(a.id));
    }
    // Fallback to same space
    return this._articles()
      .filter((a) => a.spaceId === article.spaceId && a.id !== article.id)
      .slice(0, 3);
  }

  toggleBookmark(articleId: string) {
    this.bookmarkedArticleIds.update((set) => {
      const newSet = new Set(set);
      if (newSet.has(articleId)) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });
  }

  isBookmarked(articleId: string): boolean {
    return this.bookmarkedArticleIds().has(articleId);
  }

  toggleLike(articleId: string) {
    const isCurrentlyLiked = this.likedArticleIds().has(articleId);
    this.likedArticleIds.update((set) => {
      const newSet = new Set(set);
      if (isCurrentlyLiked) {
        newSet.delete(articleId);
      } else {
        newSet.add(articleId);
      }
      return newSet;
    });

    this._articles.update((list) =>
      list.map((a) => {
        if (a.id === articleId) {
          return {
            ...a,
            likes: isCurrentlyLiked ? Math.max(0, a.likes - 1) : a.likes + 1,
          };
        }
        return a;
      })
    );
  }

  isLiked(articleId: string): boolean {
    return this.likedArticleIds().has(articleId);
  }

  incrementView(articleId: string) {
    this._articles.update((list) =>
      list.map((a) => {
        if (a.id === articleId) {
          return { ...a, views: a.views + 1 };
        }
        return a;
      })
    );
  }

  createArticle(newArticle: Omit<KmArticle, 'id' | 'views' | 'likes' | 'createdDate'>): KmArticle {
    const id = `art-${String(this._articles().length + 1).padStart(3, '0')}`;
    const article: KmArticle = {
      ...newArticle,
      id,
      views: 1,
      likes: 0,
      createdDate: new Date().toISOString().split('T')[0],
      versionHistory: [
        {
          version: 'v1.0.0',
          date: new Date().toISOString().split('T')[0],
          author: newArticle.author.name,
          avatarUrl: newArticle.author.avatarUrl,
          changeNote: 'สร้างเอกสารองค์ความรู้ฉบับเริ่มต้น',
        },
      ],
    };

    this._articles.update((list) => [article, ...list]);
    return article;
  }
}
