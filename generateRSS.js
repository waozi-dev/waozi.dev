const RSS = require('rss');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const markdownIt = require('markdown-it')();

const postsDir = path.join(__dirname, 'src', 'posts');
const BASE_URL = 'https://waotzi.org';
const posts = [];

const getHashedFilename = (originalFilename) => {
  const distDir = path.join(__dirname, 'dist');
  const files = fs.readdirSync(distDir);

  const hashedFile = files.find(file => file.startsWith(path.basename(originalFilename, path.extname(originalFilename))));

  return hashedFile || originalFilename;
};

fs.readdirSync(postsDir).forEach(file => {
  if (path.extname(file) === '.yaml') {
    const postData = yaml.load(fs.readFileSync(path.join(postsDir, file), 'utf8'));

    // Check if there's an associated .md file
    const mdFilePath = path.join(postsDir, path.basename(file, '.yaml') + '.md');
    if (fs.existsSync(mdFilePath)) {
      let mdContent = fs.readFileSync(mdFilePath, 'utf8');

      if (postData.imgSrc && postData.imgAlt) {
        const hashedImgSrc = getHashedFilename(postData.imgSrc);
        const imgTag = `![${postData.imgAlt}](${BASE_URL}/${hashedImgSrc})\n\n`;
        mdContent = imgTag + mdContent;
      }

      let htmlContent = markdownIt.render(mdContent);

      // Replace relative image paths with absolute paths using hashed names
      htmlContent = htmlContent.replace(
        /<img\s+([^>]*?)src="\/(.*?\.jpg)"/g,
        (match, attributes, imgName) => {
          const hashedImgName = getHashedFilename(imgName);
          return `<img ${attributes}src="${BASE_URL}/${hashedImgName}"`;
        }
      );

      postData.content = htmlContent;
    }

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
    description: post.content || post.desc,  // Use content if available, else use desc
    url: feed.site_url + post.url,
    date: new Date(post.date)
  });
});

const rssFeed = feed.xml({ indent: true });
fs.writeFileSync(path.join(__dirname, 'dist', 'rss.xml'), rssFeed);
