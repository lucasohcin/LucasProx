import https from "node:https";

const DEFAULT_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";

/**
 * Curated popular websites directory so top destinations always appear first and fast
 */
const POPULAR_SITES = [
  {
    keywords: ["youtube", "yt", "video", "videos", "music", "stream"],
    title: "YouTube — Watch, Listen & Stream Videos",
    url: "https://www.youtube.com",
    snippet: "Enjoy the videos and music you love, upload original content, and share it all on YouTube.",
    source: "Featured Site",
  },
  {
    keywords: ["reddit", "forum", "memes", "askreddit", "communities"],
    title: "Reddit — Dive into anything",
    url: "https://old.reddit.com",
    snippet: "Reddit is a network of communities where people can dive into their interests, hobbies and passions.",
    source: "Featured Site",
  },
  {
    keywords: ["wikipedia", "wiki", "encyclopedia", "facts", "history", "science"],
    title: "Wikipedia — The Free Encyclopedia",
    url: "https://en.wikipedia.org",
    snippet: "Millions of free encyclopedia articles written collaboratively by volunteers around the world.",
    source: "Featured Site",
  },
  {
    keywords: ["xbox", "cloud gaming", "xcloud", "game pass", "fortnite", "halo"],
    title: "Xbox Cloud Gaming (Beta) on Xbox.com",
    url: "https://www.xbox.com/en-US/play",
    snippet: "Play hundreds of console games on your device with Xbox Cloud Gaming and Fortnite free-to-play.",
    source: "Cloud Gaming",
  },
  {
    keywords: ["poki", "games", "web games", "online games", "arcade"],
    title: "Poki — Free Online Games — Play Now!",
    url: "https://poki.com",
    snippet: "Play the best free online games on Poki! Instant play with no downloads required.",
    source: "Gaming Portal",
  },
  {
    keywords: ["crazygames", "crazy games", "3d games", "io games"],
    title: "CrazyGames — Free Online Games on CrazyGames.com",
    url: "https://www.crazygames.com",
    snippet: "Play thousands of free HTML5 and WebGL games directly in your browser.",
    source: "Gaming Portal",
  },
  {
    keywords: ["coolmath", "coolmathgames", "math games", "run 3", "papa"],
    title: "Coolmath Games — Free Online Math & Strategy Games",
    url: "https://www.coolmathgames.com",
    snippet: " logic, strategy, skill, and number games for everyone.",
    source: "Gaming Portal",
  },
  {
    keywords: ["itch", "itch.io", "indie games"],
    title: "itch.io — Download and Play the Best Indie Games",
    url: "https://itch.io/games/html5",
    snippet: "Explore thousands of free indie HTML5 web games created by independent developers.",
    source: "Indie Games",
  },
  {
    keywords: ["chess", "chess.com", "board game"],
    title: "Chess.com — Play Chess Online — Free Games",
    url: "https://www.chess.com",
    snippet: "Play chess online for free on Chess.com with over 150 million members from around the world.",
    source: "Featured Site",
  },
  {
    keywords: ["github", "git", "code", "programming", "open source", "repos"],
    title: "GitHub — Let's build from here",
    url: "https://github.com",
    snippet: "GitHub is where over 100 million developers shape the future of software together.",
    source: "Developer",
  },
  {
    keywords: ["stackoverflow", "stack overflow", "coding", "javascript", "python"],
    title: "Stack Overflow — Where Developers Learn & Share",
    url: "https://stackoverflow.com",
    snippet: "The largest, most trusted online community for developers to learn and share programming knowledge.",
    source: "Developer",
  },
  {
    keywords: ["twitch", "live stream", "esports", "gaming stream"],
    title: "Twitch — Interactive Livestreaming Service",
    url: "https://www.twitch.tv",
    snippet: "Twitch is an interactive livestreaming service for content spanning gaming, entertainment, sports, and music.",
    source: "Streaming",
  },
  {
    keywords: ["discord", "chat", "voice", "servers"],
    title: "Discord — Group Chat That's All Fun & Games",
    url: "https://discord.com",
    snippet: "Discord is great for playing games and chilling with friends, or even building a worldwide community.",
    source: "Social",
  },
  {
    keywords: ["archive", "wayback", "internet archive", "retro", "msdos"],
    title: "Internet Archive — Digital Library of Free Books, Movies & Arcade",
    url: "https://archive.org",
    snippet: "Non-profit library of millions of free books, movies, software, music, websites, and classic console games.",
    source: "Archive",
  },
  {
    keywords: ["news", "bbc", "world news", "headlines"],
    title: "BBC News — Breaking News, World & US News",
    url: "https://www.bbc.com/news",
    snippet: "Visit BBC News for up-to-the-minute news, breaking news, video, audio and feature stories.",
    source: "News",
  },
  {
    keywords: ["hacker news", "hn", "yc", "tech news", "startups"],
    title: "Hacker News — Y Combinator Tech & Startup News",
    url: "https://news.ycombinator.com",
    snippet: "Social news website focusing on computer science, software engineering, and entrepreneurship.",
    source: "Tech News",
  },
  {
    keywords: ["espn", "sports", "nba", "nfl", "soccer", "scores"],
    title: "ESPN — Serving Sports Fans. Anytime. Anywhere.",
    url: "https://www.espn.com",
    snippet: "Live scores, sports news, highlights, and commentary for NFL, NBA, MLB, NHL, college sports, and soccer.",
    source: "Sports",
  },
  {
    keywords: ["weather", "forecast", "temperature", "radar"],
    title: "Wttr.in — Instant Global Weather Forecast",
    url: "https://wttr.in",
    snippet: "Fast, clean meteorological weather forecast and radar for any location worldwide.",
    source: "Utility",
  },
];

function fetchJson(url, timeoutMs = 3800) {
  return new Promise((resolve) => {
    const req = https.get(
      url,
      {
        headers: {
          "User-Agent": DEFAULT_UA,
          Accept: "application/json,text/plain,*/*",
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: timeoutMs,
      },
      (res) => {
        if (res.statusCode !== 200) {
          res.resume();
          resolve(null);
          return;
        }
        let body = "";
        res.on("data", (chunk) => {
          body += chunk;
          if (body.length > 512 * 1024) {
            req.destroy();
          }
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(body));
          } catch {
            resolve(null);
          }
        });
      }
    );
    req.on("timeout", () => {
      req.destroy();
      resolve(null);
    });
    req.on("error", () => resolve(null));
  });
}

function stripHtmlTags(str) {
  return String(str || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default async function searchHandler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json; charset=utf-8");

  const reqUrl = new URL(req.url || "/", "http://localhost");
  const query = String(reqUrl.searchParams.get("q") || "").trim();

  if (!query) {
    res.writeHead(200);
    res.end(
      JSON.stringify({
        query: "",
        instant: null,
        results: POPULAR_SITES.slice(0, 8),
      })
    );
    return;
  }

  const lowerQ = query.toLowerCase();

  // Fetch live search data concurrently from DuckDuckGo Instant Answer API, Wikipedia Search API, and Algolia Web Index
  const ddgApiUrl = `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`;
  const wikiSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&utf8=1&format=json&srlimit=10`;
  const hnSearchUrl = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&hitsPerPage=12`;

  const [ddgData, wikiData, hnData] = await Promise.all([
    fetchJson(ddgApiUrl, 3200),
    fetchJson(wikiSearchUrl, 3200),
    fetchJson(hnSearchUrl, 3200),
  ]);

  const seenUrls = new Set();
  const results = [];

  function pushResult(item) {
    if (!item || !item.url || !item.title) return;
    let normalizedUrl;
    try {
      normalizedUrl = new URL(item.url).href;
    } catch {
      return;
    }
    const key = normalizedUrl.replace(/\/$/, "").toLowerCase();
    if (seenUrls.has(key)) return;
    seenUrls.add(key);

    let domain = "";
    try {
      domain = new URL(normalizedUrl).hostname.replace(/^www\./, "");
    } catch {}

    results.push({
      title: stripHtmlTags(item.title),
      url: normalizedUrl,
      domain,
      snippet: stripHtmlTags(item.snippet || item.title),
      source: item.source || "Web",
    });
  }

  // 1. Check Curated Popular Sites
  for (const site of POPULAR_SITES) {
    const matchesKeyword = site.keywords.some(
      (kw) => lowerQ.includes(kw) || kw.includes(lowerQ)
    );
    const matchesTitle = site.title.toLowerCase().includes(lowerQ);
    if (matchesKeyword || matchesTitle) {
      pushResult(site);
    }
  }

  // 2. If user searched a single word (e.g. "spotify", "netflix", "nike", "nasa"), offer direct .com / .org link
  if (/^[a-z0-9-]{2,24}$/i.test(query) && !query.includes(" ")) {
    const cleanWord = query.toLowerCase();
    pushResult({
      title: `${cleanWord.charAt(0).toUpperCase() + cleanWord.slice(1)} (${cleanWord}.com)`,
      url: `https://www.${cleanWord}.com`,
      snippet: `Open https://www.${cleanWord}.com directly inside LucasBrowse.`,
      source: "Direct Domain",
    });
  }

  // 3. Extract Instant Knowledge Card + Official Results from DuckDuckGo Instant Answer API
  let instant = null;
  if (ddgData && typeof ddgData === "object") {
    if (ddgData.AbstractText || ddgData.Heading) {
      let image = ddgData.Image || "";
      if (image && image.startsWith("/")) {
        image = `https://duckduckgo.com${image}`;
      }
      instant = {
        heading: ddgData.Heading || query,
        abstract: ddgData.AbstractText || ddgData.Definition || "",
        url: ddgData.AbstractURL || "",
        source: ddgData.AbstractSource || "Knowledge Graph",
        image,
      };
    }

    // Official site links in ddgData.Results
    if (Array.isArray(ddgData.Results)) {
      for (const r of ddgData.Results) {
        if (r && r.FirstURL) {
          pushResult({
            title: r.Text || ddgData.Heading || r.FirstURL,
            url: r.FirstURL,
            snippet: ddgData.AbstractText || r.Text || "Official website",
            source: "Official Site",
          });
        }
      }
    }

    if (ddgData.AbstractURL && ddgData.AbstractText) {
      pushResult({
        title: `${ddgData.Heading || query} — ${ddgData.AbstractSource || "Encyclopedia"}`,
        url: ddgData.AbstractURL,
        snippet: ddgData.AbstractText,
        source: ddgData.AbstractSource || "Knowledge Graph",
      });
    }

    // RelatedTopics from DuckDuckGo
    if (Array.isArray(ddgData.RelatedTopics)) {
      for (const topic of ddgData.RelatedTopics) {
        if (topic && topic.FirstURL && topic.Text) {
          // Only include external URLs (skip duckduckgo.com internal links since we want direct web results)
          if (!topic.FirstURL.includes("duckduckgo.com")) {
            pushResult({
              title: topic.Text.split(" - ")[0] || topic.Text,
              url: topic.FirstURL,
              snippet: topic.Text,
              source: "Related",
            });
          }
        } else if (topic && Array.isArray(topic.Topics)) {
          for (const sub of topic.Topics) {
            if (sub && sub.FirstURL && sub.Text && !sub.FirstURL.includes("duckduckgo.com")) {
              pushResult({
                title: sub.Text.split(" - ")[0] || sub.Text,
                url: sub.FirstURL,
                snippet: sub.Text,
                source: "Related",
              });
            }
          }
        }
      }
    }
  }

  // 4. Wikipedia Search Results (100% reliable encyclopedia & reference results)
  const wikiItems = wikiData?.query?.search;
  if (Array.isArray(wikiItems)) {
    for (const item of wikiItems) {
      if (!item || !item.title) continue;
      const wikiUrl = `https://en.wikipedia.org/wiki/${encodeURIComponent(item.title.replace(/ /g, "_"))}`;
      const cleanSnippet = stripHtmlTags(item.snippet);
      if (!instant && cleanSnippet) {
        instant = {
          heading: item.title,
          abstract: cleanSnippet,
          url: wikiUrl,
          source: "Wikipedia",
          image: "",
        };
      }
      pushResult({
        title: `${item.title} — Wikipedia`,
        url: wikiUrl,
        snippet: cleanSnippet || `Read the full Wikipedia article on ${item.title}.`,
        source: "Wikipedia",
      });
    }
  }

  // 5. External Web Results from Algolia Web Index (real articles, repos, news, and websites across the internet)
  const hnHits = hnData?.hits;
  if (Array.isArray(hnHits)) {
    for (const hit of hnHits) {
      if (!hit || !hit.url || !hit.title) continue;
      let host = "";
      try {
        host = new URL(hit.url).hostname.replace(/^www\./, "");
      } catch {}
      pushResult({
        title: hit.title,
        url: hit.url,
        snippet:
          hit.story_text
            ? stripHtmlTags(hit.story_text).slice(0, 220)
            : `${hit.title} — Published on ${host || "the web"} (${hit.points || 0} upvotes, ${hit.num_comments || 0} comments).`,
        source: host || "Web",
      });
    }
  }

  res.writeHead(200);
  res.end(
    JSON.stringify({
      query,
      instant,
      results: results.slice(0, 30),
    })
  );
}
