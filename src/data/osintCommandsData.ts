export interface OsintCommand {
  id: string;
  title: string;
  command: string;
  description?: string;
  example?: string;
  isLink?: boolean;
  linkUrl?: string;
}

export interface OsintSubcategory {
  name: string;
  icon: string;
  commands: OsintCommand[];
}

export interface OsintCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
  subcategories: OsintSubcategory[];
}

export const osintCategories: OsintCategory[] = [
  {
    id: "personal",
    name: "Personal Information",
    icon: "👤",
    color: "text-blue-500",
    subcategories: [
      {
        name: "Email & Contact",
        icon: "📧",
        commands: [
          { id: "p1", title: "Find a person's email address", command: `"John Doe" "@gmail.com" | "@yahoo.com" | "@outlook.com" -www` },
          { id: "p2", title: "Find leaked email addresses in data breaches", command: `"John Doe" site:pastebin.com | site:throwbin.io | site:breachforums.st` },
          { id: "p3", title: "Search for email addresses from a specific domain", command: `site:targetcompany.com "@targetcompany.com"` },
          { id: "p4", title: "Search for phone numbers", command: `"John Doe" "phone" | "contact" | "mobile" | "WhatsApp"` },
          { id: "p5", title: "Find a person's email in GitHub repositories", command: `site:github.com "John Doe" "@gmail.com"` },
          { id: "p6", title: "Find leaked phone numbers", command: `"+123456789" site:pastebin.com | site:throwbin.io` },
          { id: "p7", title: "Find email aliases used by a person", command: `site:pastebin.com OR site:throwawaymail.com "JohnDoe@example.com"` },
          { id: "p8", title: "Find an email in GitHub repositories", command: `site:github.com "JohnDoe@example.com"` },
          { id: "p9", title: "Extract emails from a webpage using regex", command: `wget -qO- "https://example.com" | grep -E -o "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"` },
          { id: "p10", title: "Generate possible email variations for a person", command: `echo "John Doe" | awk '{print tolower($1$2"@example.com"), tolower($1"."$2"@example.com"), tolower(substr($1,1,1)$2"@example.com")}'` },
          { id: "p11", title: "Check SPF, DKIM, and DMARC records for an email domain", command: `dig TXT example.com | grep "spf"` },
          { id: "p12", title: "Extract emails from a PDF file", command: `pdfgrep -o "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}" file.pdf` },
          { id: "p13", title: "Extract email addresses from a CSV file", command: `awk -F, '{print $2}' emails.csv | grep -E -o "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"` },
        ],
      },
      {
        name: "Social Media Profiles",
        icon: "🔗",
        commands: [
          { id: "s1", title: "Find all social media accounts of a person", command: `"John Doe" site:linkedin.com | site:facebook.com | site:twitter.com | site:instagram.com` },
          { id: "s2", title: "Find someone's Facebook profile even if hidden", command: `"John Doe" site:facebook.com/public/` },
          { id: "s3", title: "Search for Instagram profiles", command: `site:instagram.com "John Doe"` },
          { id: "s4", title: "Look for forum posts (Quora, Reddit, etc.)", command: `"John Doe" site:reddit.com | site:quora.com | site:stackoverflow.com` },
          { id: "s5", title: "Search for personal blogs and old web profiles", command: `"John Doe" site:medium.com | site:tumblr.com | site:blogspot.com` },
          { id: "s6", title: "Find someone's pictures across the web", command: `"John Doe" site:flickr.com | site:500px.com | site:pinterest.com` },
          { id: "s7", title: "Check username presence across 500+ platforms (Sherlock)", command: `python3 sherlock username` },
          { id: "s8", title: "Advanced username search (Maigret)", command: `python3 maigret.py username` },
          { id: "s9", title: "Find someone's Amazon wishlist", command: `"John Doe" site:amazon.com "wishlist"` },
          { id: "s10", title: "Look for mentions in news articles", command: `"John Doe" site:nytimes.com | site:bbc.com | site:cnn.com` },
        ],
      },
      {
        name: "Resumes, CVs & Work History",
        icon: "📜",
        commands: [
          { id: "r1", title: "Find someone's resume or CV", command: `"John Doe" filetype:pdf | filetype:doc "resume" | "curriculum vitae"` },
          { id: "r2", title: "Look for employment history on LinkedIn", command: `site:linkedin.com/in "John Doe"` },
          { id: "r3", title: "Find past job applications", command: `"John Doe" site:indeed.com | site:glassdoor.com` },
          { id: "r4", title: "Find academic papers or research", command: `site:researchgate.net OR site:academia.edu "John Doe"` },
          { id: "r5", title: "Find an author's books and writings", command: `site:goodreads.com OR site:medium.com OR site:substack.com "John Doe"` },
        ],
      },
      {
        name: "People Search & Records",
        icon: "🔍",
        commands: [
          { id: "ps1", title: "Google dork for public records", command: `"John Doe" site:whitepages.com OR site:spokeo.com OR site:intelius.com` },
          { id: "ps2", title: "Find someone's name linked to a phone number", command: `site:truepeoplesearch.com "123-456-7890"` },
          { id: "ps3", title: "Check court records and criminal history", command: `site:unicourt.com OR site:pacer.gov OR site:arrestfacts.com "John Doe"` },
          { id: "ps4", title: "Find if a person has been involved in a lawsuit", command: `site:justia.com "John Doe" lawsuit OR defendant OR plaintiff` },
          { id: "ps5", title: "Find possible relatives or family members", command: `site:familytreenow.com "John Doe" "New York"` },
          { id: "ps6", title: "Search property ownership records", command: `site:realtor.com OR site:zillow.com "123 Main St, NY"` },
          { id: "ps7", title: "Check political donations (US)", command: `site:opensecrets.org OR site:fec.gov "John Doe"` },
          { id: "ps8", title: "Look up business records or LLC registrations", command: `site:opencorporates.com "John Doe" OR "Doe Enterprises"` },
          { id: "ps9", title: "Find someone's old accounts via Wayback Machine", command: `curl -s "http://web.archive.org/cdx/search/cdx?url=facebook.com/johndoe*&output=text&fl=original"` },
          { id: "ps10", title: "Check phone number with PhoneInfoga", command: `phoneinfoga scan -n "+11234567890"` },
        ],
      },
    ],
  },
  {
    id: "organization",
    name: "Organization Recon",
    icon: "🏢",
    color: "text-emerald-500",
    subcategories: [
      {
        name: "Subdomains & Infrastructure",
        icon: "🌐",
        commands: [
          { id: "o1", title: "Find all subdomains of a company", command: `site:*.targetcompany.com -www` },
          { id: "o2", title: "Search for sensitive open directories", command: `intitle:"index of" site:targetcompany.com` },
          { id: "o3", title: "Check for publicly accessible FTP servers", command: `inurl:ftp:// targetcompany.com` },
          { id: "o4", title: "Find internal company documents", command: `site:targetcompany.com ext:pdf | ext:doc | ext:ppt "confidential"` },
          { id: "o5", title: "Look for job postings to understand tech stack", command: `site:targetcompany.com "hiring" | "we are looking for"` },
          { id: "o6", title: "Check for network devices and login portals", command: `site:targetcompany.com inurl:admin | inurl:dashboard | inurl:login` },
          { id: "o7", title: "Find exposed API endpoints", command: `site:target.com "api/v1/"` },
          { id: "o8", title: "Subfinder – collect subdomains", command: `subfinder -d target.com` },
          { id: "o9", title: "Amass – network mapping", command: `amass enum -d target.com` },
          { id: "o10", title: "Find configuration files", command: `site:targetcompany.com ext:conf | ext:ini | ext:log` },
        ],
      },
      {
        name: "Leaks & Security Issues",
        icon: "🔑",
        commands: [
          { id: "ol1", title: "Search for past security incidents", command: `"targetcompany.com" "data breach" | "leaked database"` },
          { id: "ol2", title: "Look for exposed database files", command: `site:targetcompany.com ext:sql | ext:db | ext:json` },
          { id: "ol3", title: "Find security vulnerabilities related to the org", command: `site:targetcompany.com inurl:CVE- | intext:"vulnerability"` },
          { id: "ol4", title: "Find API keys leaked in GitHub repositories", command: `site:github.com "api_key" | "AWS_SECRET" | "password" targetcompany.com` },
          { id: "ol5", title: "Search for environment files", command: `site:targetcompany.com ext:env "DB_PASSWORD" | "SECRET_KEY"` },
          { id: "ol6", title: "Look for mentions in hacking forums", command: `"targetcompany.com" site:breachforums.st | site:raidforums.com` },
          { id: "ol7", title: "Find exposed .env files", command: `intitle:"index of" "wp-config.php"` },
        ],
      },
      {
        name: "Employee & Corporate Intel",
        icon: "👥",
        commands: [
          { id: "oc1", title: "Look for Employee LinkedIn Profiles", command: `site:linkedin.com "company.com"` },
          { id: "oc2", title: "Find employee emails", command: `"@targetcompany.com" -www` },
          { id: "oc3", title: "Find all employees of a company (theHarvester)", command: `theHarvester -d company.com -b linkedin` },
          { id: "oc4", title: "Extract LinkedIn profile email from commits", command: `git log --pretty=format:"%ae" | sort -u` },
        ],
      },
    ],
  },
  {
    id: "social-media",
    name: "Social Media OSINT",
    icon: "📱",
    color: "text-pink-500",
    subcategories: [
      {
        name: "Twitter (X)",
        icon: "🐦",
        commands: [
          { id: "tw1", title: "Extract tweets, likes, and followers via API", command: `twint -u username --followers --following --tweets` },
          { id: "tw2", title: "Search for leaked credentials in tweets", command: `twint -s "password OR API_KEY OR AWS_SECRET_ACCESS_KEY"` },
          { id: "tw3", title: "Extract followers without rate limits", command: `twint -u username --followers --csv -o followers.csv` },
          { id: "tw4", title: "Find accounts linked to a phone number", command: `twint -s "+1234567890"` },
          { id: "tw5", title: "Monitor target's tweets in real-time", command: `twint -u username --rt` },
          { id: "tw6", title: "Find tweets with geotagged locations", command: `twint -s "keyword" --near "New York"` },
          { id: "tw7", title: "Get tweets from a specific time range", command: `twint -u username --since 2024-01-01 --until 2024-03-01` },
          { id: "tw8", title: "Search tweets via Nitter", command: `curl -s "https://nitter.net/username/search?q=keyword"` },
        ],
      },
      {
        name: "Facebook",
        icon: "📘",
        commands: [
          { id: "fb1", title: "Find all Facebook groups a user is in", command: `google "site:facebook.com/groups username"` },
          { id: "fb2", title: "Find Facebook posts from a specific location", command: `google "site:facebook.com intext:'📍 New York'"` },
          { id: "fb3", title: "Search for Facebook profiles linked to a phone number", command: `google "site:facebook.com intext:'+1234567890'"` },
          { id: "fb4", title: "Search for leaked Facebook IDs in breaches", command: `google "site:pastebin.com facebook.com/profile.php?id="` },
          { id: "fb5", title: "Find a person's Facebook profile by location", command: `site:facebook.com "John Doe" "New York"` },
        ],
      },
      {
        name: "Instagram",
        icon: "📸",
        commands: [
          { id: "ig1", title: "Download all Instagram stories from a target", command: `instaloader --stories username` },
          { id: "ig2", title: "Extract Instagram metadata (location, device info)", command: `instaloader --metadata-json username` },
          { id: "ig3", title: "Find all Instagram profiles linked to an email", command: `google "site:instagram.com intext:email@example.com"` },
          { id: "ig4", title: "Extract geotagged Instagram posts", command: `google "site:instagram.com intext:'📍 London'"` },
          { id: "ig5", title: "Find Instagram users with similar interests", command: `google "site:instagram.com intext:'#hacking #cybersecurity'"` },
        ],
      },
      {
        name: "LinkedIn",
        icon: "💼",
        commands: [
          { id: "li1", title: "Scrape all employees from a company", command: `linkedin-scraper -c "Google"` },
          { id: "li2", title: "Extract job postings and hidden email contacts", command: `google "site:linkedin.com/jobs 'Cybersecurity Analyst' 'Remote'"` },
          { id: "li3", title: "Find LinkedIn profiles with leaked credentials", command: `google "site:linkedin.com/in 'password' OR 'email@example.com'"` },
          { id: "li4", title: "Identify users who worked for a company in the past", command: `google "site:linkedin.com/in 'Worked at Google'"` },
          { id: "li5", title: "Search for LinkedIn users by job title", command: `google "site:linkedin.com/in 'Cybersecurity Researcher' 'India'"` },
        ],
      },
      {
        name: "YouTube",
        icon: "📺",
        commands: [
          { id: "yt1", title: "Download metadata from a YouTube channel", command: `yt-dlp -J "https://www.youtube.com/c/username"` },
          { id: "yt2", title: "Extract subtitles and hidden keywords", command: `yt-dlp --write-auto-sub --skip-download "https://www.youtube.com/watch?v=VIDEO_ID"` },
          { id: "yt3", title: "Find YouTube videos from a specific geolocation", command: `google "site:youtube.com intext:'📍 New York'"` },
          { id: "yt4", title: "Find deleted YouTube videos", command: `google "site:archive.org youtube.com/watch?v="` },
          { id: "yt5", title: "Extract YouTube video analytics", command: `google "site:socialblade.com youtube username"` },
        ],
      },
      {
        name: "TikTok",
        icon: "🎵",
        commands: [
          { id: "tt1", title: "Scrape TikTok videos from a user", command: `tiktok-scraper user username -n 50 -d` },
          { id: "tt2", title: "Extract TikTok comments and engagement", command: `tiktok-scraper user username -t comments` },
          { id: "tt3", title: "Find TikTok accounts linked to an email", command: `google "site:tiktok.com intext:email@example.com"` },
          { id: "tt4", title: "Extract hashtags and trends", command: `google "site:tiktok.com intext:'#OSINT #Cybersecurity'"` },
        ],
      },
      {
        name: "Reddit & Forums",
        icon: "🐮",
        commands: [
          { id: "rd1", title: "Search for deleted Reddit posts", command: `google "site:removeddit.com user username"` },
          { id: "rd2", title: "Find Reddit users discussing a keyword", command: `google "site:reddit.com 'keyword' 'thread'"` },
          { id: "rd3", title: "Extract all posts made by a Reddit user", command: `reddit-scraper -s "username"` },
          { id: "rd4", title: "Find Reddit users who commented on a specific post", command: `google "site:reddit.com inurl:comments 'keyword'"` },
        ],
      },
      {
        name: "GitHub",
        icon: "🦉",
        commands: [
          { id: "gh1", title: "Search for exposed API keys in GitHub", command: `google "site:github.com intext:'AWS_SECRET_ACCESS_KEY'"` },
          { id: "gh2", title: "Find GitHub repositories linked to an email", command: `google "site:github.com intext:'email@example.com'"` },
          { id: "gh3", title: "Search for leaked credentials in GitHub", command: `google "site:github.com intext:'password='"` },
          { id: "gh4", title: "Find email addresses in GitHub commits", command: `git log --pretty=format:"%ae" | sort -u` },
        ],
      },
      {
        name: "Telegram & WhatsApp",
        icon: "📞",
        commands: [
          { id: "tg1", title: "Search for Telegram groups related to a topic", command: `google "site:t.me keyword"` },
          { id: "tg2", title: "Extract messages from a public Telegram group", command: `telegram-history-dump -c "https://t.me/group_name"` },
          { id: "wa1", title: "Find public WhatsApp groups", command: `google "site:chat.whatsapp.com keyword"` },
          { id: "wa2", title: "Check if a phone number is linked to WhatsApp", command: `curl -s "https://api.whatsapp.com/send?phone=+1234567890"` },
        ],
      },
      {
        name: "Discord & Other",
        icon: "🎮",
        commands: [
          { id: "dc1", title: "Find Discord servers related to a keyword", command: `google "site:discord.gg keyword"` },
          { id: "dc2", title: "Search for Discord user profiles", command: `google "site:discord.com users username"` },
          { id: "sn1", title: "Find public Snapchat stories", command: `google "site:map.snapchat.com username"` },
          { id: "pt1", title: "Find all Pinterest boards of a user", command: `google "site:pinterest.com/username"` },
        ],
      },
    ],
  },
  {
    id: "dark-web",
    name: "Dark Web & Leaked Data",
    icon: "🕵️",
    color: "text-red-500",
    subcategories: [
      {
        name: "Leaked Credentials",
        icon: "🔑",
        commands: [
          { id: "dw1", title: "Check if an email is breached (Have I Been Pwned)", command: `curl -s "https://haveibeenpwned.com/api/v3/breachedaccount/test@example.com" -H "hibp-api-key: YOUR_API_KEY"`, isLink: true, linkUrl: "https://haveibeenpwned.com/" },
          { id: "dw2", title: "Find leaked databases on Pastebin", command: `site:pastebin.com "password" "target.com"` },
          { id: "dw3", title: "Search for leaked credentials on the dark web", command: `site:darksearch.io "email@example.com"` },
          { id: "dw4", title: "H8mail – search for leaked credentials", command: `h8mail -t email@example.com` },
          { id: "dw5", title: "GHunt – extract data from Google accounts", command: `python3 ghunt.py email@example.com` },
          { id: "dw6", title: "Search breached email data (Dehashed API)", command: `curl -u "user:password" -X GET "https://api.dehashed.com/search?query=test@example.com"` },
          { id: "dw7", title: "Search for leaked credentials using DeHashed", command: `dehashed -q email@example.com` },
        ],
      },
      {
        name: "Dark Web Search",
        icon: "🧕",
        commands: [
          { id: "dws1", title: "Search keywords on Ahmia (Tor Search Engine)", command: `torify curl -s "https://ahmia.fi/search/?q=your_keyword"` },
          { id: "dws2", title: "Search on OnionLand", command: `torify curl -s "https://onionlandsearchengine.com/search?q=your_keyword"` },
          { id: "dws3", title: "Extract all .onion links from a webpage", command: `torify curl -s "http://example.onion" | grep -oP '(?<=href=")http://[^"]+\\.onion'` },
          { id: "dws4", title: "Find indexed .onion sites on DuckDuckGo", command: `torify curl -s "https://www.duckduckgo.com/html?q=site:onion your_keyword"` },
          { id: "dws5", title: "Check if a dark web site is online", command: `torify curl -Is http://example.onion | head -n 1` },
          { id: "dws6", title: "TorBot – automate OSINT on dark web sites", command: `git clone https://github.com/DedSecInside/TorBot.git` },
          { id: "dws7", title: "OnionSearch – search dark web for stolen data", command: `python3 onionsearch.py target` },
        ],
      },
      {
        name: "Paste Sites",
        icon: "📋",
        commands: [
          { id: "ps1b", title: "Search for leaked credentials on Pastebin", command: `curl -s "https://www.google.com/search?q=site:pastebin.com your_keyword"` },
          { id: "ps2b", title: "Scrape Pastebin for recent pastes", command: `curl -s "https://scrape.pastebin.com/api_scraping.php?limit=10"` },
          { id: "ps3b", title: "Check for mentions of an email in recent pastes", command: `curl -s "https://www.google.com/search?q=site:pastebin.com your_email@example.com"` },
          { id: "ps4b", title: "Find pastes mentioning a specific domain", command: `curl -s "https://www.google.com/search?q=site:pastebin.com yourdomain.com"` },
        ],
      },
      {
        name: "Exposed Databases & Cloud",
        icon: "📂",
        commands: [
          { id: "db1", title: "Find public Firebase databases", command: `site:firebasestorage.googleapis.com` },
          { id: "db2", title: "Find public AWS S3 buckets", command: `site:s3.amazonaws.com "target"` },
          { id: "db3", title: "Find public Google Drive links", command: `site:drive.google.com "confidential"` },
          { id: "db4", title: "Find government & military docs", command: `site:gov OR site:mil filetype:pdf "confidential"` },
          { id: "db5", title: "Look for API keys in GitHub repositories", command: `site:github.com "api_key" "secret"` },
        ],
      },
    ],
  },
  {
    id: "geolocation",
    name: "Geolocation & Tracking",
    icon: "📍",
    color: "text-amber-500",
    subcategories: [
      {
        name: "Image & Metadata",
        icon: "📌",
        commands: [
          { id: "g1", title: "Extract GPS from image metadata (ExifTool)", command: `exiftool image.jpg | grep -i "GPS"` },
          { id: "g2", title: "Extract metadata from videos", command: `ffmpeg -i video.mp4 -f ffmetadata metadata.txt` },
          { id: "g3", title: "Reverse image search (Google)", command: `curl -F 'encoded_image=@image.jpg' https://www.google.com/searchbyimage` },
          { id: "g4", title: "Extract GPS coordinates from photos", command: `exiftool image.jpg | grep -E "GPS Latitude|GPS Longitude"` },
        ],
      },
      {
        name: "IP Geolocation",
        icon: "🌐",
        commands: [
          { id: "ip1", title: "Find location from an IP address", command: `curl -s "http://ip-api.com/json/8.8.8.8"` },
          { id: "ip2", title: "Detailed IP location data (ISP & ASN)", command: `curl -s "https://ipinfo.io/8.8.8.8/json"` },
          { id: "ip3", title: "Get approximate IP location from Shodan", command: `shodan search "ip:xxx.xxx.xxx.xxx"` },
        ],
      },
      {
        name: "Reverse Geocoding & Mapping",
        icon: "🗺️",
        commands: [
          { id: "geo1", title: "Find address from GPS coordinates", command: `curl -s "https://nominatim.openstreetmap.org/reverse?format=json&lat=40.748817&lon=-73.985428"` },
          { id: "geo2", title: "Find nearby locations using OpenStreetMap", command: `curl -s "https://nominatim.openstreetmap.org/search?q=Eiffel+Tower&format=json"` },
          { id: "geo3", title: "Get geolocation from phone number", command: `python3 phoneinfoga.py -n +1234567890` },
        ],
      },
      {
        name: "Wi-Fi, Bluetooth & Mobile",
        icon: "📡",
        commands: [
          { id: "wf1", title: "Find location from Wi-Fi BSSID", command: `curl "https://wigle.net/api/v2/network/search?netid=XX:XX:XX:XX:XX:XX"` },
          { id: "wf2", title: "Check if a Wi-Fi SSID has been mapped", command: `curl -s "https://api.mylnikov.org/geolocation/wifi?v=1.1&bssid=XX:XX:XX:XX:XX:XX"` },
          { id: "wf3", title: "Check cell tower geolocation", command: `curl -s "https://opencellid.org/cell/get?mcc=310&mnc=410&lac=7033&cellid=17811&key=YOUR_API_KEY"` },
        ],
      },
      {
        name: "Vehicle & Transport Tracking",
        icon: "🚗",
        commands: [
          { id: "vt1", title: "Find ship locations (AIS data)", command: `https://www.marinetraffic.com/`, isLink: true, linkUrl: "https://www.marinetraffic.com/" },
          { id: "vt2", title: "Find aircraft locations (real-time)", command: `https://www.flightradar24.com/`, isLink: true, linkUrl: "https://www.flightradar24.com/" },
          { id: "vt3", title: "Check past travel history via flight logs", command: `site:flightaware.com OR site:flightradar24.com "John Doe"` },
        ],
      },
    ],
  },
  {
    id: "google-dorks",
    name: "Google Dorks",
    icon: "🔎",
    color: "text-yellow-500",
    subcategories: [
      {
        name: "Sensitive Documents",
        icon: "📄",
        commands: [
          { id: "gd1", title: "Find sensitive PDF documents", command: `filetype:pdf OR filetype:docx "confidential" OR "internal"` },
          { id: "gd2", title: "Find plaintext passwords", command: `intext:"password" filetype:log` },
          { id: "gd3", title: "Search for exposed email lists", command: `site:pastebin.com "email" | "password"` },
          { id: "gd4", title: "Locate hidden admin panels", command: `site:target.com inurl:admin` },
          { id: "gd5", title: "Find PDFs & documents containing emails", command: `filetype:pdf OR filetype:docx OR filetype:xls intext:"@gmail.com"` },
          { id: "gd6", title: "Find internal reports", command: `site:target.com filetype:pdf "confidential"` },
          { id: "gd7", title: "Find login pages", command: `site:target.com inurl:login` },
          { id: "gd8", title: "Find personal information on a website", command: `site:target.com intext:"phone number" OR "email" OR "address"` },
        ],
      },
      {
        name: "Cached & Deleted Content",
        icon: "🕰️",
        commands: [
          { id: "gc1", title: "Find deleted pages via Wayback Machine", command: `site:web.archive.org target.com` },
          { id: "gc2", title: "Wayback Machine CDX API query", command: `curl "http://web.archive.org/cdx/search/cdx?url=target.com&output=json"` },
          { id: "gc3", title: "Find deleted social media posts", command: `cache:twitter.com/johndoe OR cache:facebook.com/johndoe` },
          { id: "gc4", title: "Clone websites for offline analysis (HTTrack)", command: `httrack https://target.com` },
          { id: "gc5", title: "Download full websites (wget)", command: `wget -r -np -k https://target.com` },
        ],
      },
      {
        name: "SQL & Database Dumps",
        icon: "🗂️",
        commands: [
          { id: "sq1", title: "Find public Firebase databases", command: `site:firebasestorage.googleapis.com` },
          { id: "sq2", title: "Search for SQL dumps", command: `site:targetcompany.com ext:sql | ext:db | ext:json` },
          { id: "sq3", title: "Find exposed .env files (credentials)", command: `intitle:"index of" ".env"` },
        ],
      },
    ],
  },
  {
    id: "automation",
    name: "Automation Tools",
    icon: "🚀",
    color: "text-purple-500",
    subcategories: [
      {
        name: "Recon Frameworks",
        icon: "🛠️",
        commands: [
          { id: "at1", title: "theHarvester – gather emails & subdomains", command: `theHarvester -d target.com -b all` },
          { id: "at2", title: "Metagoofil – extract metadata from files", command: `metagoofil -d target.com -t pdf -o results/` },
          { id: "at3", title: "Sublist3r – find subdomains", command: `python sublist3r.py -d target.com` },
          { id: "at4", title: "GoBuster – find hidden directories", command: `gobuster dir -u target.com -w wordlist.txt` },
          { id: "at5", title: "Dirsearch – advanced directory brute-forcing", command: `python3 dirsearch.py -u target.com -e php,html,js` },
          { id: "at6", title: "Photon – scrape all links from a website", command: `python3 photon.py -u example.com` },
          { id: "at7", title: "Holehe – check if email is linked to accounts", command: `holehe username@example.com` },
        ],
      },
      {
        name: "Network & Infrastructure",
        icon: "📡",
        commands: [
          { id: "ni1", title: "Shodan – search exposed servers, IoT devices", command: `shodan search "Default password"`, isLink: true, linkUrl: "https://www.shodan.io/" },
          { id: "ni2", title: "Find SSL certificates (CRT.sh)", command: `curl -s "https://crt.sh/?q=%25example.com&output=json" | jq .`, isLink: true, linkUrl: "https://crt.sh/" },
        ],
      },
      {
        name: "Metadata Extraction",
        icon: "🔑",
        commands: [
          { id: "me1", title: "ExifTool – extract metadata from images & docs", command: `exiftool image.jpg` },
          { id: "me2", title: "Strings – find hidden text in binary files", command: `strings file.bin` },
          { id: "me3", title: "Extract emails from a Word document", command: `strings file.docx | grep -E -o "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}"` },
        ],
      },
    ],
  },
  {
    id: "government",
    name: "Government & Public Records",
    icon: "🏛️",
    color: "text-cyan-500",
    subcategories: [
      {
        name: "FOIA & Public Records",
        icon: "📋",
        commands: [
          { id: "gov1", title: "U.S. FOIA Request Guide", command: `curl -s "https://www.foia.gov/how-to.html"` },
          { id: "gov2", title: "U.S. State-Level FOIA Directories", command: `curl -s "https://www.nfoic.org/coalitions/state-foi-resources/"` },
          { id: "gov3", title: "UK Freedom of Information Requests", command: `curl -s "https://www.whatdotheyknow.com/"`, isLink: true, linkUrl: "https://www.whatdotheyknow.com/" },
          { id: "gov4", title: "EU Public Documents & Transparency", command: `curl -s "https://www.asktheeu.org/en/request/new"`, isLink: true, linkUrl: "https://www.asktheeu.org/" },
        ],
      },
      {
        name: "Law Enforcement & Criminal Records",
        icon: "🚓",
        commands: [
          { id: "le1", title: "U.S. DOJ Press Releases", command: `curl -s "https://www.justice.gov/news?q=John+Doe"` },
          { id: "le2", title: "Interpol Stolen Works of Art Database", command: `curl -s "https://www.interpol.int/en/Crimes/Cultural-heritage-crime/Stolen-Works-of-Art-Database"` },
          { id: "le3", title: "U.S. Most Wanted by State", command: `curl -s "https://www.usmarshals.gov/investigations/most_wanted/state.htm?q=Texas"` },
          { id: "le4", title: "DEA Fugitives List", command: `curl -s "https://www.dea.gov/fugitives?q=John+Doe"` },
        ],
      },
      {
        name: "Court Cases & Judgments",
        icon: "⚖️",
        commands: [
          { id: "ct1", title: "U.S. Supreme Court Case Lookup (Oyez)", command: `curl -s "https://www.oyez.org/cases?q=John+Doe"` },
          { id: "ct2", title: "UK Supreme Court Case Tracker", command: `curl -s "https://www.supremecourt.uk/cases/search.html?q=John+Doe"` },
          { id: "ct3", title: "India Court Case Search (e-Courts Portal)", command: `curl -s "https://ecourts.gov.in/services/cases?q=John+Doe"` },
          { id: "ct4", title: "European Court of Human Rights Cases", command: `curl -s "https://hudoc.echr.coe.int/eng#{%22fulltext%22:[%22John+Doe%22]}"` },
        ],
      },
      {
        name: "Financial & Tax Records",
        icon: "💰",
        commands: [
          { id: "fi1", title: "U.S. Federal Reserve Enforcement Actions", command: `curl -s "https://www.federalreserve.gov/supervisionreg/enforcement-actions.htm?q=John+Doe"` },
          { id: "fi2", title: "U.S. OFAC Sanctions List", command: `curl -s "https://sanctionssearch.ofac.treas.gov/"`, isLink: true, linkUrl: "https://sanctionssearch.ofac.treas.gov/" },
          { id: "fi3", title: "European Central Bank Enforcement Actions", command: `curl -s "https://www.bankingsupervision.europa.eu/banking/sanctions/html/index.en.html?q=John+Doe"` },
        ],
      },
      {
        name: "Intelligence & Military",
        icon: "🛰️",
        commands: [
          { id: "im1", title: "U.S. CIA FOIA Reading Room", command: `curl -s "https://www.cia.gov/readingroom/search/site/John+Doe"` },
          { id: "im2", title: "FBI Vault (Declassified Records)", command: `curl -s "https://vault.fbi.gov/search?q=John+Doe"` },
          { id: "im3", title: "U.S. DoD Contracts & Spending", command: `curl -s "https://www.defense.gov/News/Contracts/Search?q=CompanyName"` },
          { id: "im4", title: "UK Ministry of Defence FOI Disclosures", command: `curl -s "https://www.gov.uk/government/publications?departments%5B%5D=ministry-of-defence&q=John+Doe"` },
        ],
      },
      {
        name: "Identity & Vital Records",
        icon: "👤",
        commands: [
          { id: "ir1", title: "U.S. Census Bureau Public Records", command: `curl -s "https://data.census.gov/cedsci/?q=John+Doe"` },
          { id: "ir2", title: "UK Births, Marriages & Deaths (GRO Index)", command: `curl -s "https://www.gro.gov.uk/gro/content/certificates/"` },
          { id: "ir3", title: "India Aadhaar Card Verification", command: `curl -s "https://uidai.gov.in/ecosystem/authentication-services.html"` },
        ],
      },
    ],
  },
  {
    id: "satellite",
    name: "Satellite & Aerial OSINT",
    icon: "🛰️",
    color: "text-indigo-500",
    subcategories: [
      {
        name: "Satellite Imagery",
        icon: "🌍",
        commands: [
          { id: "sat1", title: "Planet Explorer – live satellite imagery", command: `https://www.planet.com/explorer/`, isLink: true, linkUrl: "https://www.planet.com/explorer/" },
          { id: "sat2", title: "EOS LandViewer – past satellite images", command: `https://eos.com/landviewer/`, isLink: true, linkUrl: "https://eos.com/landviewer/" },
          { id: "sat3", title: "NASA Earth Data", command: `https://earthdata.nasa.gov/`, isLink: true, linkUrl: "https://earthdata.nasa.gov/" },
          { id: "sat4", title: "Historical satellite images (ArcGIS)", command: `https://livingatlas.arcgis.com/wayback/`, isLink: true, linkUrl: "https://livingatlas.arcgis.com/wayback/" },
          { id: "sat5", title: "Google Earth Historical Imagery", command: `https://earth.google.com/`, isLink: true, linkUrl: "https://earth.google.com/" },
        ],
      },
      {
        name: "Reverse Image & Face Recognition",
        icon: "🔍",
        commands: [
          { id: "ri1", title: "Yandex – best for finding hidden profiles", command: `https://yandex.com/images`, isLink: true, linkUrl: "https://yandex.com/images" },
          { id: "ri2", title: "PimEyes – AI-powered face recognition", command: `https://pimeyes.com/`, isLink: true, linkUrl: "https://pimeyes.com/" },
          { id: "ri3", title: "TinEye – reverse image lookup", command: `https://tineye.com/`, isLink: true, linkUrl: "https://tineye.com/" },
          { id: "ri4", title: "Google Lens – identifies faces, places, objects", command: `https://lens.google/`, isLink: true, linkUrl: "https://lens.google/" },
        ],
      },
    ],
  },
];
