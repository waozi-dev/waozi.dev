const { Feed } = require('feed');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');
const markdownIt = require('markdown-it')();

const postsDir = path.join(__dirname, 'src', 'posts');
const BASE_URL = 'https://waozi.dev';
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

const feed = new Feed({
  title: 'Wao',
  description: 'Waozi - Bringing Technology to Life',
  id: BASE_URL,
  link: BASE_URL,
  image: `${BASE_URL}/logo.png`,
  favicon: `${BASE_URL}/logo.png`,
  copyright: 'Content under Creative Commons Attribution 2023, Waozi',
  updated: new Date(),
  generator: 'Waozi',
  feedLinks: {
    json: `${BASE_URL}/feed.json`,
    atom: `${BASE_URL}/atom.xml`
  },
  author: {
    name: 'Waozi Dev',
    email: 'hello@waozi.dev',
    link: BASE_URL
  }
});

posts.forEach(post => {
  feed.addItem({
    title: post.title,
    id: `${BASE_URL}${post.url}`,
    link: `${BASE_URL}${post.url}`,
    description: post.content || post.desc,
    author: [{
      name: 'Waozi Dev',
      email: 'hello@waozi.dev'
    }],
    date: new Date(post.date)
  });
});

fs.writeFileSync(path.join(__dirname, 'dist', 'rss.xml'), feed.rss2());
fs.writeFileSync(path.join(__dirname, 'dist', 'atom.xml'), feed.atom1());
