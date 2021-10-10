  function getRssFeed() {
    var cache = CacheService.getScriptCache();
    var cached = cache.get("rss-feed-contents");
    if (cached != null) {
      return cached;
    }
    // This fetch takes 20 seconds:
    var result = UrlFetchApp.fetch("http://example.com/my-slow-rss-feed.xml");
    var contents = result.getContentText();
    cache.put("rss-feed-contents", contents, 1500); // cache for 25 minutes
    return contents;
  }