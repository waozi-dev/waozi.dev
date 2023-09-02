const RSS = require('rss');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');  // Ensure you have the js-yaml package installed

const postsDir = path.join(__dirname, 'src', 'posts');
const posts = [];

// Read all YAML files from src/posts
fs.readdirSync(postsDir).forEach(file => {
  if (path.extname(file) === '.yaml') {
    const postData = yaml.load(fs.readFileSync(path.join(postsDir, file), 'utf8'));

    // Assuming your YAML data structure matches the required post structure
    posts.push(postData);
  }
});

const feed = new RSS({
  title: 'Waotzi',
  description: 'Waotzi - Bringing Technology to Life',
  feed_url: 'https://waotzi.org/rss.xml',
  site_url: 'https://waotzi.org',
  image_url: 'https://waotzi.org/assets/favicon.png',
});

posts.forEach(post => {
  feed.item({
    title: post.title,
    description: post.desc,  // Note that I've changed this to "desc" to match the structure you provided earlier
    url: post.url,
    date: new Date(post.date)  // Convert the date string to a Date object
  });
});

const rssFeed = feed.xml({ indent: true });
fs.writeFileSync(path.join(__dirname, 'assets', 'rss.xml'), rssFeed);
